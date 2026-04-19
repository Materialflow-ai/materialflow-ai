import React, { useState, useRef, useEffect } from 'react';
import { Menu, MenuSquare, FolderOpen, ChevronDown, Save, GitFork, Download, Github, Settings, UserCircle, Sparkles, CreditCard, Globe, Check, ExternalLink, Sun, Moon, Pencil } from 'lucide-react';

export default function Header({ sidebarOpen, onToggleSidebar, projectName, credits, onSave, onFork, onExport, onSettings, showSettings, deployedUrl, githubRepo, theme, onToggleTheme, onRename }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startRename = () => {
    setEditValue(projectName || 'Untitled');
    setEditing(true);
  };

  const confirmRename = () => {
    if (editValue.trim() && onRename) {
      onRename(editValue.trim());
    }
    setEditing(false);
  };

  return (
    <div className="header-bar">
      <button className="icon-btn" onClick={onToggleSidebar} title="Toggle sidebar">
        {sidebarOpen ? <MenuSquare size={18} /> : <Menu size={18} />}
      </button>

      <div className="header-logo">
        <div className="header-logo-icon"><Sparkles size={15} color="white" /></div>
        <span className="header-logo-text">MaterialFlow</span>
        <span className="header-logo-badge">AI</span>
      </div>

      <div className="header-divider" />

      {editing ? (
        <div className="header-project-name editing">
          <FolderOpen size={14} style={{ color: 'var(--accent2)' }} />
          <input
            ref={inputRef}
            className="header-rename-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmRename();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="header-project-name" onClick={startRename} title="Click to rename">
          <FolderOpen size={14} style={{ color: 'var(--accent2)' }} />
          {projectName || 'untitled-project'}
          <Pencil size={10} style={{ opacity: 0.4 }} />
        </div>
      )}

      {/* Live URL indicator */}
      {deployedUrl && (
        <div className="header-live-url" title={`https://${deployedUrl}`}>
          <span className="status-dot green" style={{ width: 5, height: 5 }} />
          <Globe size={11} />
          <span>{deployedUrl}</span>
          <ExternalLink size={10} style={{ opacity: 0.5 }} />
        </div>
      )}

      {/* GitHub sync indicator */}
      {githubRepo && (
        <div className="header-github-sync" title={`github.com/${githubRepo}`}>
          <Github size={12} />
          <Check size={10} style={{ color: 'var(--green)' }} />
        </div>
      )}

      <div className="header-spacer" />

      <div className="header-actions">
        <div className="credits-pill" title="Credits remaining">
          <CreditCard size={12} />
          <span className="credits-value">{credits}</span>
        </div>

        <button className="pill-btn ghost" onClick={onSave} title="Save project">
          <Save size={14} />Save
        </button>
        <button className="pill-btn ghost" onClick={onFork} title="Fork project">
          <GitFork size={14} />Fork
        </button>
        <button className="pill-btn ghost" onClick={onExport} title="Export as ZIP">
          <Download size={14} />Export
        </button>

        <div className="header-divider" />

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={17} className="theme-icon" /> : <Moon size={17} className="theme-icon" />}
        </button>

        <button className="icon-btn" title="GitHub Sync">
          <Github size={17} />
        </button>
        <button className={`icon-btn ${showSettings ? 'active' : ''}`} onClick={onSettings} title="Settings">
          <Settings size={17} />
        </button>
        <button className="icon-btn" title="Account">
          <UserCircle size={17} />
        </button>
      </div>
    </div>
  );
}
