import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  FileSpreadsheet,
  Users,
  Bell,
  User,
  LogOut,
  Store,
  Sun,
  Moon
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import NotificationBell from '../common/NotificationBell';

const Sidebar = () => {
  const { user, logout, theme, toggleTheme } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isRetailer = user?.role === 'RETAILER';
  const isAdmin = user?.role === 'ADMIN';

  const retailerNav = [
    { label: 'Dashboard', path: '/retailer', icon: LayoutDashboard },
    { label: 'Products', path: '/retailer/products', icon: Package },
    { label: 'Inventory Stock', path: '/retailer/stock', icon: Layers },
    { label: 'Customer Orders', path: '/retailer/orders', icon: ShoppingBag },
    { label: 'Sales Analytics', path: '/retailer/sales', icon: TrendingUp },
    { label: 'Transactions', path: '/retailer/transactions', icon: CreditCard },
    { label: 'Excel Reports', path: '/retailer/reports', icon: FileSpreadsheet },
    { label: 'Notifications', path: '/retailer/notifications', icon: Bell },
    { label: 'My Profile', path: '/retailer/profile', icon: User }
  ];

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'My Profile', path: '/admin/profile', icon: User }
  ];

  const items = isRetailer ? retailerNav : isAdmin ? adminNav : [];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className="glass-card"
      style={{
        width: '260px',
        minHeight: 'calc(100vh - 48px)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '24px',
        flexShrink: 0
      }}
    >
      <div>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '28px', paddingLeft: '8px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'var(--gradient-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)'
            }}
          >
            <Store size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              NEC <span style={{ color: 'var(--primary-purple)' }}>PORTAL</span>
            </span>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              {isRetailer ? 'RETAILER CONTROL PANEL' : 'SYSTEM ADMINISTRATION'}
            </div>
          </div>
        </Link>

        {/* User Card */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.3)',
            border: '1px solid var(--glass-border-subtle)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--primary-purple)', fontWeight: 600 }}>{user?.role}</div>
          </div>
          <NotificationBell placement="left" />
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  background: active ? 'var(--gradient-primary)' : 'transparent',
                  boxShadow: active ? '0 8px 20px -4px rgba(37, 99, 235, 0.4)' : 'none',
                  transition: 'all 200ms ease'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div style={{ paddingTop: '20px', borderTop: '1px solid var(--glass-border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '14px',
            background: 'transparent',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
        </button>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--status-danger)',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
