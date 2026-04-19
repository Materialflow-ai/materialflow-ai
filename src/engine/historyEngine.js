// MaterialFlow AI — Version History Engine
// Manages project checkpoints with undo/redo and diff computation

const MAX_HISTORY = 50;

/**
 * Create a new history manager for a project
 */
export function createHistory() {
  return {
    entries: [],
    currentIndex: -1,
  };
}

/**
 * Push a new checkpoint to history
 * @param {Object} history - History state
 * @param {Object} snapshot - { files, html, timestamp, label }
 * @returns {Object} Updated history
 */
export function pushCheckpoint(history, snapshot) {
  const entries = history.entries.slice(0, history.currentIndex + 1);

  entries.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    files: { ...snapshot.files },
    html: snapshot.html,
    timestamp: Date.now(),
    label: snapshot.label || 'Auto-save',
  });

  // Trim to max
  while (entries.length > MAX_HISTORY) entries.shift();

  return {
    entries,
    currentIndex: entries.length - 1,
  };
}

/**
 * Undo — go back one step
 */
export function undo(history) {
  if (history.currentIndex <= 0) return null;
  const newIndex = history.currentIndex - 1;
  return {
    history: { ...history, currentIndex: newIndex },
    snapshot: history.entries[newIndex],
  };
}

/**
 * Redo — go forward one step
 */
export function redo(history) {
  if (history.currentIndex >= history.entries.length - 1) return null;
  const newIndex = history.currentIndex + 1;
  return {
    history: { ...history, currentIndex: newIndex },
    snapshot: history.entries[newIndex],
  };
}

/**
 * Check if undo/redo is available
 */
export function canUndo(history) {
  return history.currentIndex > 0;
}

export function canRedo(history) {
  return history.currentIndex < history.entries.length - 1;
}

/**
 * Get the current snapshot
 */
export function currentSnapshot(history) {
  if (history.currentIndex < 0 || history.entries.length === 0) return null;
  return history.entries[history.currentIndex];
}

/**
 * Get all history entries (for timeline UI)
 */
export function getTimeline(history) {
  return history.entries.map((entry, index) => ({
    ...entry,
    isCurrent: index === history.currentIndex,
    isUndone: index > history.currentIndex,
  }));
}

/**
 * Jump to a specific checkpoint by index
 */
export function jumpTo(history, index) {
  if (index < 0 || index >= history.entries.length) return null;
  return {
    history: { ...history, currentIndex: index },
    snapshot: history.entries[index],
  };
}

/**
 * Compute a simple diff between two file maps
 */
export function computeDiff(oldFiles, newFiles) {
  const changes = [];

  for (const [path, content] of Object.entries(newFiles)) {
    if (!(path in oldFiles)) {
      changes.push({ type: 'added', path, linesAdded: content.split('\n').length });
    } else if (oldFiles[path] !== content) {
      const oldLines = oldFiles[path].split('\n').length;
      const newLines = content.split('\n').length;
      changes.push({ type: 'modified', path, linesAdded: Math.max(0, newLines - oldLines), linesRemoved: Math.max(0, oldLines - newLines) });
    }
  }

  for (const path of Object.keys(oldFiles)) {
    if (!(path in newFiles)) {
      changes.push({ type: 'deleted', path, linesRemoved: oldFiles[path].split('\n').length });
    }
  }

  return changes;
}

/**
 * Serialize history for localStorage persistence
 */
export function serializeHistory(history) {
  // Only keep last 10 entries to save space
  const trimmed = {
    entries: history.entries.slice(-10),
    currentIndex: Math.min(history.currentIndex, 9),
  };
  return JSON.stringify(trimmed);
}

/**
 * Deserialize history from localStorage
 */
export function deserializeHistory(json) {
  try {
    const parsed = JSON.parse(json);
    return {
      entries: parsed.entries || [],
      currentIndex: parsed.currentIndex ?? -1,
    };
  } catch {
    return createHistory();
  }
}
