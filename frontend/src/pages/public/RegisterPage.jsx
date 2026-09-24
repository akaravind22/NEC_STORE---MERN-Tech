import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';
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

      <main className="app-container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <GlassCard hover={false} style={{ padding: '40px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '18px',
                  background: 'var(--gradient-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '0 auto 16px auto',
                  boxShadow: '0 10px 20px rgba(124, 58, 237, 0.3)'
                }}
              >
                <UserPlus size={28} />
              </div>

              <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Create Account</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Join NEC Store to browse items, maintain cart state, and order campus products.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <GlassInput
                label="Full Name"
                name="name"
                placeholder="e.g. Aarav Patel"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <GlassInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. student@necstore.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

              <GlassButton
                type="submit"
                variant="accent"
                size="lg"
                disabled={loading}
                icon={ArrowRight}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? 'Creating Account...' : 'Register Account'}
              </GlassButton>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary-purple)', fontWeight: 700, textDecoration: 'none' }}>
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
