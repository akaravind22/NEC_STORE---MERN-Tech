import React from 'react';

const StatusBadge = ({ status, type = 'order' }) => {
  let badgeClass = 'badge-info';
  let label = status;

  const s = String(status || '').toUpperCase();

  if (s === 'PAID' || s === 'COMPLETED' || s === 'DELIVERED' || s === 'ACTIVE' || s === 'HEALTHY' || s === 'SUCCESS') {
    badgeClass = 'badge-success';
  } else if (s === 'PROCESSING' || s === 'CREATED' || s === 'UNPAID') {
    badgeClass = 'badge-warning';
  } else if (s === 'CANCELLED' || s === 'FAILED' || s === 'SUSPENDED' || s === 'LOW STOCK' || s === 'OUT_OF_STOCK') {
    badgeClass = 'badge-danger';
  }

  return <span className={`status-badge ${badgeClass}`}>{label}</span>;
};

export default StatusBadge;
