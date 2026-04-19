import React from 'react';

export default function AgentStatus({ status, action }) {
  const statusConfig = {
    idle: { label: 'Ready', dotClass: 'dot-idle' },
    thinking: { label: 'Thinking...', dotClass: 'dot-thinking' },
    writing: { label: 'Writing code...', dotClass: 'dot-writing' },
    streaming: { label: 'Streaming...', dotClass: 'dot-streaming' },
    running: { label: 'Building preview...', dotClass: 'dot-running' },
    done: { label: 'Complete', dotClass: 'dot-done' },
  };

  const config = statusConfig[status] || statusConfig.idle;

  return (
    <div className={`agent-status agent-${status}`}>
      <div className={`agent-dot ${config.dotClass}`} />
      <div className="agent-info">
        <span className="agent-label">{config.label}</span>
        {action && <span className="agent-action">{action}</span>}
      </div>
      {(status === 'thinking' || status === 'writing' || status === 'running') && (
        <div className="agent-spinner" />
      )}
    </div>
  );
}
