import React, { useState, useEffect } from 'react';
import { Package, Layers, ShoppingBag, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GlassCard from '../../components/common/GlassCard';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const STATUS_CONFIG = {
  Completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  Processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  Created: { label: 'New / Created', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  Cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' }
};

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

    const totalOrdersInRatio = (charts?.orderStatusChart || []).reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Retailer Control Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Real-time store metrics, inventory levels, sales revenue, and customer orders.
        </p>


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
              {/* Left Column: Sales Revenue Trend Area Graph */}
              <GlassCard hover={false} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>Sales Revenue Trend (7 Days)</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily store sales performance</p>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                    ₹{stats?.totalSales || '0.00'} Total
                  </span>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts?.salesChart || []}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neu-border-subtle)" />
                      <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip
                        contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid var(--neu-border)' }}
                        formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Daily Revenue']}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Right Column: Order Status Ratio Donut Chart with Words & Legend */}
              <GlassCard hover={false} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>Order Status Ratio</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Breakdown by fulfillment status</p>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                    {totalOrdersInRatio} Total Orders
                  </span>
                </div>

                {totalOrdersInRatio === 0 ? (
                  <div style={{ height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '8px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--app-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--neu-pressed-sm)' }}>
                      <ShoppingBag size={22} color="var(--text-muted)" />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem' }}>No orders recorded yet</p>
                  </div>
                ) : (
                  <>
                    <div style={{ position: 'relative', width: '100%', height: 185 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={(charts?.orderStatusChart || []).filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {(charts?.orderStatusChart || []).filter(item => item.value > 0).map((entry, index) => {
                              const config = STATUS_CONFIG[entry.name] || { color: COLORS[index % COLORS.length] };
                              return <Cell key={`cell-${index}`} fill={config.color} />;
                            })}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid var(--neu-border)' }}
                            formatter={(val, name) => [
                              `${val} Orders (${totalOrdersInRatio > 0 ? ((val / totalOrdersInRatio) * 100).toFixed(0) : 0}%)`,
                              STATUS_CONFIG[name]?.label || name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Donut Label */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center',
                          pointerEvents: 'none'
                        }}
                      >
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                          {totalOrdersInRatio}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', fontWeight: 700 }}>
                          Orders
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Status Breakdown Legend with Words, Numbers & Percentages */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--neu-border-subtle)' }}>
                      {(charts?.orderStatusChart || []).map((entry) => {
                        const config = STATUS_CONFIG[entry.name] || { label: entry.name, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' };
                        const percent = totalOrdersInRatio > 0 ? Math.round((entry.value / totalOrdersInRatio) * 100) : 0;
                        return (
                          <div
                            key={entry.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              background: 'var(--app-bg)',
                              border: '1px solid var(--neu-border-subtle)',
                              boxShadow: 'var(--neu-pressed-sm)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: config.color,
                                  boxShadow: `0 0 6px ${config.color}`
                                }}
                              />
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {entry.name}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: config.color }}>
                              {entry.value} ({percent}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </GlassCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default RetailerDashboard;
