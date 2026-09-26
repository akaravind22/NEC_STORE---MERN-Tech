import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle, Eye, UserPlus, UserCog, Shield, Store, GraduationCap } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import GlassButton from '../../components/common/GlassButton';
import GlassInput from '../../components/common/GlassInput';
import GlassModal from '../../components/common/GlassModal';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Create Staff Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: 'RETAILER',
    rollNumber: '',
    department: '',
    phone: ''
  });

  // Change Role Modal State
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('RETAILER');
  const [changingRole, setChangingRole] = useState(false);

  const { getAxios, user: currentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchUsers = async () => {
    try {
      let query = `?`;
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (roleFilter) query += `role=${roleFilter}&`;
      if (statusFilter) query += `status=${statusFilter}&`;

      const res = await getAxios().get(`/users${query}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUpdating(true);
    try {
      const res = await getAxios().put(`/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) {
      addToast('Name and Email are required.', 'error');
      return;
    }
    setCreatingStaff(true);
    try {
      const res = await getAxios().post('/users/create-staff', staffForm);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setShowCreateModal(false);
        setStaffForm({
          name: '',
          email: '',
          role: 'RETAILER',
          rollNumber: '',
          department: '',
          phone: ''
        });
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create staff account.', 'error');
    } finally {
      setCreatingStaff(false);
    }
  };

  const openRoleModal = (u) => {
    setRoleModalUser(u);
    setSelectedRole(u.role);
  };

  const handleRoleChange = async () => {
    if (!roleModalUser) return;
    setChangingRole(true);
    try {
      const res = await getAxios().put(`/users/${roleModalUser.id}/role`, { role: selectedRole });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setRoleModalUser(null);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user role.', 'error');
    } finally {
      setChangingRole(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>User Account Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Search, view, create store retailers, assign roles, or manage account access.
            </p>
          </div>

          <GlassButton
            variant="primary"
            icon={UserPlus}
            onClick={() => setShowCreateModal(true)}
            style={{ padding: '10px 18px', fontWeight: 700 }}
          >
            + Create Staff / Retailer
          </GlassButton>
        </div>

        {/* Filter Bar */}
        <GlassCard hover={false} style={{ padding: '18px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search by name, email, or roll/staff ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="glass-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">CUSTOMER (Student)</option>
              <option value="RETAILER">RETAILER (Store Staff)</option>
              <option value="ADMIN">ADMIN (System Admin)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="">All Account Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </GlassCard>

        {/* User Table */}
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Roll / Staff ID</th>
                <th>Department / Section</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>Loading user accounts...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No matching users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.12)' : u.role === 'RETAILER' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                          color: u.role === 'ADMIN' ? '#ef4444' : u.role === 'RETAILER' ? '#7c3aed' : '#2563eb',
                          border: `1px solid ${u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.25)' : u.role === 'RETAILER' ? 'rgba(124, 58, 237, 0.25)' : 'rgba(37, 99, 235, 0.25)'}`
                        }}
                      >
                        {u.role === 'ADMIN' ? <Shield size={12} /> : u.role === 'RETAILER' ? <Store size={12} /> : <GraduationCap size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td>{u.rollNumber || '—'}</td>
                    <td>{u.department || '—'}</td>
                    <td>{u.phone || '—'}</td>
                    <td><StatusBadge status={u.status} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedUser(u)}
                          title="View user details"
                          style={{ background: 'rgba(56, 189, 248, 0.15)', border: 'none', borderRadius: '8px', padding: '6px 9px', color: 'var(--primary-blue)', cursor: 'pointer' }}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          onClick={() => openRoleModal(u)}
                          title="Change user role"
                          style={{ background: 'rgba(124, 58, 237, 0.15)', border: 'none', borderRadius: '8px', padding: '6px 9px', color: 'var(--primary-purple)', cursor: 'pointer' }}
                        >
                          <UserCog size={15} />
                        </button>

                        {!(u.role === 'ADMIN' && currentUser?.id === u.id) && (
                          <button
                            onClick={() => toggleUserStatus(u.id, u.status)}
                            disabled={updating}
                            style={{
                              background: u.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 9px',
                              color: u.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                              cursor: 'pointer'
                            }}
                            title={u.status === 'ACTIVE' ? 'Suspend user account' : 'Activate user account'}
                          >
                            {u.status === 'ACTIVE' ? <Ban size={15} /> : <CheckCircle size={15} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal: Create Staff / Retailer */}
      <GlassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Store Staff / Retailer Account"
        maxWidth="520px"
      >
        <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Create an official Retailer or Administrator account. Staff will be able to log in securely using their email OTP.
          </p>

          <div className="glass-input-group">
            <label className="glass-input-label">Account Role *</label>
            <select
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="glass-input"
              style={{ cursor: 'pointer', fontWeight: 600 }}
              required
            >
              <option value="RETAILER">??? RETAILER (Store Staff - Stock & Orders)</option>
              <option value="ADMIN">?? ADMIN (Full Platform Administrator)</option>
            </select>
          </div>

          <GlassInput
            label="Full Name *"
            placeholder="e.g. Ramesh Kumar"
            value={staffForm.name}
            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
            required
          />

          <GlassInput
            label="Official Email Address *"
            type="email"
            placeholder="e.g. retailer.counter1@necstore.com"
            value={staffForm.email}
            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <GlassInput
              label="Staff / Employee ID"
              placeholder="e.g. RET-003"
              value={staffForm.rollNumber}
              onChange={(e) => setStaffForm({ ...staffForm, rollNumber: e.target.value })}
            />
            <GlassInput
              label="Store Section / Division"
              placeholder="e.g. Stationery Store"
              value={staffForm.department}
              onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
            />
          </div>

          <GlassInput
            label="Contact Phone"
            type="tel"
            placeholder="e.g. 9876543210"
            value={staffForm.phone}
            onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <GlassButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              disabled={creatingStaff}
            >
              {creatingStaff ? 'Creating Account...' : 'Create Account'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Modal: Change User Role */}
      <GlassModal
        isOpen={!!roleModalUser}
        onClose={() => setRoleModalUser(null)}
        title={`Change Role: ${roleModalUser?.name}`}
        maxWidth="460px"
      >
        {roleModalUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--glass-border-subtle)', fontSize: '0.88rem' }}>
              <div><strong>Email:</strong> {roleModalUser.email}</div>
              <div style={{ marginTop: '4px' }}><strong>Current Role:</strong> {roleModalUser.role}</div>
            </div>

            <div className="glass-input-group">
              <label className="glass-input-label">Select New Role *</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="glass-input"
                style={{ cursor: 'pointer', fontWeight: 600 }}
              >
                <option value="CUSTOMER">?? CUSTOMER (Student / Customer)</option>
                <option value="RETAILER">??? RETAILER (Campus Store Staff)</option>
                <option value="ADMIN">?? ADMIN (Store System Administrator)</option>
              </select>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {selectedRole === 'CUSTOMER' && 'User will only have access to campus store items, cart, and orders.'}
              {selectedRole === 'RETAILER' && 'User will be granted access to inventory stock, pricing, and order fulfillment.'}
              {selectedRole === 'ADMIN' && 'User will be granted full administrative control and management powers.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <GlassButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setRoleModalUser(null)}
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="button"
                variant="accent"
                size="md"
                disabled={changingRole || selectedRole === roleModalUser.role}
                onClick={handleRoleChange}
              >
                {changingRole ? 'Updating Role...' : 'Save New Role'}
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* User Details Glass Modal */}
      <GlassModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`User Profile: ${selectedUser?.name}`}
        maxWidth="500px"
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Account Role:</span>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedUser.role}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Account Status:</span>
                <div style={{ marginTop: '2px' }}><StatusBadge status={selectedUser.status} /></div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Roll Number / Staff ID:</span>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedUser.rollNumber || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Department / Division:</span>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedUser.department || 'N/A'}</div>
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Registered Email:</span>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedUser.email}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Phone Contact:</span>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedUser.phone || 'N/A'}</div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export default UserManagementPage;
