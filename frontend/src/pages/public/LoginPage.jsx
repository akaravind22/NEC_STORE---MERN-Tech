import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Store, KeyRound, UserCheck } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassInput from '../../components/common/GlassInput';
import GlassButton from '../../components/common/GlassButton';
import { useAuthStore } from '../../store/useAuthStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const { sendOtp, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    const res = await sendOtp(email);
    if (res.success) {
      navigate('/verify-otp', { state: { email, demoOtp: res.demoOtp } });
    }
  };

  const handleQuickDemo = async (demoEmail) => {
    setEmail(demoEmail);
    const res = await sendOtp(demoEmail);
    if (res.success) {
      navigate('/verify-otp', { state: { email: demoEmail, demoOtp: res.demoOtp } });
    }
  };

  return (
    <div className="page-fade-enter" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '820px' }}>
          <GlassCard hover={false} style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>

              {/* Left Side — Login Form */}
              <div style={{
                flex: '1 1 300px',
                padding: '28px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
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
                    <KeyRound size={22} />
                  </div>

                  <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', fontWeight: 800 }}>Account Login</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.4 }}>
                    Enter your email to receive a 6-digit OTP.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <GlassInput
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="e.g. student1@necstore.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <GlassButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    icon={ArrowRight}
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </GlassButton>
                </form>

                {/* Quick Demo Login */}
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--glass-border-subtle)' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Quick Demo Login
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleQuickDemo('student1@necstore.com')}
                      style={{
                        flex: '1 1 auto',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--primary-blue)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🎓 Customer
                    </button>
                    <button
                      onClick={() => handleQuickDemo('retailer@necstore.com')}
                      style={{
                        flex: '1 1 auto',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: 'rgba(124, 58, 237, 0.1)',
                        border: '1px solid rgba(124, 58, 237, 0.2)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--primary-purple)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🏷️ Retailer
                    </button>
                    <button
                      onClick={() => handleQuickDemo('admin@necstore.com')}
                      style={{
                        flex: '1 1 auto',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--status-danger)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ⚙️ Admin
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
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

