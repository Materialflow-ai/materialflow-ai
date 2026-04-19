import React, { useState, useCallback } from 'react';
import { X, Globe, Rocket, Check, ExternalLink, Loader2, AlertTriangle, Key, Cloud } from 'lucide-react';
import { deployToVercel, deployToNetlify, checkDeployStatus } from '../engine/deployEngine';

export default function DeployModal({ onClose, files, html, projectName, settings, onDeploySuccess }) {
  const [provider, setProvider] = useState('vercel');
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [error, setError] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  // Get stored tokens
  const vercelToken = settings?.deployTokens?.vercel || '';
  const netlifyToken = settings?.deployTokens?.netlify || '';

  const activeToken = provider === 'vercel' ? vercelToken : netlifyToken;

  const handleDeploy = useCallback(async () => {
    const token = activeToken || tokenInput;
    if (!token) {
      setError(`Please enter your ${provider === 'vercel' ? 'Vercel' : 'Netlify'} deploy token.`);
      return;
    }

    // Build deployable files
    const deployFiles = { ...files };
    if (!deployFiles['index.html'] && html) {
      deployFiles['index.html'] = html;
    }

    if (Object.keys(deployFiles).length === 0) {
      setError('No files to deploy. Build your app first.');
      return;
    }

    setDeploying(true);
    setError('');

    try {
      let result;
      if (provider === 'vercel') {
        result = await deployToVercel(token, projectName || 'materialflow-app', deployFiles);
      } else {
        result = await deployToNetlify(token, projectName || 'materialflow-app', deployFiles);
      }

      setDeployResult(result);
      onDeploySuccess?.(result.url);

      // Poll for ready state
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > 30) { clearInterval(poll); return; }
        try {
          const status = await checkDeployStatus(provider, token, result.id);
          if (status.ready) {
            setDeployResult(prev => ({ ...prev, ready: true, url: `https://${status.url}` }));
            clearInterval(poll);
          }
        } catch (e) { /* continue polling */ }
      }, 3000);
    } catch (err) {
      setError(err.message || 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  }, [provider, activeToken, tokenInput, files, html, projectName, onDeploySuccess]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal deploy-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <Rocket size={18} />
          <span>Deploy to Production</span>
          <button className="icon-btn" onClick={onClose} style={{ marginLeft: 'auto', width: 28, height: 28 }}><X size={16} /></button>
        </div>

        {deployResult ? (
          <div className="modal-body" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(129,201,149,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={28} style={{ color: 'var(--green)' }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Deployed Successfully</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
              {deployResult.ready ? 'Your app is live!' : 'Building... URL will be ready shortly.'}
            </div>
            <a
              href={deployResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 20px' }}
            >
              <ExternalLink size={14} /> {deployResult.url}
            </a>
            <div style={{ marginTop: 16 }}>
              <button className="pill-btn ghost" onClick={onClose} style={{ fontSize: 12 }}>Close</button>
            </div>
          </div>
        ) : (
          <div className="modal-body" style={{ padding: 20 }}>
            {/* Provider Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { id: 'vercel', name: 'Vercel', desc: 'Edge network, instant rollbacks' },
                { id: 'netlify', name: 'Netlify', desc: 'CDN deploy, form handling' },
              ].map(p => (
                <button
                  key={p.id}
                  className={`deploy-provider-card ${provider === p.id ? 'active' : ''}`}
                  onClick={() => setProvider(p.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px 14px',
                    borderRadius: 'var(--r-md)', border: `1px solid ${provider === p.id ? 'var(--accent)' : 'var(--border)'}`,
                    background: provider === p.id ? 'rgba(138,180,248,.06)' : 'var(--card)',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: provider === p.id ? 'var(--accent)' : 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 2 }}>{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Token Input */}
            {!activeToken && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <Key size={12} /> {provider === 'vercel' ? 'Vercel' : 'Netlify'} Deploy Token
                </label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder={`Paste your ${provider} token...`}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  style={{ width: '100%', fontSize: 12, padding: '8px 12px' }}
                />
                <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>
                  {provider === 'vercel'
                    ? 'Get yours at vercel.com/account/tokens'
                    : 'Get yours at app.netlify.com/user/applications'
                  }
                </div>
              </div>
            )}

            {/* Deploy Info */}
            <div style={{ padding: '10px 12px', background: 'var(--card2)', borderRadius: 'var(--r-md)', marginBottom: 16, fontSize: 11, color: 'var(--text3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Files</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{Object.keys(files || {}).length || (html ? 1 : 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Project</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{projectName || 'materialflow-app'}</span>
              </div>
            </div>

            {error && (
              <div style={{ padding: '8px 12px', background: 'rgba(242,139,130,.08)', borderRadius: 'var(--r-md)', marginBottom: 12, fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} /> {error}
              </div>
            )}

            <button
              className="pill-btn primary"
              onClick={handleDeploy}
              disabled={deploying}
              style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px 0' }}
            >
              {deploying ? (
                <><Loader2 size={14} className="spin" /> Deploying to {provider === 'vercel' ? 'Vercel' : 'Netlify'}...</>
              ) : (
                <><Cloud size={14} /> Deploy to {provider === 'vercel' ? 'Vercel' : 'Netlify'}</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
