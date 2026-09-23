import React from 'react';
import { PackageOpen } from 'lucide-react';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

const EmptyState = ({ title = 'No data found', message = 'There are no items to display at this moment.', actionText, onAction, icon: Icon = PackageOpen }) => {
  return (
    <GlassCard hover={false} style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          margin: '0 auto 16px auto',
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.15)',
          color: 'var(--primary-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon size={36} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px auto', fontSize: '0.95rem' }}>
        {message}
      </p>
      {actionText && onAction && (
        <GlassButton variant="primary" onClick={onAction}>
          {actionText}
        </GlassButton>
      )}
    </GlassCard>
  );
};

export default EmptyState;
