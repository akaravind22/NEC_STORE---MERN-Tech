import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {ArrowRight, ShoppingBag, ShieldCheck, Zap, Layers, Store, Award, Clock, Calendar } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/customer/ProductCard';
import { useAuthStore } from '../../store/useAuthStore';
import { useStoreTimingStore } from '../../store/useStoreTimingStore';
import { Coffee } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LandingPage = () => {
  const { liveStatus, fetchSettings } = useStoreTimingStore();
  React.useEffect(() => { fetchSettings(); }, [fetchSettings]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/products?sortBy=newest`),
          axios.get(`${API_URL}/products/categories`)
        ]);
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.products.slice(0, 4));
        if (catRes.data.success) setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Landing page fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container">
        {/* Hero Section */}
        <section style={{ margin: '40px 0 60px 0' }}>
          <GlassCard hover={false} style={{ padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
            {/* Glowing Accent Shapes */}
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
            
            <div style={{ maxWidth: '750px', position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--primary-blue)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: '20px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                <Zap size={15} /> NATIONAL ENGINEERING COLLEGE STORE
              </div>

              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.1, marginBottom: '20px' }}>
                Shop Smarter at <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEC Store</span>
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                Everything you need for campus life in one place — textbooks, scientific calculators, engineering lab gear, stationery, and college apparel with instant OTP verification and seamless Razorpay checkout.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <GlassButton variant="primary" size="lg" icon={ShoppingBag}>
                    Explore Store Products
                  </GlassButton>
                </Link>

                {isAuthenticated ? (
                  user?.role === 'RETAILER' ? (
                    <Link to="/retailer" style={{ textDecoration: 'none' }}>
                      <GlassButton variant="secondary" size="lg" icon={Store}>
                        Open Retailer Panel
                      </GlassButton>
                    </Link>
                  ) : user?.role === 'ADMIN' ? (
                    <Link to="/admin" style={{ textDecoration: 'none' }}>
                      <GlassButton variant="secondary" size="lg" icon={Store}>
                        Open Admin Panel
                      </GlassButton>
                    </Link>
                  ) : (
                    <Link to="/customer/orders" style={{ textDecoration: 'none' }}>
                      <GlassButton variant="secondary" size="lg" icon={ArrowRight}>
                        View My Orders
                      </GlassButton>
                    </Link>
                  )
                ) : (
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <GlassButton variant="secondary" size="lg" icon={ArrowRight}>
                      Sign In with OTP
                    </GlassButton>
                  </Link>
                )}
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Store Timings & Operating Hours Banner (Visible only when logged out / public visitors) */}
        {!isAuthenticated && (
          <section style={{ marginBottom: '32px' }}>
            <GlassCard hover={false} style={{ padding: '20px 28px', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--neu-extruded-sm)' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Store Operating Hours</h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: liveStatus?.isOpen ? 'rgba(22, 163, 74, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                          color: liveStatus?.isOpen ? '#16a34a' : '#d97706',
                          border: `1px solid ${liveStatus?.isOpen ? 'rgba(22, 163, 74, 0.25)' : 'rgba(217, 119, 6, 0.25)'}`
                        }}
                      >
                        ● {liveStatus?.message || 'Store Schedule Active'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      <span><strong>Starting Time:</strong> <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{liveStatus?.formattedOpen || '8:30 AM'}</span></span>
                      <span>•</span>
                      <span><strong>Closing Time:</strong> <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{liveStatus?.formattedClose || '5:30 PM'}</span></span>
                      <span>•</span>
                      <span><strong>Lunch Break:</strong> <span style={{ color: '#d97706', fontWeight: 600 }}>{liveStatus?.formattedLunchInterval || '1:00 PM – 2:00 PM'}</span></span>
                      <span>•</span>
                      <span><strong>Working Days:</strong> {liveStatus?.workingDays || 'Monday – Saturday'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--app-bg)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--neu-border-subtle)', boxShadow: 'var(--neu-pressed-sm)' }}>
                  <span>📍 Central Co-op Store, Block A</span>
                  <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>⚡ Dynamic Campus Timetable</span>
                </div>
              </div>
            </GlassCard>
          </section>
        )}

        {/* Feature Highlights Grid */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <GlassCard style={{ padding: '28px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>OTP Email Security</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Passwordless 6-digit email OTP authentication ensuring student roll number verification.
              </p>
            </GlassCard>

            <GlassCard style={{ padding: '28px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(124, 58, 237, 0.15)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Inventory Audit & Costing</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Automated weighted average buying price formula, low stock thresholds, and stock history tracking.
              </p>
            </GlassCard>

            <GlassCard style={{ padding: '28px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Verified Razorpay Payments</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Backend HMAC SHA256 signature verification preventing price manipulation.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Categories Section */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', textAlign: 'center' }}>Popular Campus Categories</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} style={{ textDecoration: 'none' }}>
                <GlassCard style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.description || 'Campus items'}</div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Featured Store Items</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Top quality essentials available for instant campus pickup</p>
            </div>
            <Link to="/products" style={{ textDecoration: 'none' }}>
              <GlassButton variant="secondary" size="sm">View All ({featuredProducts.length}+)</GlassButton>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
