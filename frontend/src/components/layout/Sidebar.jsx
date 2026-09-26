import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
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
    { label: 'Store Timings', path: '/retailer/timings', icon: Clock },
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
    { label: 'Store Timings', path: '/admin/timings', icon: Clock },
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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '26px', paddingLeft: '8px' }}>
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
              boxShadow: '4px 4px 12px rgba(124, 58, 237, 0.35), -3px -3px 8px var(--neu-shadow-light)'
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

        {/* User Card (Neumorphic Inset) */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--neu-border-subtle)',
            boxShadow: 'var(--neu-pressed-sm)',
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
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                  padding: '11px 16px',
                  borderRadius: '14px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  background: active ? 'var(--gradient-primary)' : 'transparent',
                  boxShadow: active
                    ? '4px 4px 12px rgba(37, 99, 235, 0.35), -2px -2px 8px var(--neu-shadow-light)'
                    : 'none',
                  border: active ? 'none' : '1px solid transparent',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.boxShadow = 'var(--neu-extruded-sm)';
                    e.currentTarget.style.borderColor = 'var(--neu-border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
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
      <div style={{ paddingTop: '20px', borderTop: '1px solid var(--neu-border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '14px',
            background: 'var(--card-bg)',
            border: '1px solid var(--neu-border)',
            boxShadow: 'var(--neu-extruded-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 200ms ease'
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
            background: 'var(--card-bg)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: 'var(--neu-extruded-sm)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--status-danger)',
            cursor: 'pointer',
            transition: 'all 200ms ease'
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
