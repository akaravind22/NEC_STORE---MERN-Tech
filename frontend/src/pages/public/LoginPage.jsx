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
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';
import { KeyRound, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  
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

  const handlePasswordResetSuccess = (resetEmail) => {
    if (resetEmail) {
      setIdentifier(resetEmail);
    }
    setPassword('');
  };

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        <div style={{ width: '100%', maxWidth: '820px' }}>
          <GlassCard hover={false} style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              
              {/* Left Side — Form */}
              <div style={{ flex: '1 1 360px', padding: '40px 32px', minWidth: '300px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-purple))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  marginBottom: '16px',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)'
                }}>
                  <KeyRound size={22} />
                </div>

                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  Sign In
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 24px 0' }}>
                  Enter your email or username and password to continue.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <GlassInput
                    label="Email or Username"
                    required
                    placeholder="Enter your email or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                  />

                  <div style={{ position: 'relative' }}>
                    <GlassInput
                      label="Password"
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '36px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Forgot Password Link with OTP indication */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-blue)',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      <Lock size={13} />
                      Forgot password?
                    </button>
                  </div>

                  <GlassButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    icon={ArrowRight}
                    style={{ width: '100%', marginTop: '6px' }}
                  >
                    Sign In
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

                {/* Register Link */}
                <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
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

      {/* Forgot Password OTP Verification Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onPasswordResetSuccess={handlePasswordResetSuccess}
      />
    </div>
  );
};

export default LoginPage;
