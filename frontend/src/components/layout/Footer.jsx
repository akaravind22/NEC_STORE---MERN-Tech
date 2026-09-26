import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck } from 'lucide-react';
import GlassCard from '../common/GlassCard';

const Footer = () => {
  return (
    <footer style={{ marginTop: '60px', paddingBottom: '30px' }}>
      <GlassCard hover={false} style={{ padding: '36px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: 'var(--neu-extruded-sm)' }}>
                <Store size={20} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                NEC <span style={{ color: 'var(--primary-blue)' }}>STORE</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Full-Stack College Store & Inventory Management System for National Engineering Campus.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-main)' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
              <Link to="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Browse Products</Link>
              <Link to="/customer/cart" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Shopping Cart</Link>
              <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Account Login</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-main)' }}>College Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Central Co-op Store, Block A</span>
              <span>Email: support@necstore.com</span>
              <span>Helpline: +91 (044) 2890-1122</span>
              <span>Mon - Sat: 8:30 AM - 5:30 PM</span>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--neu-border-subtle)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          <div>� 2026 NEC Store. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="var(--primary-blue)" /> Verified Razorpay Payment Gateway & TLS Security
          </div>
        </div>
      </GlassCard>
    </footer>
  );
};

export default Footer;
