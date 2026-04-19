import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onCancel?.();
      if (e.key === 'Enter') onConfirm?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel, onConfirm]);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <div className="confirm-dialog animate-in">
        <div className="confirm-dialog-icon">
          {variant === 'danger' ? (
            <AlertTriangle size={24} style={{ color: 'var(--red)' }} />
          ) : (
            <Info size={24} style={{ color: 'var(--accent)' }} />
          )}
        </div>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button className="pill-btn ghost" onClick={onCancel}>{cancelLabel}</button>
          <button
            ref={confirmRef}
            className={`pill-btn ${variant === 'danger' ? 'danger' : 'primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
