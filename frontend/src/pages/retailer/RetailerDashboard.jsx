import React, { useState, useEffect } from 'react';
import { Package, Layers, ShoppingBag, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GlassCard from '../../components/common/GlassCard';
import Sidebar from '../../components/layout/Sidebar';
import StoreTimingManager from '../../components/retailer/StoreTimingManager';
import { useAuthStore } from '../../store/useAuthStore';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const RetailerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAxios } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAxios().get('/analytics/retailer');
        if (res.data.success) {
          setStats(res.data.stats);
          setCharts(res.data.charts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Retailer Control Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Real-time store metrics, inventory levels, sales revenue, and customer orders.
        </p>

        {/* Store Timings & Operational Controls */}
        <StoreTimingManager />

        {loading ? (
          <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '24px' }}></div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Products</span>
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-blue)' }}><Package size={20} /></div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.totalProducts}</div>
              </GlassCard>

              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Units in Stock</span>
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary-cyan)' }}><Layers size={20} /></div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.totalStock}</div>
              </GlassCard>

              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Today's Orders</span>
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.15)', color: 'var(--primary-purple)' }}><ShoppingBag size={20} /></div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.todaysOrders}</div>
              </GlassCard>

              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Pending Orders</span>
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}><Clock size={20} /></div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.pendingOrders}</div>
              </GlassCard>

              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Sales Revenue</span>
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}><TrendingUp size={20} /></div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-blue)' }}>₹{parseFloat(stats?.totalSales || 0).toFixed(2)}</div>
              </GlassCard>

              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Low Stock Alert</span>
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}><AlertTriangle size={20} /></div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{stats?.lowStockProducts}</div>
              </GlassCard>
            </div>

            {/* Recharts Analytics Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <GlassCard hover={false} style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '20px' }}>Sales Revenue Trend (7 Days)</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts?.salesChart || []}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid var(--glass-border)' }} />
                      <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard hover={false} style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '20px' }}>Order Status Ratio</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts?.orderStatusChart || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(charts?.orderStatusChart || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default RetailerDashboard;
