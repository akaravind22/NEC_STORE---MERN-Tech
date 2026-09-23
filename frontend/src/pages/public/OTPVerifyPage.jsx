import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import { useAuthStore } from '../../store/useAuthStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const OTPVerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, sendOtp, loading } = useAuthStore();

  const email = location.state?.email || '';
  const initialDemoOtp = location.state?.demoOtp || '';

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState(initialDemoOtp);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle single digit typing
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown for backspace back-navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste 6-digit string
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) return;

    const res = await verifyOtp(email, fullOtp);
    if (res.success) {
      const role = res.user.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'RETAILER') navigate('/retailer');
      else navigate('/customer/products');
    }
  };

  const handleResend = async () => {
    const res = await sendOtp(email);
    if (res.success) {
      setTimer(300);
      if (res.demoOtp) setDemoOtp(res.demoOtp);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <GlassCard hover={false} style={{ padding: '40px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
                <ShieldCheck size={28} />
              </div>

              <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Verify Login Code</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Enter the 6-digit OTP code sent to <strong style={{ color: 'var(--text-main)' }}>{email}</strong>
              </p>
            </div>

            {/* Demo Mode Notice Box */}
            {demoOtp && (
              <div
                style={{
                  margin: '0 0 24px 0',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ DEMO MODE ACTIVE - GENERATED OTP:
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '6px', color: 'var(--primary-blue)', marginTop: '4px' }}>
                  {demoOtp}
                </div>
                <button
                  onClick={() => setOtpDigits(demoOtp.split(''))}
                  style={{
                    marginTop: '8px',
                    background: 'var(--primary-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Click to Auto-Fill OTP
                </button>
              </div>
            )}

            <form onSubmit={handleVerify}>
              {/* 6 OTP Input Boxes */}
              <div className="otp-container" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="otp-box"
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Code expires in: <strong style={{ color: 'var(--primary-purple)' }}>{formatTimer(timer)}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 240}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: timer > 240 ? 'var(--text-subtle)' : 'var(--primary-blue)',
                    fontWeight: 700,
                    cursor: timer > 240 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={14} /> Resend OTP
                </button>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || otpDigits.join('').length !== 6}
                style={{ width: '100%' }}
              >
                {loading ? 'Verifying...' : 'Verify OTP & Enter Store'}
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OTPVerifyPage;
