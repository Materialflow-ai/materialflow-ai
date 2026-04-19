import React, { useMemo } from 'react';
import { SandpackProvider, SandpackPreview as SandpackPrev, SandpackConsole } from '@codesandbox/sandpack-react';

/**
 * SandpackPreview — wraps @codesandbox/sandpack-react for real NPM bundling
 * Used when the project contains JSX/TSX files that need a real bundler
 */
export default function SandpackPreview({ files, dependencies = {}, theme = 'dark', onError }) {
  // Transform our file map to Sandpack format
  const sandpackFiles = useMemo(() => {
    const spFiles = {};

    for (const [path, content] of Object.entries(files)) {
      // Sandpack needs leading slash
      const key = path.startsWith('/') ? path : `/${path}`;
      spFiles[key] = { code: content };
    }

    // Ensure there's an entry point
    if (!spFiles['/index.html'] && !spFiles['/src/index.js'] && !spFiles['/src/index.tsx']) {
      // Create a minimal React entry point if App exists
      const appPath = Object.keys(spFiles).find(k => k.match(/App\.(jsx|tsx|js|ts)$/));
      if (appPath) {
        const ext = appPath.includes('tsx') ? 'tsx' : 'jsx';
        spFiles[`/src/index.${ext}`] = {
          code: `import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\n\nconst root = createRoot(document.getElementById("root"));\nroot.render(<App />);`,
        };
        spFiles['/public/index.html'] = {
          code: '<!DOCTYPE html>\n<html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body><div id="root"></div></body></html>',
        };
      }
    }

    return spFiles;
  }, [files]);

  // Build dependency map
  const deps = useMemo(() => {
    const base = {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    };

    // Parse package.json from files if present
    const pkgJson = files['package.json'];
    if (pkgJson) {
      try {
        const pkg = JSON.parse(pkgJson);
        Object.assign(base, pkg.dependencies || {});
      } catch (e) { /* skip */ }
    }

    // Merge explicit dependencies
    Object.assign(base, dependencies);

    return base;
  }, [files, dependencies]);

  // Determine template
  const template = useMemo(() => {
    const hasTS = Object.keys(files).some(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    return hasTS ? 'react-ts' : 'react';
  }, [files]);

  const sandpackTheme = useMemo(() => ({
    colors: {
      surface1: theme === 'dark' ? '#0C0C14' : '#FFFFFF',
      surface2: theme === 'dark' ? '#18182A' : '#F8F9FA',
      surface3: theme === 'dark' ? '#20203A' : '#F1F3F5',
      clickable: theme === 'dark' ? '#9AA0A6' : '#4A5568',
      base: theme === 'dark' ? '#E8EAED' : '#1A1A2E',
      disabled: theme === 'dark' ? '#5F6368' : '#8895A7',
      hover: theme === 'dark' ? '#8AB4F8' : '#4285F4',
      accent: theme === 'dark' ? '#8AB4F8' : '#4285F4',
      error: '#F28B82',
      errorSurface: '#2D1B1B',
    },
    font: {
      body: "'Inter', -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
      size: '13px',
      lineHeight: '1.5',
    },
  }), [theme]);

  if (Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="sandpack-empty" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>
        No files to preview
      </div>
    );
  }

  return (
    <div className="sandpack-container">
      {/* Package indicator */}
      {Object.keys(deps).length > 2 && (
        <div className="sandpack-packages-bar">
          <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, marginRight: 4 }}>PACKAGES:</span>
          {Object.entries(deps).filter(([k]) => k !== 'react' && k !== 'react-dom').map(([name, version]) => (
            <span key={name} className="sandpack-pkg-chip">{name}@{version}</span>
          ))}
        </div>
      )}
      <SandpackProvider
        template={template}
        files={sandpackFiles}
        customSetup={{ dependencies: deps }}
        theme={sandpackTheme}
        options={{
          externalResources: ['https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'],
          autorun: true,
          autoReload: true,
        }}
      >
        <SandpackPrev
          showOpenInCodeSandbox={false}
          showRefreshButton={true}
          style={{ flex: 1, minHeight: 0 }}
        />
      </SandpackProvider>
    </div>
  );
}

/**
 * Check if a project should use Sandpack vs raw iframe
 */
export function shouldUseSandpack(files) {
  if (!files || Object.keys(files).length === 0) return false;
  return Object.keys(files).some(f =>
    f.endsWith('.jsx') || f.endsWith('.tsx') || f.endsWith('.vue') || f.endsWith('.svelte') ||
    f === 'package.json'
  );
}
