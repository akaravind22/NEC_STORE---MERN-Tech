import React, { useState } from 'react';
import { User, Mail, Hash, Building, Phone, Edit3, LogOut, Save } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import GlassInput from '../../components/common/GlassInput';
import GlassModal from '../../components/common/GlassModal';
import StatusBadge from '../../components/common/StatusBadge';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuthStore } from '../../store/useAuthStore';

const ProfilePage = () => {
  const { user, logout, updateProfile, loading } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    rollNumber: user?.rollNumber || ''
  });

  const isRetailerOrAdmin = user?.role === 'RETAILER' || user?.role === 'ADMIN';

  const handleOpenEdit = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      department: user?.department || '',
      rollNumber: user?.rollNumber || ''
    });
    setIsEditModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateProfile(formData);
    if (res.success) {
      setIsEditModalOpen(false);
    }
  };

  const ProfileContent = (
    <div style={{ maxWidth: '680px', margin: isRetailerOrAdmin ? '0' : '0 auto', width: '100%' }}>
      <GlassCard hover={false} style={{ padding: '40px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--glass-border-subtle)', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '24px',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.8rem',
                fontWeight: 800,
                boxShadow: '0 12px 24px rgba(37, 99, 235, 0.3)'
              }}
            >
              {user?.name?.[0]}
            </div>

            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{user?.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatusBadge status={user?.status} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-purple)', background: 'rgba(124, 58, 237, 0.12)', padding: '2px 10px', borderRadius: '9999px' }}>
                  {user?.role} ACCOUNT
                </span>
              </div>
            </div>
          </div>

          <GlassButton variant="primary" size="sm" icon={Edit3} onClick={handleOpenEdit}>
            Edit Profile
          </GlassButton>
        </div>

        {/* Account Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.3)', border: '1px solid var(--glass-border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> Email Address (Primary)
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user?.email}</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.3)', border: '1px solid var(--glass-border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hash size={14} /> Roll / Staff Number
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user?.rollNumber || 'Not set'}</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.3)', border: '1px solid var(--glass-border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={14} /> Department
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user?.department || 'Not set'}</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.3)', border: '1px solid var(--glass-border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} /> Phone Number
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user?.phone || 'Not set'}</div>
          </div>
        </div>

        <GlassButton variant="danger" size="lg" icon={LogOut} onClick={logout} style={{ width: '100%' }}>
          Sign Out from Account
        </GlassButton>
      </GlassCard>
    </div>
  );

  return (
    <div className="page-fade-enter">
      {isRetailerOrAdmin ? (
        <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>My User Profile</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
              Manage your personal details, contact information, and role credentials.
            </p>
            {ProfileContent}
          </main>
        </div>
      ) : (
        <>
          <Navbar />
          <main className="app-container" style={{ minHeight: 'calc(100vh - 250px)', padding: '20px 16px' }}>
            {ProfileContent}
          </main>
          <Footer />
        </>
      )}

      {/* Edit Profile Modal */}
      <GlassModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile Information"
        maxWidth="520px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <GlassInput
            label="Full Name"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <GlassInput
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="e.g. 9123456780"
            value={formData.phone}
            onChange={handleChange}
          />

          <GlassInput
            label="Department"
            name="department"
            placeholder="e.g. Computer Science & Eng"
            value={formData.department}
            onChange={handleChange}
          />

          <GlassInput
            label="Roll Number / Staff ID"
            name="rollNumber"
            placeholder="e.g. NEC2024CSE042 or RET-001"
            value={formData.rollNumber}
            onChange={handleChange}
          />

          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            icon={Save}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Saving Changes...' : 'Save Profile Updates'}
          </GlassButton>
        </form>
      </GlassModal>
    </div>
  );
};

export default ProfilePage;
