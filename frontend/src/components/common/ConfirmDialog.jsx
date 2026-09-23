import React from 'react';
import GlassModal from './GlassModal';
import GlassButton from './GlassButton';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmText = 'Confirm' }) => {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
        {message}
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <GlassButton variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </GlassButton>
        <GlassButton variant="danger" size="sm" onClick={onConfirm}>
          {confirmText}
        </GlassButton>
      </div>
    </GlassModal>
  );
};

export default ConfirmDialog;
