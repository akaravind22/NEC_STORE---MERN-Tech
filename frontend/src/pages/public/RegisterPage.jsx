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
import { GraduationCap, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || formData.password.length < 6) {
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    const res = await register(formData);
    if (res?.success) {
      navigate('/login');
    }
  };

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        <div style={{ width: '100%', maxWidth: '540px' }}>
          <GlassCard hover={false} style={{ padding: '38px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '0 auto 14px auto',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
                }}
              >
                <GraduationCap size={28} />
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '0', fontWeight: 800 }}>Create Student Account</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <GlassInput
                label="Full Name"
                name="name"
                placeholder="e.g. Aarav Patel"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <GlassInput
                label="Student Email Address"
                name="email"
                type="email"
                placeholder="e.g. student@necstore.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <GlassInput
                  label="Roll Number"
                  name="rollNumber"
                  placeholder="e.g. NEC2024CSE042"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
                <GlassInput
                  label="Department"
                  name="department"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>

              <GlassInput
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="e.g. 9123456780"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              {/* Password and Confirm Password Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ position: 'relative' }}>
                  <GlassInput
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
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
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <GlassInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(37, 99, 235, 0.06)',
                  border: '1px solid rgba(37, 99, 235, 0.15)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}
              >
                <ShieldCheck size={16} color="var(--primary-blue)" style={{ flexShrink: 0 }} />
                <span>
                  Store Retailer and Staff accounts are issued exclusively by the Campus Store Administration.
                </span>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                icon={ArrowRight}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? 'Creating Account...' : 'Register Student Account'}
              </GlassButton>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 16px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--neu-border-subtle, #cbd5e1)' }}></div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Or Register With</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--neu-border-subtle, #cbd5e1)' }}></div>
            </div>

            {/* Google OAuth 2.0 1-Click Signup */}
            <div style={{ marginBottom: '14px' }}>
              <GoogleOAuthButton label="Sign up with Google" />
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: 700, textDecoration: 'none' }}>
                Login here
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
