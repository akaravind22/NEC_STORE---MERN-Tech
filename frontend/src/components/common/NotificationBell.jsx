import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Info, ShoppingBag, AlertTriangle, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import GlassCard from './GlassCard';

const NotificationBell = ({ placement = 'right' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { getAxios, isAuthenticated } = useAuthStore();
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getAxios().get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await getAxios().put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await getAxios().put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK': return <AlertTriangle size={16} color="#ef4444" />;
      case 'ORDER_PLACED':
      case 'PAYMENT_SUCCESS': return <ShoppingBag size={16} color="#10b981" />;
      case 'USER_REGISTERED': return <UserPlus size={16} color="#3b82f6" />;
      default: return <Info size={16} color="#a855f7" />;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-main)',
          cursor: 'pointer',
          backdropFilter: 'var(--glass-blur)',
          transition: 'all 200ms ease'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: 'var(--gradient-danger)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              borderRadius: '9999px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '52px',
            ...(placement === 'left' ? { left: 0 } : { right: 0 }),
            width: '350px',
            zIndex: 1000,
            animation: 'fadeIn 200ms ease'
          }}
        >
          <GlassCard hover={false} style={{ padding: 0 }}>
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--glass-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h4 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Notifications {unreadCount > 0 && <span style={{ color: 'var(--primary-blue)', fontSize: '0.8rem' }}>({unreadCount} new)</span>}
              </h4>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-blue)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--glass-border-subtle)',
                      background: n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.08)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      transition: 'background 150ms ease'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        title="Mark as read"
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <Check size={12} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
