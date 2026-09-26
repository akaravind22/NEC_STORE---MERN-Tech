import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import GlassCard from './GlassCard';

const GlassModal = ({ isOpen, onClose, title, children, maxWidth = '550px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 200ms ease'
      }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard hover={false} style={{ padding: '26px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--neu-border-subtle)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>{title}</h3>
            <button
              onClick={onClose}
              className="neu-circle-btn"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--card-bg)',
                border: '1px solid var(--neu-border-subtle)',
                boxShadow: 'var(--neu-extruded-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 180ms ease'
              }}
            >
              <X size={16} />
            </button>
          </div>
          <div>{children}</div>
        </GlassCard>
      </div>
    </div>
  );
};

export default GlassModal;
