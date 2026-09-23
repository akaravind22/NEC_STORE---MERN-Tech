import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Package, TrendingUp, AlertTriangle, UserCheck, Shield, Clock } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAxios } = useAuthStore();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await getAxios().get('/analytics/admin');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>System Administration Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Overview of total registered users, customer/retailer accounts, store orders, and gross platform sales.
        </p>

        {loading ? (
          <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '24px' }}></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Registered Users</span>
                <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-blue)' }}><Users size={22} /></div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{stats?.totalUsers}</div>
            </GlassCard>

            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Customer Accounts</span>
                <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary-cyan)' }}><UserCheck size={22} /></div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{stats?.totalCustomers}</div>
            </GlassCard>

            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Retailer Accounts</span>
                <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(124, 58, 237, 0.15)', color: 'var(--primary-purple)' }}><Shield size={22} /></div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{stats?.totalRetailers}</div>
            </GlassCard>

            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Store Items</span>
                <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}><Package size={22} /></div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{stats?.totalProducts}</div>
            </GlassCard>

            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Store Orders</span>
                <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}><ShoppingBag size={22} /></div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{stats?.totalOrders}</div>
            </GlassCard>

            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Gross Store Sales</span>
                <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-blue)' }}><TrendingUp size={22} /></div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                ₹{parseFloat(stats?.totalSales || 0).toFixed(2)}
              </div>
            </GlassCard>

            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Pending Dispatch Orders</span>
                <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}><Clock size={22} /></div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.pendingOrders}</div>
            </GlassCard>

            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Low Stock Alert Items</span>
                <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}><AlertTriangle size={22} /></div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ef4444' }}>{stats?.lowStockProducts}</div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
