import React, { useMemo } from 'react';
import { History, RotateCcw, RotateCw, Clock, FileCode, FilePlus, FileX, ChevronRight, Undo2, Redo2 } from 'lucide-react';
import { getTimeline, canUndo, canRedo, computeDiff } from '../engine/historyEngine';

export default function HistoryPanel({ history, onUndo, onRedo, onJumpTo }) {
  const timeline = useMemo(() => getTimeline(history), [history]);
  const hasUndo = canUndo(history);
  const hasRedo = canRedo(history);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="history-panel">
        <div className="history-empty">
          <History size={40} style={{ color: 'var(--border2)' }} />
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 12 }}>No History Yet</div>
          <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 4, maxWidth: 240, textAlign: 'center', lineHeight: 1.5 }}>
            Changes will be tracked here as you build. Use undo/redo to navigate between versions.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-toolbar">
        <button
          className="pill-btn ghost"
          onClick={onUndo}
          disabled={!hasUndo}
          style={{ fontSize: 11, padding: '4px 10px', opacity: hasUndo ? 1 : 0.4 }}
        >
          <Undo2 size={12} /> Undo
        </button>
        <button
          className="pill-btn ghost"
          onClick={onRedo}
          disabled={!hasRedo}
          style={{ fontSize: 11, padding: '4px 10px', opacity: hasRedo ? 1 : 0.4 }}
        >
          <Redo2 size={12} /> Redo
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text4)' }}>
          {timeline.length} checkpoint{timeline.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="history-timeline">
        {timeline.map((entry, i) => {
          const prevEntry = i > 0 ? timeline[i - 1] : null;
          const changes = prevEntry ? computeDiff(prevEntry.files || {}, entry.files || {}) : [];
          const time = new Date(entry.timestamp);
          const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={entry.id}
              className={`history-entry ${entry.isCurrent ? 'current' : ''} ${entry.isUndone ? 'undone' : ''}`}
              onClick={() => onJumpTo(i)}
            >
              <div className="history-entry-dot" />
              <div className="history-entry-content">
                <div className="history-entry-header">
                  <span className="history-entry-label">{entry.label}</span>
                  <span className="history-entry-time"><Clock size={9} /> {timeStr}</span>
                </div>
                {changes.length > 0 && (
                  <div className="history-entry-changes">
                    {changes.slice(0, 3).map((change, ci) => (
                      <div key={ci} className="history-change-item">
                        {change.type === 'added' && <FilePlus size={10} style={{ color: 'var(--green)' }} />}
                        {change.type === 'modified' && <FileCode size={10} style={{ color: 'var(--accent)' }} />}
                        {change.type === 'deleted' && <FileX size={10} style={{ color: 'var(--red)' }} />}
                        <span>{change.path}</span>
                      </div>
                    ))}
                    {changes.length > 3 && (
                      <div className="history-change-item" style={{ color: 'var(--text4)' }}>
                        +{changes.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
              {entry.isCurrent && <ChevronRight size={12} style={{ color: 'var(--accent)' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
