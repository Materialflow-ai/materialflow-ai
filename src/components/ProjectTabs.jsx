import React from 'react';
import { Plus, X, Trash2 } from 'lucide-react';

export default function ProjectTabs({ projects, activeId, onSelect, onClose, onAdd, onDelete }) {
  return (
    <div className="project-tabs-bar">
      <div className="project-tabs-scroll">
        {projects.map(proj => (
          <button
            key={proj.id}
            className={`project-tab ${proj.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(proj.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (onDelete) onDelete(proj.id);
            }}
          >
            <span className="project-tab-name">{proj.name}</span>
            {projects.length > 1 && (
              <span
                className="project-tab-close"
                onClick={(e) => { e.stopPropagation(); onClose(proj.id); }}
              >
                <X size={12} />
              </span>
            )}
          </button>
        ))}
      </div>
      {projects.length < 8 && (
        <button className="project-tab-add" onClick={() => onAdd()} title="New project tab">
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}
