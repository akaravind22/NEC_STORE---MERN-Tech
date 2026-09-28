import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, KeyRound, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassInput from '../../components/common/GlassInput';
import GlassButton from '../../components/common/GlassButton';
import { useAuthStore } from '../../store/useAuthStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleRedirect = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'RETAILER') navigate('/retailer');
    else navigate('/products');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    const res = await login(identifier, password);
    if (res?.success) {
      handleRedirect(res.user?.role);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword = 'Password123') => {
    setIdentifier(demoEmail);
    setPassword(demoPassword);
    const res = await login(demoEmail, demoPassword);
    if (res?.success) {
      handleRedirect(res.user?.role);
    }
  };

  return (
    <div className="page-fade-enter" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '840px' }}>
          <GlassCard hover={false} style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>

              {/* Left Side — Direct Password Login Form */}
              <div style={{
                flex: '1 1 320px',
                padding: '32px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: 'var(--gradient-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      marginBottom: '12px',
                      boxShadow: '0 6px 16px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <KeyRound size={24} />
                  </div>

                  <h2 style={{ fontSize: '1.55rem', marginBottom: '4px', fontWeight: 800 }}>Account Login</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.4 }}>
                    Sign in with your email/username and password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <GlassInput
                    label="Username or Email"
                    name="identifier"
                    type="text"
                    placeholder="e.g. admin@necstore.com or Roll No"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />

                  <div style={{ position: 'relative' }}>
                    <GlassInput
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        bottom: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <GlassButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    icon={ArrowRight}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </GlassButton>
                </form>

                {/* Quick 1-Click Demo Login */}
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--glass-border-subtle)' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ⚡ 1-Click Instant Demo Login
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleQuickDemo('student1@necstore.com')}
                      style={{
                        flex: '1 1 auto',
                        padding: '7px 12px',
                        borderRadius: '9px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--primary-blue)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      🎓 Customer
                    </button>
                    <button
                      onClick={() => handleQuickDemo('retailer@necstore.com')}
                      style={{
                        flex: '1 1 auto',
                        padding: '7px 12px',
                        borderRadius: '9px',
                        background: 'rgba(124, 58, 237, 0.12)',
                        border: '1px solid rgba(124, 58, 237, 0.25)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--primary-purple)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      🏷️ Retailer
                    </button>
                    <button
                      onClick={() => handleQuickDemo('admin@necstore.com')}
                      style={{
                        flex: '1 1 auto',
                        padding: '7px 12px',
                        borderRadius: '9px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--status-danger)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ⚙️ Admin
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: 700, textDecoration: 'none' }}>
                    Register here
                  </Link>
                </div>
              </div>

              {/* Right Side — Illustration */}
              <div style={{
                flex: '1 1 280px',
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}>
                <img
                  src="/images/login-illustration.jpg"
                  alt="Secure login illustration"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 24px rgba(99, 102, 241, 0.2))'
                  }}
                />
              </div>

            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
