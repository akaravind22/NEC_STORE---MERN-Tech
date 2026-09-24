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
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <GlassCard hover={false} style={{ padding: '40px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '18px',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '0 auto 16px auto',
                  boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'
                }}
              >
                <KeyRound size={28} />
              </div>

              <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Account Login</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Enter your registered email address to receive a 6-digit login verification OTP.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <GlassInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. student1@necstore.com or admin@necstore.com"
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
                {loading ? 'Sending OTP Code...' : 'Send Verification OTP'}
              </GlassButton>
            </form>

            {/* Quick Demo Login Preset Buttons */}
            <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--glass-border-subtle)' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Instant Demo Mode Quick Login
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleQuickDemo('student1@necstore.com')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--primary-blue)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>🎓 Customer Demo (Aarav Patel)</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>student1@necstore.com</span>
                </button>

                <button
                  onClick={() => handleQuickDemo('retailer@necstore.com')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--primary-purple)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>🏷️ Retailer Demo (Campus Store)</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>retailer@necstore.com</span>
                </button>

                <button
                  onClick={() => handleQuickDemo('admin@necstore.com')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--status-danger)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>⚙️ Admin Demo (Dr. S. K. Sharma)</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>admin@necstore.com</span>
                </button>
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: 700, textDecoration: 'none' }}>
                Register here
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
