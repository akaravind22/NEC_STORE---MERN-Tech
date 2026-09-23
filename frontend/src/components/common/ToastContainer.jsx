import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} color="#10b981" />;
      case 'error': return <AlertCircle size={20} color="#ef4444" />;
      case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
      default: return <Info size={20} color="#3b82f6" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="glass-toast">
          {getIcon(t.type)}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', flex: 1 }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
