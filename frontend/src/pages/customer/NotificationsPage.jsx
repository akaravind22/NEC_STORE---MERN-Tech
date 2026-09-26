import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, ShoppingBag, UserPlus } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import EmptyState from '../../components/common/EmptyState';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuthStore } from '../../store/useAuthStore';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { getAxios, user } = useAuthStore();

  // Retailers only see store operational alerts (orders, inventory), not student registrations
  const displayNotifications = user?.role === 'RETAILER'
    ? notifications.filter(n => n.type !== 'USER_REGISTERED' && !n.title?.includes('Student Registered') && !n.title?.includes('Customer Registered') && !n.title?.includes('Retailer Registered'))
    : notifications;
  const [loading, setLoading] = useState(true);

  const isRetailerOrAdmin = user?.role === 'RETAILER' || user?.role === 'ADMIN';

  const fetchNotifications = async () => {
    try {
      const res = await getAxios().get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await getAxios().put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK': return <AlertTriangle size={20} color="#ef4444" />;
      case 'ORDER_PLACED':
      case 'PAYMENT_SUCCESS': return <ShoppingBag size={20} color="#10b981" />;
      case 'USER_REGISTERED': return <UserPlus size={20} color="#3b82f6" />;
      default: return <Info size={20} color="#a855f7" />;
    }
  };

  const NotificationsContent = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: isRetailerOrAdmin ? '2rem' : '2.2rem', marginBottom: '4px' }}>System Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Stay updated on order status changes, stock replenishment, and system alerts.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <GlassButton variant="secondary" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All Read
          </GlassButton>
        )}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '24px' }}></div>
      ) : displayNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          message="You don't have any notifications at the moment."
        />
      ) : (
        <GlassCard hover={false} style={{ padding: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--glass-border-subtle)',
                  background: n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getIcon(n.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{n.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );

  return (
    <div className="page-fade-enter">
      {isRetailerOrAdmin ? (
        <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0 }}>
            {NotificationsContent}
          </main>
        </div>
      ) : (
        <>
          <Navbar />
          <main className="app-container">
            {NotificationsContent}
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
