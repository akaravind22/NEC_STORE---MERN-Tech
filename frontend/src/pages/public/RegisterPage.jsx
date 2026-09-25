import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, GraduationCap, Store, ShieldCheck } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassInput from '../../components/common/GlassInput';
import GlassButton from '../../components/common/GlassButton';
import { useAuthStore } from '../../store/useAuthStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const RegisterPage = () => {
  const [role, setRole] = useState('CUSTOMER');
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
    const res = await register({
      ...formData,
      role
    });
    if (res.success) {
      navigate('/login');
    }
  };

  const roles = [
    {
      id: 'CUSTOMER',
      label: 'Student / Customer',
      icon: GraduationCap,
      color: 'var(--primary-blue)',
      bgActive: 'var(--gradient-primary)',
      badge: 'Student',
      description: 'Order campus products with express pickup.'
    },
    {
      id: 'RETAILER',
      label: 'Campus Retailer',
      icon: Store,
      color: 'var(--primary-purple)',
      bgActive: 'var(--gradient-secondary)',
      badge: 'Retailer',
      description: 'Manage store stock, inventory, and order fulfillment.'
    },
    {
      id: 'ADMIN',
      label: 'Store Admin',
      icon: ShieldCheck,
      color: 'var(--status-danger)',
      bgActive: 'var(--gradient-danger)',
      badge: 'Administrator',
      description: 'Full administrative control and analytics.'
    }
  ];

  const currentRoleConfig = roles.find((r) => r.id === role);

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container" style={{ minHeight: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: '540px' }}>
          <GlassCard hover={false} style={{ padding: '36px 30px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: currentRoleConfig?.bgActive || 'var(--gradient-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '0 auto 14px auto',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  transition: 'background 250ms ease'
                }}
              >
                <UserPlus size={26} />
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Create Account</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                {currentRoleConfig?.description}
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                SELECT ACCOUNT ROLE *
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.03)',
                  padding: '4px',
                  borderRadius: '14px',
                  border: '1px solid var(--glass-border-subtle)'
                }}
              >
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '10px',
                        border: 'none',
                        background: isSelected ? r.bgActive : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--text-main)',
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                        transition: 'all 200ms ease'
                      }}
                    >
                      <Icon size={18} color={isSelected ? '#ffffff' : r.color} />
                      <span>{r.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <GlassInput
                label="Full Name"
                name="name"
                placeholder={role === 'CUSTOMER' ? 'e.g. Aarav Patel' : role === 'RETAILER' ? 'e.g. Campus Co-op Retailer' : 'e.g. Dr. S. K. Sharma'}
                value={formData.name}
                onChange={handleChange}
                required
              />

              <GlassInput
                label="Email Address"
                name="email"
                type="email"
                placeholder={role === 'CUSTOMER' ? 'e.g. student@necstore.com' : role === 'RETAILER' ? 'e.g. retailer@necstore.com' : 'e.g. admin@necstore.com'}
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <GlassInput
                  label={role === 'CUSTOMER' ? 'Roll Number' : role === 'RETAILER' ? 'Staff / Retailer ID' : 'Admin Staff ID'}
                  name="rollNumber"
                  placeholder={role === 'CUSTOMER' ? 'e.g. NEC2024CSE042' : role === 'RETAILER' ? 'e.g. RET-042' : 'e.g. ADM-001'}
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
                <GlassInput
                  label={role === 'CUSTOMER' ? 'Department' : role === 'RETAILER' ? 'Store Counter / Section' : 'Admin Division'}
                  name="department"
                  placeholder={role === 'CUSTOMER' ? 'e.g. Computer Science' : role === 'RETAILER' ? 'e.g. Stationery Store' : 'e.g. Administration'}
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
                variant={role === 'CUSTOMER' ? 'primary' : role === 'RETAILER' ? 'accent' : 'danger'}
                size="lg"
                disabled={loading}
                icon={ArrowRight}
                style={{ width: '100%', marginTop: '6px' }}
              >
                {loading ? 'Creating Account...' : `Register as ${currentRoleConfig?.badge}`}
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
