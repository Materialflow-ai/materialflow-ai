import React, { useState } from 'react';
import { X, Database, Shield, CreditCard, Github, Figma, Globe, Smartphone, Zap, Sparkles, ArrowRight, Check, Lock, Palette } from 'lucide-react';

const PROJECT_TYPES = [
  { id: 'web', label: 'Web App', icon: Globe, desc: 'React + Vite + TailwindCSS', color: '#60A5FA' },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone, desc: 'React Native + Expo', color: '#A78BFA' },
  { id: 'fullstack', label: 'Full-Stack', icon: Zap, desc: 'Frontend + Supabase backend', color: '#34D399', badge: 'Recommended' },
];

const INFRA_OPTIONS = [
  { id: 'database', icon: Database, label: 'PostgreSQL Database', desc: 'Auto-provisioned Supabase Postgres with migrations', free: true },
  { id: 'auth', icon: Shield, label: 'Authentication', desc: 'Email, Google, GitHub OAuth + row-level security', free: true },
  { id: 'payments', icon: CreditCard, label: 'Stripe Payments', desc: 'Checkout, subscriptions, webhooks scaffolded', free: true },
  { id: 'storage', icon: Database, label: 'File Storage', desc: 'Supabase Storage for images, uploads, assets', free: true },
];

export default function NewProjectModal({ onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState('fullstack');
  const [infra, setInfra] = useState({ database: true, auth: true, payments: false, storage: false });
  const [github, setGithub] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [importMode, setImportMode] = useState('prompt'); // prompt | figma | github

  const toggleInfra = (id) => setInfra(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCreate = () => {
    onCreate(name || 'My App', {
      type,
      database: infra.database,
      auth: infra.auth,
      payments: infra.payments,
      storage: infra.storage,
      github: github || `materialflow/${(name || 'my-app').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      figmaUrl,
    });
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content new-project-modal animate-in" style={{ width: 600 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} className="icon-gradient" />
            <span style={{ fontSize: 16, fontWeight: 700 }}>New Project</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {/* Step indicators */}
          <div className="np-steps">
            {['Type', 'Infrastructure', 'Connect'].map((s, i) => (
              <div key={i} className={`np-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
                <div className="np-step-dot">{step > i + 1 ? <Check size={10} /> : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="np-section">
              <div className="settings-field" style={{ marginBottom: 16 }}>
                <label>Project Name</label>
                <input className="settings-input" value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome App" autoFocus />
              </div>

              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, display: 'block' }}>Project Type</label>
              <div className="np-type-grid">
                {PROJECT_TYPES.map(t => (
                  <div key={t.id} className={`np-type-card ${type === t.id ? 'active' : ''}`} onClick={() => setType(t.id)}>
                    <t.icon size={24} style={{ color: t.color }} />
                    <div className="np-type-label">{t.label}</div>
                    <div className="np-type-desc">{t.desc}</div>
                    {t.badge && <span className="np-type-badge">{t.badge}</span>}
                    {type === t.id && <div className="np-type-check"><Check size={12} /></div>}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, display: 'block' }}>Import From</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'prompt', label: 'AI Prompt', Icon: Sparkles },
                    { id: 'figma', label: 'Figma Design', Icon: Figma },
                    { id: 'github', label: 'GitHub Repo', Icon: Github },
                  ].map(m => (
                    <button key={m.id} className={`pill-btn ${importMode === m.id ? 'secondary' : 'ghost'}`} onClick={() => setImportMode(m.id)} style={{ flex: 1, justifyContent: 'center' }}>
                      <m.Icon size={14} /> {m.label}
                    </button>
                  ))}
                </div>
                {importMode === 'figma' && (
                  <div className="np-import-box animate-in">
                    <Figma size={16} style={{ color: '#A259FF' }} />
                    <input className="settings-input" placeholder="Paste Figma URL (e.g. figma.com/file/...)" value={figmaUrl} onChange={e => setFigmaUrl(e.target.value)} style={{ flex: 1 }} />
                  </div>
                )}
                {importMode === 'github' && (
                  <div className="np-import-box animate-in">
                    <Github size={16} />
                    <input className="settings-input" placeholder="owner/repo (e.g. acme/my-app)" value={github} onChange={e => setGithub(e.target.value)} style={{ flex: 1 }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="np-section">
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
                Select infrastructure to auto-provision. Everything is zero-config and ready instantly.
              </p>
              <div className="np-infra-grid">
                {INFRA_OPTIONS.map(opt => (
                  <div key={opt.id} className={`np-infra-card ${infra[opt.id] ? 'active' : ''}`} onClick={() => toggleInfra(opt.id)}>
                    <div className="np-infra-icon"><opt.icon size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="np-infra-label">{opt.label}</div>
                      <div className="np-infra-desc">{opt.desc}</div>
                    </div>
                    <div className={`deploy-radio ${infra[opt.id] ? 'active' : ''}`} />
                  </div>
                ))}
              </div>

              {infra.auth && (
                <div className="np-auth-providers animate-in">
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 8 }}>Auth Providers (auto-configured)</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['Email/Password', 'Google OAuth', 'GitHub OAuth', 'Apple Sign-In', 'Magic Link'].map(p => (
                      <span key={p} className="np-auth-chip">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {infra.payments && (
                <div className="np-payments-info animate-in">
                  <CreditCard size={14} style={{ color: '#635BFF' }} />
                  <span>Stripe test mode enabled. Toggle to live in Settings when ready.</span>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="np-section">
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
                Connect external services. Every AI generation auto-commits to GitHub.
              </p>

              <div className="np-connect-card">
                <div className="np-connect-icon" style={{ background: 'rgba(255,255,255,.06)' }}><Github size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>GitHub Repository</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Two-way sync. Every AI generation = a commit.</div>
                </div>
                <div className="np-connect-status connected">
                  <Check size={12} /> Auto-created
                </div>
              </div>

              <div className="np-connect-card">
                <div className="np-connect-icon" style={{ background: 'rgba(52,211,153,.08)' }}><Globe size={20} style={{ color: '#34D399' }} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Live Deployment</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    Auto-deployed to <code style={{ color: 'var(--green)', fontSize: 11 }}>{(name || 'my-app').toLowerCase().replace(/[^a-z0-9 ]+/g, '-').replace(/\s+/g, '-')}.materialflow.app</code>
                  </div>
                </div>
                <div className="np-connect-status connected">
                  <Check size={12} /> SSL + CDN
                </div>
              </div>

              <div className="np-connect-card">
                <div className="np-connect-icon" style={{ background: 'rgba(162,89,255,.08)' }}><Palette size={20} style={{ color: '#A259FF' }} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Custom Domain</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Add your own domain on paid plans</div>
                </div>
                <button className="pill-btn ghost" style={{ fontSize: 11 }}>
                  <Lock size={11} /> Pro Plan
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button className="pill-btn ghost" onClick={() => setStep(step - 1)}>Back</button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button className="pill-btn primary" onClick={() => setStep(step + 1)}>
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button className="pill-btn primary" onClick={handleCreate}>
              <Zap size={14} /> Create Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
