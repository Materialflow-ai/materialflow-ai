// MaterialFlow AI — Diff Engine
// Parses tool-use responses and applies surgical file patches
// Supports create_file, edit_file, delete_file operations

/**
 * Apply a tool result to the current file map
 * @param {Object} files - Current files map { path: content }
 * @param {Object} toolResult - Tool call result from API
 * @returns {{ files: Object, changedFiles: string[], action: string }}
 */
export function applyToolResult(files, toolResult) {
  const { name, input } = toolResult;
  const updatedFiles = { ...files };
  const changedFiles = [];
  let action = '';

  switch (name) {
    case 'create_file':
    case 'write_file': {
      const { path, content } = input;
      updatedFiles[path] = content;
      changedFiles.push(path);
      action = `Created ${path}`;
      break;
    }

    case 'edit_file':
    case 'write_file_chunk': {
      const { path, search, replace } = input;
      if (updatedFiles[path] && search) {
        updatedFiles[path] = updatedFiles[path].replace(search, replace || '');
        changedFiles.push(path);
        action = `Edited ${path}`;
      } else if (input.content) {
        updatedFiles[path] = input.content;
        changedFiles.push(path);
        action = `Updated ${path}`;
      }
      break;
    }

    case 'delete_file': {
      const { path } = input;
      if (updatedFiles[path]) {
        delete updatedFiles[path];
        changedFiles.push(path);
        action = `Deleted ${path}`;
      }
      break;
    }

    case 'read_file': {
      // Read-only operation, no file changes
      action = `Read ${input.path}`;
      break;
    }

    case 'list_files': {
      action = 'Listed project files';
      break;
    }

    case 'search_npm': {
      action = `Searched NPM for "${input.query}"`;
      break;
    }

    case 'add_dependency': {
      const { name: pkgName, version } = input;
      // Update or create package.json
      let pkg = {};
      try {
        pkg = JSON.parse(updatedFiles['package.json'] || '{}');
      } catch (e) {
        pkg = { name: 'app', version: '1.0.0', dependencies: {} };
      }
      if (!pkg.dependencies) pkg.dependencies = {};
      pkg.dependencies[pkgName] = version || 'latest';
      updatedFiles['package.json'] = JSON.stringify(pkg, null, 2);
      changedFiles.push('package.json');
      action = `Added dependency ${pkgName}`;
      break;
    }

    default:
      action = `Unknown tool: ${name}`;
  }

  return { files: updatedFiles, changedFiles, action };
}

/**
 * Parse streaming tool-use events into structured operations
 * @param {string} fullText - Full streamed text containing tool calls
 * @returns {Array<{name: string, input: Object}>}
 */
export function parseToolCalls(fullText) {
  const toolCalls = [];

  // Parse JSON tool call blocks
  const toolRegex = /```tool_call\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = toolRegex.exec(fullText)) !== null) {
    try {
      const toolCall = JSON.parse(match[1]);
      toolCalls.push(toolCall);
    } catch (e) {
      // Skip malformed tool calls
    }
  }

  return toolCalls;
}

/**
 * Determine if preview needs rebuild based on changed files
 * @param {string[]} changedFiles - List of changed file paths
 * @returns {boolean}
 */
export function needsPreviewRebuild(changedFiles) {
  const previewTriggers = [
    '.html', '.htm', '.css', '.scss', '.less',
    '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte',
    'package.json',
  ];

  return changedFiles.some(file =>
    previewTriggers.some(ext => file.endsWith(ext))
  );
}

/**
 * Calculate diff summary between old and new file maps
 * @param {Object} oldFiles
 * @param {Object} newFiles
 * @returns {{ created: string[], modified: string[], deleted: string[] }}
 */
export function diffFileMaps(oldFiles, newFiles) {
  const created = [];
  const modified = [];
  const deleted = [];

  // Find created and modified
  for (const [path, content] of Object.entries(newFiles)) {
    if (!(path in oldFiles)) {
      created.push(path);
    } else if (oldFiles[path] !== content) {
      modified.push(path);
    }
  }

  // Find deleted
  for (const path of Object.keys(oldFiles)) {
    if (!(path in newFiles)) {
      deleted.push(path);
    }
  }

  return { created, modified, deleted };
}
