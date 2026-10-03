import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import GlassInput from '../../components/common/GlassInput';
import GlassButton from '../../components/common/GlassButton';
import GoogleOAuthButton from '../../components/common/GoogleOAuthButton';
import { KeyRound, ArrowRight, Eye, EyeOff, Sparkles, User, ShoppingBag, Shield } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleRedirect = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'RETAILER') navigate('/retailer');
    else navigate('/products');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(identifier, password);
    if (res?.success) {
      handleRedirect(res.user?.role);
    }
  };

  const handleQuickDemo = async (demoEmail) => {
    setIdentifier(demoEmail);
    setPassword('Password123');
    const res = await login(demoEmail, 'Password123');
    if (res?.success) {
      handleRedirect(res.user?.role);
    }
  };

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        <div style={{ width: '100%', maxWidth: '820px' }}>
          <GlassCard hover={false} style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              
              {/* Left Side — Login Form */}
              <div style={{ flex: '1 1 380px', padding: '36px 32px' }}>
                <div style={{ marginBottom: '20px' }}>
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

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 16px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--neu-border-subtle, #e2e8f0)' }}></div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Or Continue With
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--neu-border-subtle, #e2e8f0)' }}></div>
                </div>

                {/* Styled Google OAuth 2.0 Button */}
                <div style={{ marginBottom: '16px' }}>
                  <GoogleOAuthButton label="Continue with Google" />
                </div>

                {/* Quick 1-Click Demo Login */}
                <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--glass-border-subtle)' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <Sparkles size={13} color="var(--primary-blue)" /> 1-Click Instant Demo Login
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('student1@necstore.com')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: 'var(--primary-blue)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <User size={13} /> Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('retailer@necstore.com')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: 'rgba(124, 58, 237, 0.1)',
                        border: '1px solid rgba(124, 58, 237, 0.25)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: 'var(--primary-purple)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ShoppingBag size={13} /> Retailer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('admin@necstore.com')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: 'var(--status-danger)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Shield size={13} /> Admin
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
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
