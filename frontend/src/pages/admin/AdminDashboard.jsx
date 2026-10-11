import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  CreditCard,
  Building2,
  GraduationCap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import StatusBadge from '../../components/common/StatusBadge';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAxios, user } = useAuthStore();
  const navigate = useNavigate();

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await getAxios().get('/analytics/admin');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const stats = data?.stats;
  const salesTrend = data?.salesTrend || [];
  const recentOrders = data?.recentOrders || [];
  const recentUsers = data?.recentUsers || [];
  const lowStockAlerts = data?.lowStockAlerts || [];

  // Customer vs Retailer breakdown %
  const totalAccounts = (stats?.totalUsers || 1);
  const customerPct = Math.round(((stats?.totalCustomers || 0) / totalAccounts) * 100);
  const retailerPct = Math.round(((stats?.totalRetailers || 0) / totalAccounts) * 100);
  const adminPct = Math.max(0, 100 - customerPct - retailerPct);

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          border: '1px solid var(--neu-border-subtle, rgba(226, 232, 240, 0.8))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', fontSize: '0.78rem', fontWeight: 800, marginBottom: '8px' }}>
              <Shield size={14} /> SYSTEM ADMINISTRATION
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Live overview of campus store operations, revenue trends, user accounts, and inventory alerts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <GlassButton
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={fetchAdminStats}
              title="Refresh Live Metrics"
            >
              Refresh
            </GlassButton>
            <GlassButton
              variant="primary"
              size="md"
              icon={Users}
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="md"
              icon={Clock}
              onClick={() => navigate('/admin/store-timings')}
            >
              Store Timings
            </GlassButton>
          </div>
        </div>

        {/* 8 Metric KPI Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
          
          {/* Gross Sales */}
          <GlassCard style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gross Store Sales</span>
              <div style={{ padding: '9px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)' }}><TrendingUp size={20} /></div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
              ₹{parseFloat(stats?.totalSales || 0).toFixed(2)}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>● Lifetime platform turnover</span>
          </GlassCard>

          {/* Total Orders */}
          <GlassCard style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Orders</span>
              <div style={{ padding: '9px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}><ShoppingBag size={20} /></div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.totalOrders || 0}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats?.completedOrders || 0} successfully completed</span>
          </GlassCard>

          {/* Pending Dispatch */}
          <GlassCard style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Dispatch</span>
              <div style={{ padding: '9px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}><Clock size={20} /></div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.pendingOrders || 0}</div>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Awaiting store handover</span>
          </GlassCard>

          {/* Low Stock Alert */}
          <GlassCard style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Low Stock Items</span>
              <div style={{ padding: '9px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}><AlertTriangle size={20} /></div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{stats?.lowStockProducts || 0}</div>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Needs immediate restock</span>
          </GlassCard>

          {/* Total Registered Users */}
          <GlassCard style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Registered Users</span>
              <div style={{ padding: '9px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)' }}><Users size={20} /></div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.totalUsers || 0}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Students, retailers & staff</span>
          </GlassCard>

          {/* Student Customers */}
          <GlassCard style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Student Accounts</span>
              <div style={{ padding: '9px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--primary-cyan)' }}><GraduationCap size={20} /></div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.totalCustomers || 0}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: 600 }}>{customerPct}% of total accounts</span>
          </GlassCard>

          {/* Retailer Staff */}
          <GlassCard style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Retailer Staff</span>
              <div style={{ padding: '9px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.12)', color: 'var(--primary-purple)' }}><Building2 size={20} /></div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.totalRetailers || 0}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-purple)', fontWeight: 600 }}>Active store counters</span>
          </GlassCard>

          {/* Store Items */}
          <GlassCard style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Catalog Items</span>
              <div style={{ padding: '9px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}><Package size={20} /></div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.totalProducts || 0}</div>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Active listed products</span>
          </GlassCard>

        </div>

        {/* Middle Section: 7-Day Revenue & Volume Trend Chart */}
        <GlassCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                7-Day Sales & Order Volume Velocity
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Daily gross turnover and customer orders placed across all store sections.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary-blue)' }}></span>
                <span>Revenue (₹)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }}></span>
                <span>Orders Count</span>
              </div>
            </div>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.6)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val, name) => [name === 'sales' ? `₹${val}` : val, name === 'sales' ? 'Revenue' : 'Orders']}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Lower Grid: Recent Orders Feed & Role Demographics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          
          {/* Recent Orders Stream */}
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                  Recent Orders Stream
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Latest customer orders and fulfillment states.
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-blue)' }}>
                Live Stream
              </span>
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No store orders recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentOrders.map(order => (
                  <div key={order.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--neu-border-subtle, rgba(226, 232, 240, 0.6))',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.8rem'
                      }}>
                        #{order.id}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {order.User?.name || 'Customer'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {order.User?.rollNumber ? `Roll: ${order.User.rollNumber}` : order.User?.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>
                        ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px', justifyContent: 'flex-end' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: order.deliveryStatus === 'DELIVERED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: order.deliveryStatus === 'DELIVERED' ? '#10b981' : '#f59e0b'
                        }}>
                          {order.deliveryStatus === 'DELIVERED' ? 'Delivered' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* User Account Demographics & Security Health */}
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                  User Account Demographics
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Role distribution across {stats?.totalUsers || 0} registered accounts.
                </p>
              </div>
              <GlassButton variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
                View All
              </GlassButton>
            </div>

            {/* Visual Bars for Roles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap size={15} color="#06b6d4" /> Students ({stats?.totalCustomers || 0})
                  </span>
                  <span>{customerPct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'rgba(226, 232, 240, 0.6)', overflow: 'hidden' }}>
                  <div style={{ width: `${customerPct}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', borderRadius: '999px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={15} color="#8b5cf6" /> Retailer Staff ({stats?.totalRetailers || 0})
                  </span>
                  <span>{retailerPct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'rgba(226, 232, 240, 0.6)', overflow: 'hidden' }}>
                  <div style={{ width: `${retailerPct}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a855f7)', borderRadius: '999px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={15} color="#ef4444" /> System Administrators ({stats?.totalAdmins || 1})
                  </span>
                  <span>{adminPct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'rgba(226, 232, 240, 0.6)', overflow: 'hidden' }}>
                  <div style={{ width: `${adminPct}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #f43f5e)', borderRadius: '999px' }}></div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Sub-list */}
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 10px 0', letterSpacing: '0.04em' }}>
              Recently Joined Accounts
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentUsers.slice(0, 4).map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.02)', fontSize: '0.82rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>{u.name}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.12)' : u.role === 'RETAILER' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                    color: u.role === 'ADMIN' ? '#ef4444' : u.role === 'RETAILER' ? '#7c3aed' : '#2563eb'
                  }}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Bottom Section: Low Stock Watchlist & System Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          
          {/* Critical Low Stock Watchlist */}
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                  Critical Stock Watchlist
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Items with inventory level at or below restock threshold.
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                {stats?.lowStockProducts || 0} Alerts
              </span>
            </div>

            {lowStockAlerts.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle size={18} /> All store catalog items are healthy and adequately stocked!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {lowStockAlerts.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Category: {item.category} • Price: ₹{item.sellingPrice}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        background: item.quantity === 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: item.quantity === 0 ? '#ef4444' : '#f59e0b'
                      }}>
                        {item.quantity === 0 ? 'Out of Stock (0)' : `Only ${item.quantity} left (Threshold: ${item.threshold})`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Admin Operations & Fast Access Hub */}
          <GlassCard style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
              Quick Administration Shortcuts
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              One-click shortcuts to key administrative modules and tools.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                onClick={() => navigate('/admin/users')}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(37, 99, 235, 0.06)',
                  border: '1px solid rgba(37, 99, 235, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-blue)' }}>
                    <Users size={18} />
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>User Accounts</strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Create retailers, assign roles & remove users.
                </p>
              </div>

              <div
                onClick={() => navigate('/admin/store-timings')}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <Clock size={18} />
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Store Hours</strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Adjust timings, chime alerts & lunch break.
                </p>
              </div>

              <div
                onClick={() => navigate('/customer/products')}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                    <Package size={18} />
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Store Catalog</strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Browse live products & stock pricing.
                </p>
              </div>

              <div
                onClick={() => navigate('/profile')}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(124, 58, 237, 0.06)',
                  border: '1px solid rgba(124, 58, 237, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.15)', color: 'var(--primary-purple)' }}>
                    <Shield size={18} />
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Admin Security</strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Manage profile details & account settings.
                </p>
              </div>
            </div>
          </GlassCard>

        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
