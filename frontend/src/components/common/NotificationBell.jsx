import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  ShoppingBag, 
  AlertTriangle, 
  Info, 
  UserPlus, 
  Clock, 
  Filter, 
  Trash2,
  Calendar,
  Sparkles,
  Search,
  X
} from 'lucide-react';
import GlassCard from './GlassCard';
import GlassModal from './GlassModal';
import GlassButton from './GlassButton';
import { useAuthStore } from '../../store/useAuthStore';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'ORDERS' | 'ALERTS'
  const [searchQuery, setSearchQuery] = useState('');

  const { getAxios, isAuthenticated, user } = useAuthStore();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getAxios().get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
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

  const displayNotifications = useMemo(() => {
    let list = user?.role === 'RETAILER'
      ? notifications.filter(n => n.type !== 'USER_REGISTERED' && !n.title?.includes('Student Registered') && !n.title?.includes('Customer Registered') && !n.title?.includes('Retailer Registered'))
      : notifications;

    // Filter by Tab
    if (activeFilter === 'UNREAD') {
      list = list.filter(n => !n.isRead);
    } else if (activeFilter === 'ORDERS') {
      list = list.filter(n => n.type === 'ORDER_PLACED' || n.type === 'PAYMENT_SUCCESS' || n.title?.toLowerCase().includes('order'));
    } else if (activeFilter === 'ALERTS') {
      list = list.filter(n => n.type === 'LOW_STOCK' || n.title?.toLowerCase().includes('stock') || n.title?.toLowerCase().includes('timing'));
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n => 
        (n.title || '').toLowerCase().includes(q) || 
        (n.message || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [notifications, activeFilter, searchQuery, user]);

  const activeUnreadCount = useMemo(() => {
    const list = user?.role === 'RETAILER'
      ? notifications.filter(n => n.type !== 'USER_REGISTERED' && !n.title?.includes('Student Registered') && !n.title?.includes('Customer Registered') && !n.title?.includes('Retailer Registered'))
      : notifications;
    return list.filter(n => !n.isRead).length;
  }, [notifications, user]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await getAxios().put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await getAxios().put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--status-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={18} />
          </div>
        );
      case 'ORDER_PLACED':
      case 'PAYMENT_SUCCESS':
        return (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShoppingBag size={18} />
          </div>
        );
      case 'USER_REGISTERED':
        return (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(37, 99, 235, 0.12)',
            color: 'var(--primary-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <UserPlus size={18} />
          </div>
        );
      default:
        return (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(124, 58, 237, 0.12)',
            color: 'var(--primary-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Info size={18} />
          </div>
        );
    }
  };

  return (
    <>
      {/* Top Navbar Bell Trigger Button */}
      <button
        onClick={() => {
          setIsModalOpen(true);
          fetchNotifications();
        }}
        className="neu-circle-btn"
        title="Open Notification Center"
        style={{
          position: 'relative',
          background: 'var(--card-bg)',
          border: '1px solid var(--neu-border)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-main)',
          cursor: 'pointer',
          boxShadow: 'var(--neu-extruded-sm)',
          transition: 'all 200ms ease'
        }}
      >
        <Bell size={20} />
        {activeUnreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: 'var(--gradient-danger)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              borderRadius: '9999px',
              minWidth: '20px',
              height: '20px',
              padding: '0 5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
            }}
          >
            {activeUnreadCount}
          </span>
        )}
      </button>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BIG SCREEN NOTIFICATION CENTER MODAL                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Notification Center"
        maxWidth="760px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Top Bar with Search & Mark All Read */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Search Box */}
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input"
                style={{ width: '100%', paddingLeft: '36px', fontSize: '0.85rem' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {activeUnreadCount > 0 && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  icon={CheckCheck}
                  onClick={handleMarkAllAsRead}
                  style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-blue)' }}
                >
                  Mark All as Read ({activeUnreadCount})
                </GlassButton>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--neu-border-subtle)', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveFilter('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeFilter === 'ALL' ? 'none' : '1px solid var(--neu-border-subtle)',
                background: activeFilter === 'ALL' ? 'var(--primary-blue)' : 'var(--card-bg)',
                color: activeFilter === 'ALL' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 150ms ease'
              }}
            >
              All Notifications ({notifications.length})
            </button>

            <button
              onClick={() => setActiveFilter('UNREAD')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeFilter === 'UNREAD' ? 'none' : '1px solid var(--neu-border-subtle)',
                background: activeFilter === 'UNREAD' ? 'var(--primary-blue)' : 'var(--card-bg)',
                color: activeFilter === 'UNREAD' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 150ms ease'
              }}
            >
              Unread Only ({activeUnreadCount})
            </button>

            <button
              onClick={() => setActiveFilter('ORDERS')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeFilter === 'ORDERS' ? 'none' : '1px solid var(--neu-border-subtle)',
                background: activeFilter === 'ORDERS' ? 'var(--primary-blue)' : 'var(--card-bg)',
                color: activeFilter === 'ORDERS' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 150ms ease'
              }}
            >
              Orders & Sales
            </button>

            <button
              onClick={() => setActiveFilter('ALERTS')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeFilter === 'ALERTS' ? 'none' : '1px solid var(--neu-border-subtle)',
                background: activeFilter === 'ALERTS' ? 'var(--primary-blue)' : 'var(--card-bg)',
                color: activeFilter === 'ALERTS' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 150ms ease'
              }}
            >
              Store & Stock Alerts
            </button>
          </div>

          {/* Notifications Spacious Big Screen Feed */}
          <div style={{ maxHeight: '460px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {displayNotifications.length === 0 ? (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: 'var(--neu-inset-bg)',
                borderRadius: '16px',
                border: '1px solid var(--neu-border-subtle)'
              }}>
                <Bell size={36} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block', color: 'var(--primary-blue)' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  No Notifications Found
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {searchQuery ? 'No alerts matched your search keyword.' : 'You are all caught up! New orders and store updates will appear here.'}
                </p>
              </div>
            ) : (
              displayNotifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    padding: '16px 18px',
                    borderRadius: '14px',
                    background: n.isRead ? 'var(--card-bg)' : 'rgba(56, 189, 248, 0.08)',
                    border: n.isRead ? '1px solid var(--neu-border-subtle)' : '1px solid rgba(56, 189, 248, 0.28)',
                    boxShadow: n.isRead ? 'none' : '0 2px 10px rgba(56, 189, 248, 0.06)',
                    transition: 'all 150ms ease'
                  }}
                >
                  {/* Icon */}
                  {getNotificationIcon(n.type)}

                  {/* Body Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: 'var(--primary-blue)',
                          flexShrink: 0
                        }}>
                          NEW
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                      {n.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-subtle)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Mark as Read Action Button */}
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      title="Mark as Read"
                      style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--neu-border-subtle)',
                        boxShadow: 'var(--neu-extruded-sm)',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        transition: 'all 150ms ease',
                        flexShrink: 0
                      }}
                    >
                      <Check size={14} />
                      <span>Read</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--neu-border-subtle)' }}>
            <GlassButton variant="primary" onClick={() => setIsModalOpen(false)}>
              Close Notification Center
            </GlassButton>
          </div>

        </div>
      </GlassModal>
    </>
  );
};

export default NotificationBell;
