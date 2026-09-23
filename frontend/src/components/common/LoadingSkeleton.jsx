import React from 'react';
import GlassCard from './GlassCard';

export const CardSkeleton = () => (
  <GlassCard hover={false} style={{ padding: '20px' }}>
    <div className="skeleton" style={{ height: '160px', width: '100%', marginBottom: '16px' }}></div>
    <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '8px' }}></div>
    <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '16px' }}></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="skeleton" style={{ height: '24px', width: '30%' }}></div>
      <div className="skeleton" style={{ height: '36px', width: '40%', borderRadius: '9999px' }}></div>
    </div>
  </GlassCard>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <GlassCard hover={false} style={{ padding: '20px' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div className="skeleton" style={{ height: '24px', flex: 1 }}></div>
        <div className="skeleton" style={{ height: '24px', flex: 2 }}></div>
        <div className="skeleton" style={{ height: '24px', flex: 1 }}></div>
      </div>
    ))}
  </GlassCard>
);
