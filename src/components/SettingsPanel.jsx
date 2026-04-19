import React, { useState } from 'react';
import { X, User, Shield, Key, Bell, Palette, CreditCard, Download, Trash2, ChevronRight, Plus, Copy, RefreshCw, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function SettingsPanel({ settings, onUpdate, onClose }) {
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', icon: User, label: 'Profile', desc: 'Name, email, avatar' },
    { id: 'apikeys', icon: Key, label: 'API Keys', desc: 'Manage provider keys' },
    { id: 'appearance', icon: Palette, label: 'Appearance', desc: 'Theme and fonts' },
    { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert preferences' },
    { id: 'credits', icon: CreditCard, label: 'Credits & Billing', desc: `${settings.credits} credits remaining` },
    { id: 'export', icon: Download, label: 'Data Export', desc: 'Download your data' },
    { id: 'danger', icon: AlertTriangle, label: 'Danger Zone', desc: 'Delete account' },
  ];

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <button className="icon-btn" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="settings-layout">
        <div className="settings-nav">
          {sections.map(s => (
            <button
              key={s.id}
              className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <s.icon size={16} />
              <div className="settings-nav-info">
                <span className="settings-nav-label">{s.label}</span>
                <span className="settings-nav-desc">{s.desc}</span>
              </div>
              <ChevronRight size={14} className="settings-nav-chevron" />
            </button>
          ))}
        </div>
        <div className="settings-content">
          {activeSection === 'profile' && <ProfileSection settings={settings} onUpdate={onUpdate} />}
          {activeSection === 'apikeys' && <ApiKeysSection settings={settings} onUpdate={onUpdate} />}
          {activeSection === 'appearance' && <AppearanceSection settings={settings} onUpdate={onUpdate} />}
          {activeSection === 'notifications' && <NotificationsSection settings={settings} onUpdate={onUpdate} />}
          {activeSection === 'credits' && <CreditsSection settings={settings} />}
          {activeSection === 'export' && <ExportSection />}
          {activeSection === 'danger' && <DangerSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ settings, onUpdate }) {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Profile</h3>
      <div className="settings-field">
        <label>Display Name</label>
        <input
          type="text"
          className="settings-input"
          value={settings.profile.name}
          onChange={(e) => onUpdate({ ...settings, profile: { ...settings.profile, name: e.target.value } })}
        />
      </div>
      <div className="settings-field">
        <label>Email</label>
        <input type="email" className="settings-input" value={settings.profile.email} placeholder="your@email.com"
          onChange={(e) => onUpdate({ ...settings, profile: { ...settings.profile, email: e.target.value } })}
        />
      </div>
    </div>
  );
}

function ApiKeysSection({ settings, onUpdate }) {
  const [showKey, setShowKey] = useState({});
  const [newProvider, setNewProvider] = useState('');
  const [newKey, setNewKey] = useState('');

  const addKey = () => {
    if (!newProvider || !newKey) return;
    const key = {
      id: `key_${Date.now()}`,
      provider: newProvider,
      key: newKey,
      createdAt: Date.now(),
      lastUsed: null,
      masked: maskKey(newKey),
    };
    onUpdate({ ...settings, apiKeys: [...settings.apiKeys, key] });
    setNewProvider('');
    setNewKey('');
  };

  const removeKey = (id) => {
    onUpdate({ ...settings, apiKeys: settings.apiKeys.filter(k => k.id !== id) });
  };

  const rotateKey = (id) => {
    onUpdate({
      ...settings,
      apiKeys: settings.apiKeys.map(k => k.id === id ? { ...k, key: '', masked: 'sk-ant-...rotated', lastUsed: Date.now() } : k),
    });
  };

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">API Keys</h3>
      <p className="settings-section-desc">Add your own API keys for Claude, GPT, or other providers. Keys are stored locally in your browser.</p>

      {settings.apiKeys.map(k => (
        <div key={k.id} className="api-key-card">
          <div className="api-key-header">
            <span className="api-key-provider">{k.provider}</span>
            <span className="api-key-date">Added {new Date(k.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="api-key-value">
            <code>{showKey[k.id] ? k.key : k.masked}</code>
            <div className="api-key-actions">
              <button className="icon-btn" onClick={() => setShowKey(s => ({ ...s, [k.id]: !s[k.id] }))} title="Toggle visibility" style={{ width: 26, height: 26 }}>
                {showKey[k.id] ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button className="icon-btn" onClick={() => navigator.clipboard.writeText(k.key)} title="Copy" style={{ width: 26, height: 26 }}>
                <Copy size={13} />
              </button>
              <button className="icon-btn" onClick={() => rotateKey(k.id)} title="Rotate" style={{ width: 26, height: 26 }}>
                <RefreshCw size={13} />
              </button>
              <button className="icon-btn" onClick={() => removeKey(k.id)} title="Revoke" style={{ width: 26, height: 26, color: 'var(--red)' }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="api-key-add">
        <select className="settings-select" value={newProvider} onChange={(e) => setNewProvider(e.target.value)}>
          <option value="">Select provider...</option>
          <option value="Anthropic">Anthropic (Claude)</option>
          <option value="OpenAI">OpenAI (GPT)</option>
          <option value="Google">Google (Gemini)</option>
          <option value="DeepSeek">DeepSeek</option>
        </select>
        <input type="password" className="settings-input" placeholder="Paste API key..." value={newKey} onChange={(e) => setNewKey(e.target.value)} style={{ flex: 1 }} />
        <button className="pill-btn primary" onClick={addKey} disabled={!newProvider || !newKey}>
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

function AppearanceSection({ settings, onUpdate }) {
  const handleThemeChange = (theme) => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    onUpdate({ ...settings, appearance: { ...settings.appearance, theme } });
  };

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Appearance</h3>
      <div className="settings-field">
        <label>Theme</label>
        <select className="settings-select" value={settings.appearance.theme} onChange={(e) => handleThemeChange(e.target.value)}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      </div>
      <div className="settings-field">
        <label>Font Size</label>
        <select className="settings-select" value={settings.appearance.fontSize} onChange={(e) => onUpdate({ ...settings, appearance: { ...settings.appearance, fontSize: Number(e.target.value) } })}>
          <option value="12">12px</option>
          <option value="13">13px</option>
          <option value="14">14px (default)</option>
          <option value="15">15px</option>
          <option value="16">16px</option>
        </select>
      </div>
      <div className="settings-field">
        <label>Editor Theme</label>
        <select className="settings-select" value={settings.appearance.editorTheme || 'default'} onChange={(e) => onUpdate({ ...settings, appearance: { ...settings.appearance, editorTheme: e.target.value } })}>
          <option value="default">Default</option>
          <option value="monokai">Monokai</option>
          <option value="github">GitHub</option>
          <option value="dracula">Dracula</option>
        </select>
      </div>
    </div>
  );
}

function NotificationsSection({ settings, onUpdate }) {
  const toggle = (key) => {
    onUpdate({ ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } });
  };
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Notifications</h3>
      {[
        { key: 'buildComplete', label: 'Build complete', desc: 'Notify when app generation finishes' },
        { key: 'deployComplete', label: 'Deploy complete', desc: 'Notify when deployment succeeds' },
        { key: 'errorAlerts', label: 'Error alerts', desc: 'Notify on build or runtime errors' },
      ].map(n => (
        <div key={n.key} className="settings-toggle-row">
          <div><div className="settings-toggle-label">{n.label}</div><div className="settings-toggle-desc">{n.desc}</div></div>
          <button className={`settings-toggle ${settings.notifications[n.key] ? 'on' : ''}`} onClick={() => toggle(n.key)}>
            <div className="settings-toggle-thumb" />
          </button>
        </div>
      ))}
    </div>
  );
}

function CreditsSection({ settings }) {
  const pct = Math.min(100, (settings.credits / 100) * 100);
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Credits & Billing</h3>
      <div className="credits-card">
        <div className="credits-card-top">
          <div className="credits-card-label">Available Credits</div>
          <div className="credits-card-value">{settings.credits}</div>
        </div>
        <div className="credits-bar"><div className="credits-bar-fill" style={{ width: `${pct}%` }} /></div>
        <div className="credits-card-info">Each build costs 5-10 credits depending on complexity.</div>
      </div>
      <button className="pill-btn primary" style={{ marginTop: 16 }}>
        <CreditCard size={14} /> Upgrade Plan
      </button>
    </div>
  );
}

function ExportSection() {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Data Export</h3>
      <p className="settings-section-desc">Download all your projects and settings as a JSON file.</p>
      <button className="pill-btn secondary" style={{ marginTop: 12 }}><Download size={14} /> Export All Projects</button>
    </div>
  );
}

function DangerSection() {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    localStorage.clear();
    location.reload();
  };

  return (
    <div className="settings-section">
      <h3 className="settings-section-title" style={{ color: 'var(--red)' }}>Danger Zone</h3>
      <div className="danger-card">
        <div><div style={{ fontSize: 13, fontWeight: 600 }}>Delete all local data</div><div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>This will clear all projects, settings, and API keys from your browser.</div></div>
        <button className="pill-btn danger" onClick={handleDelete}>
          <Trash2 size={13} /> {confirmDelete ? 'Click Again to Confirm' : 'Delete All'}
        </button>
      </div>
      {confirmDelete && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--red)' }}>Are you sure? This cannot be undone.</span>
          <button className="pill-btn ghost" onClick={() => setConfirmDelete(false)} style={{ fontSize: 11 }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function maskKey(key) {
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 7) + '•••' + key.slice(-4);
}
