import React from 'react';
import { Bot, CreditCard, Globe, ExternalLink } from 'lucide-react';

export default function StatusBar({ platform, mode, model, agentStatus, agentAction, credits, deployedUrl }) {
  const statusColors = { idle: 'green', thinking: 'orange', writing: 'orange', running: 'orange', done: 'green' };
  const statusLabels = { idle: 'Ready', thinking: 'Thinking...', writing: 'Writing...', running: 'Running...', done: 'Done' };

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className={`status-dot ${statusColors[agentStatus] || 'green'}`} />
        {statusLabels[agentStatus] || 'Ready'}
      </div>
      {agentAction && <div className="status-item" style={{ color: 'var(--accent)' }}>{agentAction}</div>}
      <div className="status-item">
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{platform === 'web' ? 'monitor' : 'smartphone'}</span>
        {platform === 'web' ? 'Web' : 'Mobile'}
      </div>
      <div className="status-item">
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>construction</span>
        {mode.charAt(0).toUpperCase() + mode.slice(1)}
      </div>
      {deployedUrl && (
        <div className="status-item status-live-url" title={`https://${deployedUrl}`}>
          <Globe size={11} style={{ color: 'var(--green)' }} />
          <span style={{ color: 'var(--green)' }}>{deployedUrl}</span>
          <ExternalLink size={9} style={{ opacity: 0.4 }} />
        </div>
      )}
      <div style={{ flex: 1 }} />
      <div className="status-item" style={{ color: 'var(--accent2)' }}><Bot size={12} /> {model?.name || 'Claude Sonnet 4'}</div>
      <div className="status-item">
        <CreditCard size={12} />
        <span style={{ color: credits > 20 ? 'var(--green)' : credits > 5 ? 'var(--orange)' : 'var(--red)' }}>{credits}</span>
        credits
      </div>
    </div>
  );
}
