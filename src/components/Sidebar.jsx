import React from 'react';
import { Plus, MessageSquare, Globe, Smartphone, LayoutDashboard, ShoppingBag, BarChart3, Code2, HelpCircle, MessageCircle } from 'lucide-react';

export default function Sidebar({ open, projects, activeId, onSelectProject, onNewProject }) {
  if (!open) return null;

  const recent = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Projects</span>
        <button className="icon-btn" onClick={onNewProject} title="New project" style={{ width: 28, height: 28 }}>
          <Plus size={16} />
        </button>
      </div>
      <div className="sidebar-content">
        <button className="new-chat-btn" onClick={onNewProject}>
          <Plus size={16} />
          New Project
        </button>

        <div style={{ marginBottom: 16 }}>
          <div className="sidebar-section-label">Recent</div>
          <div className="chat-list">
            {recent.map(proj => (
              <div
                key={proj.id}
                className={`chat-item ${proj.id === activeId ? 'active' : ''}`}
                onClick={() => onSelectProject(proj.id)}
              >
                <MessageSquare size={15} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {proj.name}
                </span>
                {proj.id === activeId && <div className="active-dot" />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div className="sidebar-section-label">Templates</div>
          <div className="chat-list">
            {[
              { icon: Globe, label: 'Landing Page', color: '#60A5FA' },
              { icon: Smartphone, label: 'Mobile App', color: '#A78BFA' },
              { icon: LayoutDashboard, label: 'Dashboard', color: '#34D399' },
              { icon: ShoppingBag, label: 'E-commerce', color: '#FBBF24' },
              { icon: BarChart3, label: 'Analytics', color: '#F87171' },
              { icon: Code2, label: 'REST API', color: '#38BDF8' },
            ].map((t, i) => (
              <div key={i} className="chat-item" onClick={onNewProject}>
                <t.icon size={15} style={{ color: t.color }} />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
          <div className="chat-item">
            <HelpCircle size={15} />Help & Docs
          </div>
          <div className="chat-item">
            <MessageCircle size={15} />Feedback
          </div>
        </div>
      </div>
    </div>
  );
}
