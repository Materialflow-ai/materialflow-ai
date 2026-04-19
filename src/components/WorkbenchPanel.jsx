import React, { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { Code2, Eye, Maximize2, Copy, Check, RefreshCw, ExternalLink, QrCode, Smartphone, TabletSmartphone, AlertTriangle, Wrench, X, Globe, Github, Loader2, MousePointerClick, Package } from 'lucide-react';
import SandpackPreview, { shouldUseSandpack } from './SandpackPreview';

export default function WorkbenchPanel({ activeTab, onTabChange, html, files, platform, hasContent, agentStatus, deployedUrl, githubRepo, previewErrors, onFixError, streamingText, onCodeChange, theme, inspectMode, onToggleInspect, onInspectSelect }) {
  const [copied, setCopied] = useState(false);
  const [runtimeErrors, setRuntimeErrors] = useState([]);
  const iframeRef = useRef(null);

  const handleCopy = () => {
    if (html) {
      navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Listen for iframe errors and inspect mode messages
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'preview-error') {
        setRuntimeErrors(prev => [...prev.slice(-4), { message: e.data.message, line: e.data.line, time: Date.now() }]);
      }
      if (e.data?.type === 'inspect-element' && onInspectSelect) {
        onInspectSelect({
          html: e.data.html,
          selector: e.data.selector,
          tagName: e.data.tagName,
          className: e.data.className,
          textContent: e.data.textContent,
        });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onInspectSelect]);

  // Inject error catcher + inspect mode script into HTML
  const inspectScript = inspectMode ? `
<style>
  .__mf-inspect-hover { outline: 2px solid #8AB4F8 !important; outline-offset: 2px; cursor: crosshair !important; }
  .__mf-inspect-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 99999; cursor: crosshair; }
</style>
<script>
(function() {
  let lastHovered = null;
  document.addEventListener('mouseover', function(e) {
    if (e.target === document.body || e.target === document.documentElement) return;
    if (lastHovered) lastHovered.classList.remove('__mf-inspect-hover');
    e.target.classList.add('__mf-inspect-hover');
    lastHovered = e.target;
  }, true);
  document.addEventListener('mouseout', function(e) {
    if (lastHovered) lastHovered.classList.remove('__mf-inspect-hover');
    lastHovered = null;
  }, true);
  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    var el = e.target;
    var path = [];
    var cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      var sel = cur.tagName.toLowerCase();
      if (cur.id) sel += '#' + cur.id;
      else if (cur.className && typeof cur.className === 'string') sel += '.' + cur.className.replace(/__mf-inspect-hover/g, '').trim().split(/\\s+/).filter(Boolean).join('.');
      path.unshift(sel);
      cur = cur.parentElement;
    }
    var html = el.outerHTML;
    if (html.length > 500) html = html.slice(0, 500) + '...';
    parent.postMessage({
      type: 'inspect-element',
      html: html,
      selector: path.join(' > '),
      tagName: el.tagName.toLowerCase(),
      className: (el.className || '').replace(/__mf-inspect-hover/g, '').trim(),
      textContent: (el.textContent || '').slice(0, 100)
    }, '*');
  }, true);
})();
</script>` : '';

  const wrappedHtml = html ? html.replace('</head>', `<script>
window.addEventListener('error', function(e) {
  parent.postMessage({ type: 'preview-error', message: e.message, line: e.lineno }, '*');
});
window.addEventListener('unhandledrejection', function(e) {
  parent.postMessage({ type: 'preview-error', message: e.reason?.message || String(e.reason) }, '*');
});
</script>${inspectScript}</head>`) : '';

  // Use blob URL for better performance with large generated code
  // Properly manage lifecycle to avoid memory leaks
  const [blobUrl, setBlobUrl] = useState(null);
  useEffect(() => {
    if (!wrappedHtml) {
      setBlobUrl(null);
      return;
    }
    const blob = new Blob([wrappedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [wrappedHtml]);

  if (!hasContent) {
    return (
      <div className="workbench-panel">
        <div className="workbench-tabs">
          <button className="wb-tab active"><Eye size={14} /> Preview</button>
          <button className="wb-tab"><Code2 size={14} /> Code</button>
        </div>
        <div className="workbench-empty">
          <Code2 size={48} style={{ color: 'var(--border2)' }} />
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>No project open</div>
          <div style={{ fontSize: 12, color: 'var(--text4)', maxWidth: 280, textAlign: 'center', lineHeight: 1.6, marginTop: 6 }}>
            Start a conversation to generate your app. The live preview, code, and deployment will appear here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workbench-panel">
      <div className="workbench-tabs">
        {[
          { id: 'preview', Icon: Eye, label: 'Preview' },
          { id: 'code', Icon: Code2, label: 'Code' },
        ].map(tab => (
          <button key={tab.id} className={`wb-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => onTabChange(tab.id)}>
            <tab.Icon size={14} />{tab.label}
          </button>
        ))}
        {runtimeErrors.length > 0 && (
          <div className="wb-error-badge" title={`${runtimeErrors.length} runtime error(s)`}>
            <AlertTriangle size={11} /> {runtimeErrors.length}
          </div>
        )}
        <div className="wb-tab-spacer" />

        {/* Deploy/GitHub status pills */}
        {deployedUrl && (
          <div className="wb-status-pill green" title={`Live at https://${deployedUrl}`}>
            <Globe size={11} /> Live
          </div>
        )}
        {githubRepo && (
          <div className="wb-status-pill blue" title={`github.com/${githubRepo}`}>
            <Github size={11} /> Synced
          </div>
        )}

        {activeTab === 'code' && (
          <button className="icon-btn" onClick={handleCopy} title={copied ? 'Copied!' : 'Copy code'} style={{ width: 28, height: 28 }}>
            {copied ? <Check size={14} style={{ color: 'var(--green)' }} /> : <Copy size={14} />}
          </button>
        )}
        {activeTab === 'preview' && onToggleInspect && (
          <button
            className={`icon-btn inspect-toggle ${inspectMode ? 'active' : ''}`}
            onClick={onToggleInspect}
            title={inspectMode ? 'Exit Inspect Mode' : 'Inspect Element (click to select)'}
            style={{ width: 28, height: 28 }}
          >
            <MousePointerClick size={14} />
          </button>
        )}
        <button className="icon-btn" title="Fullscreen" style={{ width: 28, height: 28 }}>
          <Maximize2 size={14} />
        </button>
      </div>

      {activeTab === 'preview' ? (
        <>
          {platform === 'mobile' ? (
            <MobilePreview html={wrappedHtml} agentStatus={agentStatus} />
          ) : shouldUseSandpack(files) ? (
            <div className="preview-panel">
              <div className="preview-bar">
                <div className="preview-dots"><span /><span /><span /></div>
                <div className="preview-url-bar">
                  <Package size={13} style={{ color: 'var(--green)' }} />
                  <span style={{ color: 'var(--green)', fontSize: 10, fontWeight: 600 }}>SANDPACK</span>
                  localhost:5173
                </div>
              </div>
              <SandpackPreview files={files} theme={theme} />
            </div>
          ) : (
            <WebPreview html={wrappedHtml} blobUrl={blobUrl} agentStatus={agentStatus} deployedUrl={deployedUrl} iframeRef={iframeRef} streamingText={streamingText} inspectMode={inspectMode} />
          )}
          {/* Inspect mode indicator */}
          {inspectMode && (
            <div className="inspect-mode-bar">
              <MousePointerClick size={13} />
              <span>Click any element in the preview to select it</span>
              <button className="pill-btn ghost" onClick={onToggleInspect} style={{ fontSize: 11, padding: '3px 10px' }}>Exit</button>
            </div>
          )}
          {/* Error overlay */}
          {runtimeErrors.length > 0 && (
            <ErrorOverlay errors={runtimeErrors} onFix={onFixError} onDismiss={() => setRuntimeErrors([])} />
          )}
        </>
      ) : (
        <CodeView html={html} files={files} onCodeChange={onCodeChange} theme={theme} />
      )}
    </div>
  );
}

function ErrorOverlay({ errors, onFix, onDismiss }) {
  const latest = errors[errors.length - 1];
  return (
    <div className="error-overlay animate-in">
      <div className="error-overlay-header">
        <AlertTriangle size={14} style={{ color: 'var(--red)' }} />
        <span style={{ flex: 1, fontWeight: 600, fontSize: 12 }}>Runtime Error ({errors.length})</span>
        <button className="icon-btn" onClick={onDismiss} style={{ width: 22, height: 22 }}><X size={12} /></button>
      </div>
      <div className="error-overlay-body">
        <code>{latest.message}</code>
        {latest.line && <span className="error-line">Line {latest.line}</span>}
      </div>
      <div className="error-overlay-actions">
        <button className="pill-btn primary" onClick={() => onFix(latest.message)} style={{ fontSize: 11 }}>
          <Wrench size={12} /> Fix with AI
        </button>
        <button className="pill-btn ghost" onClick={onDismiss} style={{ fontSize: 11 }}>Dismiss</button>
      </div>
    </div>
  );
}

function WebPreview({ html, blobUrl, agentStatus, deployedUrl, iframeRef, streamingText, inspectMode }) {
  return (
    <div className="preview-panel">
      <div className="preview-bar">
        <div className="preview-dots"><span /><span /><span /></div>
        <div className="preview-url-bar">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--green)' }}>lock</span>
          {deployedUrl ? `https://${deployedUrl}` : 'localhost:5173'}
        </div>
        <button className="icon-btn" title="Reload" style={{ width: 28, height: 28 }} onClick={() => { if (iframeRef.current) { iframeRef.current.src = iframeRef.current.src; } }}>
          <RefreshCw size={14} />
        </button>
        <button className="icon-btn" title="Open in new tab" style={{ width: 28, height: 28 }} onClick={() => { if (blobUrl) window.open(blobUrl, '_blank'); }}>
          <ExternalLink size={14} />
        </button>
      </div>
      <div className="preview-iframe-container">
        {blobUrl || html ? (
          <>
            <iframe ref={iframeRef} className="preview-iframe" src={blobUrl || undefined} srcDoc={!blobUrl ? html : undefined} sandbox="allow-scripts allow-same-origin" title="App Preview" />
            {(agentStatus === 'writing' || agentStatus === 'running' || agentStatus === 'streaming') && (
              <div className="preview-loading-overlay"><div className="preview-loading-spinner" /><span>Building...</span></div>
            )}
          </>
        ) : (
          <div className="preview-placeholder"><Eye size={48} style={{ color: 'var(--border2)' }} /><span style={{ fontSize: 13 }}>Preview will appear here</span></div>
        )}
      </div>
    </div>
  );
}

function MobilePreview({ html, agentStatus }) {
  return (
    <div className="mobile-preview-container">
      <div className="device-frame">
        <div className="device-notch"><div className="device-camera" /></div>
        <div className="device-status-bar">
          <span>9:41</span>
          <div className="device-status-right">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><rect x="0" y="4" width="2" height="6" rx="0.5" opacity="0.4"/><rect x="3" y="2.5" width="2" height="7.5" rx="0.5" opacity="0.6"/><rect x="6" y="1" width="2" height="9" rx="0.5" opacity="0.8"/><rect x="9" y="0" width="2" height="10" rx="0.5"/></svg>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="white"><rect x="0" y="1" width="16" height="8" rx="1.5" fill="none" stroke="white" strokeWidth="1"/><rect x="1.5" y="2.5" width="10" height="5" rx="0.5"/><rect x="17" y="3" width="2" height="4" rx="0.5" opacity="0.5"/></svg>
          </div>
        </div>
        <div className="device-screen">
          {html ? (
            <iframe srcDoc={html} sandbox="allow-scripts allow-same-origin" title="Mobile Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg3)', color: 'var(--text4)' }}>
              <Smartphone size={32} style={{ color: 'var(--border2)' }} />
            </div>
          )}
        </div>
        <div className="device-home-bar" />
      </div>
      <div className="mobile-controls">
        <div className="mobile-controls-label">375 x 812 — iPhone 14</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pill-btn secondary" style={{ fontSize: 11 }}><QrCode size={13} /> Expo QR</button>
          <button className="pill-btn ghost" style={{ fontSize: 11 }}><Smartphone size={13} /> iOS</button>
          <button className="pill-btn ghost" style={{ fontSize: 11 }}><TabletSmartphone size={13} /> Android</button>
        </div>
      </div>
    </div>
  );
}

function CodeView({ html, files, onCodeChange, theme }) {
  const [activeFile, setActiveFile] = useState(null);
  const [copied, setCopied] = useState('');
  const debounceRef = useRef(null);

  // Determine file list
  const fileEntries = files && Object.keys(files).length > 0
    ? files
    : html ? { 'index.html': html } : {};

  const fileNames = Object.keys(fileEntries);
  const currentFile = activeFile && fileEntries[activeFile] !== undefined ? activeFile : fileNames[0];

  useEffect(() => {
    if (!activeFile && fileNames.length > 0) setActiveFile(fileNames[0]);
  }, [fileNames.length]);

  const getLanguage = (name) => {
    if (!name) return 'html';
    const ext = name.split('.').pop().toLowerCase();
    const map = { tsx: 'typescript', ts: 'typescript', jsx: 'javascript', js: 'javascript', css: 'css', json: 'json', html: 'html', md: 'markdown', py: 'python', yaml: 'yaml', yml: 'yaml' };
    return map[ext] || 'plaintext';
  };

  const handleCopyFile = (name) => {
    navigator.clipboard.writeText(fileEntries[name] || '');
    setCopied(name);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleEditorChange = (value) => {
    if (!currentFile || !onCodeChange) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onCodeChange(currentFile, value || '');
    }, 500);
  };

  if (fileNames.length === 0) {
    return (
      <div className="workbench-empty">
        <Code2 size={32} style={{ color: 'var(--border2)' }} />
        <div style={{ fontSize: 13, marginTop: 8 }}>No code generated yet</div>
      </div>
    );
  }

  return (
    <div className="code-area" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* File tabs */}
      <div className="code-file-tabs">
        {fileNames.map(name => (
          <div
            key={name}
            className={`code-file-tab ${currentFile === name ? 'active' : ''}`}
            onClick={() => setActiveFile(name)}
          >
            <FileCode size={12} style={{ color: getLanguage(name) === 'typescript' ? '#3178c6' : getLanguage(name) === 'css' ? '#563d7c' : 'var(--accent1)', flexShrink: 0 }} />
            <span>{name.split('/').pop()}</span>
            <button
              className="code-file-copy"
              onClick={(e) => { e.stopPropagation(); handleCopyFile(name); }}
              title={copied === name ? 'Copied!' : 'Copy file'}
            >
              {copied === name ? <Check size={11} style={{ color: 'var(--green)' }} /> : <Copy size={11} />}
            </button>
          </div>
        ))}
      </div>
      {/* Monaco Editor */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <MonacoEditorWrapper
          language={getLanguage(currentFile)}
          value={fileEntries[currentFile] || ''}
          onChange={handleEditorChange}
          theme={theme}
        />
      </div>
    </div>
  );
}

// Lazy-load Monaco to avoid blocking initial render
const MonacoEditorWrapper = React.memo(function MonacoEditorWrapper({ language, value, onChange, theme }) {
  const [Editor, setEditor] = useState(null);

  useEffect(() => {
    import('@monaco-editor/react').then(mod => setEditor(() => mod.default));
  }, []);

  if (!Editor) {
    // Fallback while Monaco loads
    const lines = (value || '').split('\n');
    return (
      <div className="code-area" style={{ height: '100%', overflow: 'auto' }}>
        <div className="code-lines">
          <div className="line-numbers">{lines.map((_, i) => <div key={i}>{i + 1}</div>)}</div>
          <pre className="code-content">{value}</pre>
        </div>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={theme === 'light' ? 'light' : 'vs-dark'}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 20,
        padding: { top: 12 },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        renderLineHighlight: 'line',
        bracketPairColorization: { enabled: true },
        smoothScrolling: true,
        cursorSmoothCaretAnimation: 'on',
      }}
    />
  );
});

function FileCode(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m10 13-2 2 2 2" /><path d="m14 17 2-2-2-2" />
    </svg>
  );
}
