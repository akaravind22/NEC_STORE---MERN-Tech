import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../../components/common/GlassCard';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';

const SalesAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAxios } = useAuthStore();

  useEffect(() => {
    const fetchAnalytics = async () => {
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
    fetchAnalytics();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Sales Analytics & Reports</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Evaluate store performance, average order values, and daily order volume.
        </p>

        {loading ? (
          <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '24px' }}></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <GlassCard style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>Total Store Revenue</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                  ₹{parseFloat(stats?.totalSales || 0).toFixed(2)}
                </div>
              </GlassCard>

              <GlassCard style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>Total Active Products</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.totalProducts}</div>
              </GlassCard>

              <GlassCard style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>Pending Order Volume</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.pendingOrders}</div>
              </GlassCard>
            </div>

            <GlassCard hover={false} style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>Daily Order Volume Chart</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Daily number of student orders placed over the past 7 days</p>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '5px 14px', borderRadius: '9999px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                  {(charts?.salesChart || []).reduce((acc, c) => acc + (c.orders || 0), 0)} Total Orders this Week
                </span>
              </div>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.salesChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="orderBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.85} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neu-border-subtle)" />
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid var(--neu-border)' }}
                      formatter={(val) => [`${val} Orders`, 'Daily Volume']}
                    />
                    <Bar
                      dataKey="orders"
                      fill="url(#orderBarGradient)"
                      radius={[10, 10, 0, 0]}
                      maxBarSize={56}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </>
        )}
      </main>
    </div>
  );
};

export default SalesAnalyticsPage;
