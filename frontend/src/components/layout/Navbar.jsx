import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, Bell, LogIn, LogOut, Moon, Sun, Store, PackageCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import NotificationBell from '../common/NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout, theme, toggleTheme } = useAuthStore();
  const { getTotalCount } = useCartStore();
  const cartCount = getTotalCount();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="floating-navbar">
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '14px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
          }}
        >
          <Store size={22} />
        </div>
        <div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            NEC <span style={{ color: 'var(--primary-blue)' }}>STORE</span>
          </span>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '-4px', fontWeight: 600 }}>
            CAMPUS STORE & INVENTORY
          </div>
        </div>
      </Link>

      {/* Center Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          to="/"
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '0.9rem',
            fontWeight: 600,
            textDecoration: 'none',
            color: isActive('/') ? 'var(--primary-blue)' : 'var(--text-muted)',
            background: isActive('/') ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
            transition: 'all 200ms ease'
          }}
        >
          Home
        </Link>
        <Link
          to="/customer/products"
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '0.9rem',
            fontWeight: 600,
            textDecoration: 'none',
            color: isActive('/customer/products') ? 'var(--primary-blue)' : 'var(--text-muted)',
            background: isActive('/customer/products') ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
            transition: 'all 200ms ease'
          }}
        >
          Products
        </Link>
        {isAuthenticated && user?.role === 'CUSTOMER' && (
          <Link
            to="/customer/orders"
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              color: isActive('/customer/orders') ? 'var(--primary-blue)' : 'var(--text-muted)',
              background: isActive('/customer/orders') ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              transition: 'all 200ms ease'
            }}
          >
            Orders
          </Link>
        )}
      </nav>

      {/* Right Action Icons & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* Notifications */}
        {isAuthenticated && <NotificationBell />}

        {/* Shopping Cart Badge - Only shown when logged in */}
        {isAuthenticated && (
          <Link
            to="/customer/cart"
            style={{
              position: 'relative',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              textDecoration: 'none'
            }}
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: 'var(--gradient-primary)',
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
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.5)'
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {/* User Account / Login */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to={
                user?.role === 'ADMIN'
                  ? '/admin/profile'
                  : user?.role === 'RETAILER'
                  ? '/retailer/profile'
                  : '/customer/profile'
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                textDecoration: 'none',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <User size={16} color="var(--primary-blue)" />
              <span>{user?.name.split(' ')[0]}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary-purple)', background: 'rgba(124, 58, 237, 0.1)', padding: '2px 6px', borderRadius: '8px' }}>
                {user?.role}
              </span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-danger)',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="glass-btn btn-primary btn-sm"
          >
            <LogIn size={15} /> Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
