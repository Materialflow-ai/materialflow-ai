import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, X, Info, AlertCircle } from 'lucide-react';

let toastId = 0;
let addToastGlobal = null;

export function toast(message, type = 'info', duration = 5000) {
  if (addToastGlobal) {
    addToastGlobal({ id: ++toastId, message, type, duration });
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);


  const addToast = useCallback((t) => {
    setToasts(prev => [...prev, t]);
    if (t.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      }, t.duration);
    }
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => { addToastGlobal = null; };
  }, [addToast]);

  const dismiss = (id) => setToasts(prev => prev.filter(x => x.id !== id));

  const icons = {
    success: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    info: <Info size={16} />,
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type} animate-in`}>
          <div className="toast-icon">{icons[t.type] || icons.info}</div>
          <div className="toast-message">{t.message}</div>
          <button className="toast-close" onClick={() => dismiss(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
