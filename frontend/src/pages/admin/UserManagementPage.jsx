import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle, ShieldCheck, Eye } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import GlassButton from '../../components/common/GlassButton';
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
  const { getAxios } = useAuthStore();
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

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>User Account Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Search, view, suspend, or activate Customer and Retailer accounts.
        </p>

        {/* Filter Bar */}
        <GlassCard hover={false} style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search by name, email, or roll number..."
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
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="RETAILER">RETAILER</option>
              <option value="ADMIN">ADMIN</option>
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
                <th>Department</th>
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
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px', background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : u.role === 'RETAILER' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(56, 189, 248, 0.15)', color: u.role === 'ADMIN' ? '#ef4444' : u.role === 'RETAILER' ? '#7c3aed' : '#2563eb' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.rollNumber || 'N/A'}</td>
                    <td>{u.department || 'N/A'}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td><StatusBadge status={u.status} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedUser(u)}
                          style={{ background: 'rgba(56, 189, 248, 0.15)', border: 'none', borderRadius: '8px', padding: '6px 10px', color: 'var(--primary-blue)', cursor: 'pointer' }}
                        >
                          <Eye size={15} />
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => toggleUserStatus(u.id, u.status)}
                            disabled={updating}
                            style={{
                              background: u.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: u.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                              cursor: 'pointer'
                            }}
                            title={u.status === 'ACTIVE' ? 'Suspend user' : 'Activate user'}
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
                <div style={{ fontWeight: 700 }}>{selectedUser.role}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Account Status:</span>
                <div><StatusBadge status={selectedUser.status} /></div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Roll Number / Staff ID:</span>
                <div style={{ fontWeight: 700 }}>{selectedUser.rollNumber || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Department:</span>
                <div style={{ fontWeight: 700 }}>{selectedUser.department || 'N/A'}</div>
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Registered Email:</span>
              <div style={{ fontWeight: 700 }}>{selectedUser.email}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Phone Contact:</span>
              <div style={{ fontWeight: 700 }}>{selectedUser.phone || 'N/A'}</div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export default UserManagementPage;
