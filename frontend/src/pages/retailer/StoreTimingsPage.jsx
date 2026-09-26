import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import StoreTimingManager from '../../components/retailer/StoreTimingManager';

const StoreTimingsPage = () => {
  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Store Operating Hours & Live Status</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manually enter your daily starting and closing times, lunch break duration, or step out for campus errands with real-time student notifications.
          </p>
        </div>

        <StoreTimingManager />
      </main>
    </div>
  );
};

export default StoreTimingsPage;
