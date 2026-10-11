import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, Mail, ShieldCheck, CheckCircle, RefreshCw, Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import GlassModal from '../common/GlassModal';
import GlassButton from '../common/GlassButton';
import GlassInput from '../common/GlassInput';
import { useAuthStore } from '../../store/useAuthStore';

const ForgotPasswordModal = ({ isOpen, onClose, onPasswordResetSuccess }) => {
  const { sendForgotPasswordOtp, resetPasswordWithOtp, loading } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [errorMsg, setErrorMsg] = useState('');

  const inputRefs = useRef([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail('');
      setOtpDigits(['', '', '', '', '', '']);
      setDemoOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setTimer(600);
    }
  }, [isOpen]);

  // OTP Countdown timer
  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    const res = await sendForgotPasswordOtp(email.trim());
    if (res.success) {
      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
      }
      setTimer(600);
      setStep(2);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  // Handle OTP digit change
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtpDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    setErrorMsg('');
    const res = await sendForgotPasswordOtp(email);
    if (res.success) {
      setTimer(600);
      if (res.demoOtp) setDemoOtp(res.demoOtp);
    }
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-check.');
      return;
    }

    const res = await resetPasswordWithOtp(email, fullOtp, newPassword);
    if (res.success) {
      setStep(3);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} maxWidth="540px">
      <div style={{ padding: '8px' }}>

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '0 auto 16px auto',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
              }}>
                <KeyRound size={26} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                Reset Your Password
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                Enter your registered account email address. We'll send a 6-digit OTP code to verify your identity.
              </p>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <GlassInput
                label="Registered Email Address"
                type="email"
                required
                placeholder="e.g. student@nec.edu.in or retailer@necstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <GlassButton type="button" variant="outline" onClick={onClose} style={{ flex: 1 }}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary" loading={loading} icon={ArrowRight} style={{ flex: 2 }}>
                  Send OTP Code
                </GlassButton>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFY OTP & ENTER NEW PASSWORD */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '0 auto 14px auto',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                Verify OTP & Set New Password
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                Verification code sent to <strong style={{ color: 'var(--primary-blue)' }}>{email}</strong>
              </p>
            </div>

            {/* Live email mode active */}

            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  6-Digit OTP Code
                </label>
                <div className="otp-container" onPaste={handlePaste} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      style={{
                        width: '46px',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        borderRadius: '12px',
                        border: '2px solid rgba(99, 102, 241, 0.25)',
                        background: 'var(--surface-color, #ffffff)',
                        color: 'var(--text-main)',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Expires in: <strong style={{ color: 'var(--primary-purple)' }}>{formatTimer(timer)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={timer > 540}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: timer > 540 ? 'var(--text-subtle, #94a3b8)' : 'var(--primary-blue)',
                      fontWeight: 700,
                      cursor: timer > 540 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={13} /> Resend OTP
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div style={{ position: 'relative' }}>
                <GlassInput
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                    alignItems: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Confirm New Password */}
              <div style={{ position: 'relative' }}>
                <GlassInput
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '36px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <GlassButton type="button" variant="outline" onClick={() => setStep(1)} style={{ flex: 1 }}>
                  Back
                </GlassButton>
                <GlassButton
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading || otpDigits.join('').length !== 6 || !newPassword || !confirmPassword}
                  style={{ flex: 2 }}
                >
                  Update Password
                </GlassButton>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 16px auto',
              boxShadow: '0 10px 24px rgba(16, 185, 129, 0.35)'
            }}>
              <CheckCircle size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
              Password Reset Complete!
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Your password has been updated successfully. You can now log into your account using your new password.
            </p>

            <GlassButton
              variant="primary"
              size="lg"
              onClick={() => {
                onClose();
                if (onPasswordResetSuccess) {
                  onPasswordResetSuccess(email);
                }
              }}
              style={{ width: '100%' }}
            >
              Sign In Now
            </GlassButton>
          </div>
        )}

      </div>
    </GlassModal>
  );
};

export default ForgotPasswordModal;
