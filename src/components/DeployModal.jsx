import React, { useState } from 'react';
import { X, Rocket, Globe, Cloud, Github, Smartphone, Package, Download, Check, ExternalLink, Loader2 } from 'lucide-react';

export default function DeployModal({ onClose, platform, projectName }) {
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(platform === 'web' ? 'netlify' : 'expo');

  const targets = platform === 'web' ? [
    { id: 'netlify', name: 'Netlify', Icon: Globe, desc: 'Static & SSR hosting', badge: 'Recommended' },
    { id: 'vercel', name: 'Vercel', Icon: Globe, desc: 'Edge-optimized hosting', badge: '' },
    { id: 'cloudflare', name: 'Cloudflare Pages', Icon: Cloud, desc: 'Global CDN', badge: '' },
    { id: 'github', name: 'GitHub Pages', Icon: Github, desc: 'Free static hosting', badge: 'Free' },
  ] : [
    { id: 'expo', name: 'Expo EAS', Icon: Smartphone, desc: 'Build & submit to stores', badge: 'Recommended' },
    { id: 'apk', name: 'APK Download', Icon: Package, desc: 'Direct APK file', badge: 'Quick' },
    { id: 'html', name: 'Download HTML', Icon: Download, desc: 'Save as HTML file', badge: '' },
  ];

  const steps = [
    { label: 'Building project...', Icon: Package },
    { label: 'Optimizing assets...', Icon: Loader2 },
    { label: 'Uploading to CDN...', Icon: Cloud },
    { label: 'Configuring DNS...', Icon: Globe },
    { label: 'Deploy complete!', Icon: Check },
  ];

  const handleDeploy = () => {
    setDeploying(true);
    setDeployStep(0);
    steps.forEach((_, i) => {
      setTimeout(() => setDeployStep(i), (i + 1) * 1200);
    });
  };

  const slug = (projectName || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content animate-in">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Rocket size={18} className="icon-gradient" />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Deploy {platform === 'web' ? 'Web App' : 'Mobile App'}</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {!deploying ? (
          <>
            <div className="modal-body">
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>Select Deploy Target</div>
              <div className="deploy-targets">
                {targets.map(t => (
                  <div key={t.id} className={`deploy-target ${selectedTarget === t.id ? 'active' : ''}`} onClick={() => setSelectedTarget(t.id)}>
                    <div className="deploy-target-icon"><t.Icon size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.desc}</div>
                    </div>
                    {t.badge && <span className={`deploy-badge ${t.badge === 'Recommended' ? 'green' : 'blue'}`}>{t.badge}</span>}
                    <div className={`deploy-radio ${selectedTarget === t.id ? 'active' : ''}`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="pill-btn ghost" onClick={onClose}>Cancel</button>
              <button className="pill-btn primary" onClick={handleDeploy}>
                <Rocket size={14} /> Deploy to {targets.find(t => t.id === selectedTarget)?.name}
              </button>
            </div>
          </>
        ) : (
          <div className="modal-body" style={{ padding: '32px 24px' }}>
            <div className="deploy-progress">
              {steps.map((step, i) => (
                <div key={i} className={`deploy-step ${i < deployStep ? 'done' : i === deployStep ? 'active' : ''}`}>
                  <div className="deploy-step-icon">
                    {i < deployStep ? <Check size={16} /> : <step.Icon size={16} />}
                  </div>
                  <span className="deploy-step-label">{step.label}</span>
                  {i === deployStep && i < steps.length - 1 && <div className="deploy-step-spinner" />}
                </div>
              ))}
            </div>
            {deployStep >= steps.length - 1 && (
              <div className="deploy-success animate-in">
                <div className="deploy-url-box">
                  <Check size={16} style={{ color: 'var(--green)' }} />
                  <code>https://{slug}.netlify.app</code>
                  <button className="icon-btn" title="Copy" style={{ width: 24, height: 24 }}>
                    <ExternalLink size={13} style={{ color: 'var(--green)' }} />
                  </button>
                </div>
                <button className="pill-btn primary" onClick={onClose}>
                  <ExternalLink size={14} /> Open Live Site
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
