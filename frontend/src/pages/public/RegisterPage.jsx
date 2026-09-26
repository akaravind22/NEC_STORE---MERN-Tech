import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassInput from '../../components/common/GlassInput';
import GlassButton from '../../components/common/GlassButton';
import { useAuthStore } from '../../store/useAuthStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    phone: ''
  });

  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(formData);
    if (res.success) {
      navigate('/login');
    }
  };

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <GlassCard hover={false} style={{ padding: '38px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '26px' }}>
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

              <h2 style={{ fontSize: '1.75rem', marginBottom: '4px', fontWeight: 800 }}>Create Student Account</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.4 }}>
                Join NEC Store with your student credentials to browse campus products, pay online, and pick up in seconds without waiting in line.
              </p>
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

            <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
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
