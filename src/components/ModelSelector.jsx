import React from 'react';
import { Check } from 'lucide-react';

export default function ModelSelector({ models, selected, onSelect }) {
  return (
    <div className="model-dropdown animate-in">
      <div className="model-dropdown-label">Select Model</div>
      {models.map(model => (
        <div
          key={model.id}
          className={`model-option ${selected.id === model.id ? 'active' : ''}`}
          onClick={() => onSelect(model)}
        >
          <div style={{ flex: 1 }}>
            <div className="model-option-name">
              <span style={{ color: selected.id === model.id ? 'var(--accent)' : 'var(--text)' }}>{model.name}</span>
              {model.badge && <span className={`model-badge model-badge-${model.badge.toLowerCase()}`}>{model.badge}</span>}
            </div>
            <div className="model-option-meta">{model.provider} &middot; {model.speed}</div>
          </div>
          {selected.id === model.id && <Check size={14} style={{ color: 'var(--accent)' }} />}
        </div>
      ))}
    </div>
  );
}
