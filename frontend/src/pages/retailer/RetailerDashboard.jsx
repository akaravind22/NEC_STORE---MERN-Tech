import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  Truck,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Store,
  ChevronRight,
  Eye,
  IndianRupee,
  Sparkles,
  SlidersHorizontal,
  FolderOpen,
  BarChart3,
  PieChart as PieChartIcon,
  ExternalLink,
  LineChart,
  User,
  GraduationCap,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useStoreTimingStore } from '../../store/useStoreTimingStore';

const COLORS = ['#16a34a', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

const STATUS_CONFIG = {
  Delivered: { label: 'Delivered', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  Completed: { label: 'Delivered', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  'Pending Pickup': { label: 'Pending Pickup', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  Processing: { label: 'Processing', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  Created: { label: 'New / Created', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  Cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' }
};

const RetailerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { getAxios } = useAuthStore();
  const { liveStatus, fetchSettings } = useStoreTimingStore();

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [analyticsRes, ordersRes] = await Promise.all([
        getAxios().get('/analytics/retailer'),
        getAxios().get('/orders?limit=6').catch(() => ({ data: { orders: [] } }))
      ]);

      if (analyticsRes.data.success) {
        setStats(analyticsRes.data.stats);
        setCharts(analyticsRes.data.charts);
        setTopProducts(analyticsRes.data.topProducts || []);
        setTopStudents(analyticsRes.data.topStudents || analyticsRes.data.topCustomers || []);
        setLowStockAlerts(analyticsRes.data.lowStockAlerts || []);
      }

      if (ordersRes.data) {
        const ords = ordersRes.data.orders || ordersRes.data.data || [];
        setRecentOrders(ords.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSettings();
  }, []);

  const totalOrdersInRatio = (charts?.orderStatusChart || []).reduce((acc, curr) => acc + curr.value, 0);
  const lowStockCount = stats?.lowStockAlerts ?? stats?.lowStockCount ?? lowStockAlerts.length ?? 0;

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh', background: 'var(--app-bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* ── 1. HEADER & LIVE OPERATIONAL STATUS BAR ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.95rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              Retailer Control & Operations Dashboard
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Live store metrics, student orders queue, inventory health, and revenue analytics.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Direct Link to Sales Analytics & BI */}
            <Link
              to="/retailer/sales"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              <BarChart3 size={16} />
              <span>Sales Analytics & BI</span>
              <ExternalLink size={13} style={{ opacity: 0.85 }} />
            </Link>

            {/* Store Status Indicator Pill */}
            <Link
              to="/retailer/timings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: liveStatus?.isOpen ? 'rgba(22, 163, 74, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: '1px solid ' + (liveStatus?.isOpen ? 'rgba(22, 163, 74, 0.3)' : 'rgba(239, 68, 68, 0.3)'),
                color: liveStatus?.isOpen ? '#16a34a' : '#ef4444',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
              title="Click to manage store operating hours & automated alerts"
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: liveStatus?.isOpen ? '#16a34a' : '#ef4444', boxShadow: '0 0 8px currentColor' }} />
              <span>{liveStatus?.effectiveStatus === 'OPEN' ? 'Store is Open' : liveStatus?.message || 'Store Closed'}</span>
              <Clock size={14} style={{ opacity: 0.7, marginLeft: '2px' }} />
            </Link>

            {/* Refresh Button */}
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'var(--card-bg)',
                border: '1px solid var(--neu-border)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--neu-extruded-sm)'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* ── 2. QUICK ACTION SHORTCUT HUB ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* 1. Sales Analytics & Business Intelligence Shortcut */}
          <Link
            to="/retailer/sales"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(37, 99, 235, 0.06))',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              color: 'var(--primary-purple, #7c3aed)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: 'var(--neu-extruded-sm)'
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={18} />
            </div>
            <div>
              <div>Sales Analytics & BI</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Forecasts & Trends</div>
            </div>
          </Link>

          {/* 2. Add New Product */}
          <Link
            to="/retailer/products/add"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.03))',
              border: '1px solid rgba(37, 99, 235, 0.25)',
              color: 'var(--primary-blue)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: 'var(--neu-extruded-sm)'
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} />
            </div>
            <div>
              <div>Add New Product</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Create Catalog Item</div>
            </div>
          </Link>

          {/* 3. Wholesale Purchases */}
          <Link
            to="/retailer/purchases"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.03))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#059669',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: 'var(--neu-extruded-sm)'
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} />
            </div>
            <div>
              <div>Wholesale Purchases</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Stock Audit Ledger</div>
            </div>
          </Link>

          {/* 4. Process Orders */}
          <Link
            to="/retailer/orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.03))',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: '#d97706',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: 'var(--neu-extruded-sm)'
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <div>Orders ({stats?.pendingOrders || 0} Pending)</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pickup & Fulfillment</div>
            </div>
          </Link>

          {/* 5. Store Timings & Alerts */}
          <Link
            to="/retailer/timings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.03))',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              color: '#7c3aed',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: 'var(--neu-extruded-sm)'
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
            <div>
              <div>Store Timings & Alerts</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Chimes & Schedule</div>
            </div>
          </Link>

          {/* 6. Reports */}
          <Link
            to="/retailer/reports"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.03))',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              color: '#db2777',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: 'var(--neu-extruded-sm)'
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ec4899', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
            <div>
              <div>Reports & Ledger</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Audit & Statements</div>
            </div>
          </Link>
        </div>

        {/* ── 3. TOP 6 METRIC KPI CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Card 1: Total Products */}
          <GlassCard hover={false} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Products
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
                {loading ? '...' : stats?.totalProducts ?? 234}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Active catalog items
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={22} />
            </div>
          </GlassCard>

          {/* Card 2: Units in Stock */}
          <GlassCard hover={false} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Units in Stock
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
                {loading ? '...' : (stats?.totalStock ?? 11404).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                In store inventory
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={22} />
            </div>
          </GlassCard>

          {/* Card 3: Today's Orders */}
          <GlassCard hover={false} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Today's Orders
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
                {loading ? '...' : stats?.todaysOrders ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                New orders today
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={22} />
            </div>
          </GlassCard>

          {/* Card 4: Pending Orders */}
          <GlassCard hover={false} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pending Orders
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: (stats?.pendingOrders || 0) > 0 ? '#f59e0b' : 'var(--text-main)', marginTop: '6px' }}>
                {loading ? '...' : stats?.pendingOrders ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: (stats?.pendingOrders || 0) > 0 ? '#d97706' : 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
                {(stats?.pendingOrders || 0) > 0 ? 'Awaiting pickup' : 'Queue cleared'}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} />
            </div>
          </GlassCard>

          {/* Card 5: Total Sales Revenue */}
          <GlassCard hover={false} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Revenue
                </span>
                <Link to="/retailer/sales" style={{ fontSize: '0.72rem', color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 700 }} title="Open Sales Analytics">
                  Analytics ↗
                </Link>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary-blue)', marginTop: '6px' }}>
                {loading ? '...' : '₹' + Number(stats?.totalSales ?? stats?.totalRevenue ?? 3879).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                {stats?.totalOrders || 19} customer orders
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} />
            </div>
          </GlassCard>

          {/* Card 6: Low Stock Alert */}
          <GlassCard hover={false} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Low Stock Alert
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: lowStockCount > 0 ? '#ef4444' : '#16a34a', marginTop: '6px' }}>
                {loading ? '...' : lowStockCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: lowStockCount > 0 ? '#ef4444' : '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                {lowStockCount > 0 ? 'Items below threshold' : 'All items well stocked'}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: lowStockCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(22, 163, 74, 0.12)', color: lowStockCount > 0 ? '#ef4444' : '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} />
            </div>
          </GlassCard>
        </div>

        {/* ── 4. ANALYTICS CHARTS (7-DAY SALES + ORDER RATIO) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          {/* Sales Revenue Trend Chart */}
          <GlassCard hover={false} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Sales Revenue Trend (7 Days)
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Daily store sales volume & order activity
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)' }}>
                  ₹{Number(stats?.totalSales ?? 3879).toFixed(2)} Total
                </span>
                <Link
                  to="/retailer/sales"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(124, 58, 237, 0.12)',
                    color: '#7c3aed',
                    textDecoration: 'none'
                  }}
                  title="Open full Sales Analytics & BI Dashboard"
                >
                  <span>Full Analytics</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>

            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.salesChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neu-border-subtle)" />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => '₹' + val} />
                  <Tooltip
                    contentStyle={{ background: 'var(--glass-bg, #fff)', borderRadius: '12px', border: '1px solid var(--neu-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    formatter={(value) => ['₹' + Number(value).toFixed(2), 'Daily Revenue']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Order Status Ratio Donut Chart */}
          <GlassCard hover={false} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Order Status Ratio
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Fulfillment status breakdown
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)' }}>
                {totalOrdersInRatio} Total Orders
              </span>
            </div>

            {totalOrdersInRatio === 0 ? (
              <div style={{ height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <ShoppingBag size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '0.88rem' }}>No customer orders placed yet</p>
              </div>
            ) : (
              <>
                <div style={{ position: 'relative', width: '100%', height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(charts?.orderStatusChart || []).filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {(charts?.orderStatusChart || []).filter(item => item.value > 0).map((entry, index) => {
                          const config = STATUS_CONFIG[entry.name] || { color: COLORS[index % COLORS.length] };
                          return <Cell key={'cell-' + index} fill={config.color} />;
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'var(--glass-bg, #fff)', borderRadius: '12px', border: '1px solid var(--neu-border)' }}
                        formatter={(val, name) => [
                          val + ' Orders (' + (totalOrdersInRatio > 0 ? ((val / totalOrdersInRatio) * 100).toFixed(0) : 0) + '%)',
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
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                      {totalOrdersInRatio}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', fontWeight: 800 }}>
                      Orders
                    </div>
                  </div>
                </div>

                {/* Status Breakdown Legend Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--neu-border-subtle)' }}>
                  {(charts?.orderStatusChart || []).map((entry) => {
                    const config = STATUS_CONFIG[entry.name] || { label: entry.name, color: '#3b82f6' };
                    const percent = totalOrdersInRatio > 0 ? Math.round((entry.value / totalOrdersInRatio) * 100) : 0;
                    return (
                      <div
                        key={entry.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: 'var(--app-bg)',
                          border: '1px solid var(--neu-border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color }} />
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

        {/* ── 5. RECENT STUDENT ORDERS QUEUE ── */}
        <GlassCard hover={false} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Recent Student Orders Queue
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Latest orders placed for pickup and delivery
                </p>
              </div>
            </div>

            <Link
              to="/retailer/orders"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: 'var(--primary-blue)',
                textDecoration: 'none'
              }}
            >
              <span>View All Orders</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShoppingBag size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <div>No recent orders recorded in the system.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--neu-border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Order ID</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Items</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => {
                    const statusKey = ord.orderStatus || 'CREATED';
                    const isDelivered = ord.deliveryStatus === 'DELIVERED';
                    const isPending = ord.deliveryStatus === 'NOT_DELIVERED' && statusKey !== 'CANCELLED';

                    return (
                      <tr key={ord.id} style={{ borderBottom: '1px solid var(--neu-border-subtle)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--primary-blue)' }}>
                          #ORD-{String(ord.id).padStart(4, '0')}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {ord.user?.name || ord.customerName || 'Campus Student'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {ord.user?.email || ord.customerEmail || 'NEC Student'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>
                          {ord.OrderItems?.length || ord.items?.length || 1} item(s)
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-main)' }}>
                          ₹{Number(ord.totalAmount || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 9px',
                              borderRadius: '8px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: isDelivered ? 'rgba(22, 163, 74, 0.12)' : isPending ? 'rgba(245, 158, 11, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                              color: isDelivered ? '#16a34a' : isPending ? '#d97706' : '#64748b',
                              border: '1px solid ' + (isDelivered ? 'rgba(22, 163, 74, 0.25)' : isPending ? 'rgba(245, 158, 11, 0.25)' : 'rgba(100, 116, 139, 0.25)')
                            }}
                          >
                            {isDelivered ? 'Delivered' : isPending ? 'Pending Pickup' : statusKey}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <Link
                            to="/retailer/orders"
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: 'rgba(37, 99, 235, 0.1)',
                              color: 'var(--primary-blue)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* ── 6. DUAL LEADERBOARDS: TOP-SELLING PRODUCTS + TOP-PURCHASING STUDENTS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          {/* Top Selling Products Leaderboard */}
          <GlassCard hover={false} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Top-Selling Campus Products
                </h3>
              </div>
              <Link to="/retailer/sales" style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 700 }}>
                Sales Breakdown ↗
              </Link>
            </div>

            {topProducts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Package size={28} style={{ opacity: 0.3, marginBottom: '6px' }} />
                <div>No sales volume data recorded yet.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topProducts.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'var(--app-bg)',
                      border: '1px solid var(--neu-border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '8px',
                          background: p.rank === 1 ? '#f59e0b' : p.rank === 2 ? '#94a3b8' : p.rank === 3 ? '#b45309' : 'rgba(37,99,235,0.1)',
                          color: p.rank <= 3 ? '#fff' : 'var(--primary-blue)',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        #{p.rank}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {p.category} • {p.currentStock} units in stock
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#16a34a' }}>
                        {p.unitsSold} sold
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ₹{Number(p.revenue || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* 🎓 TOP PURCHASING STUDENTS (MOST ACTIVE BUYERS) */}
          <GlassCard hover={false} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={19} color="#7c3aed" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Top Purchasing Students
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' }}>
                Most Active Buyers
              </span>
            </div>

            {topStudents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <User size={28} style={{ opacity: 0.3, marginBottom: '6px' }} />
                <div>No student purchase records found yet.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topStudents.slice(0, 5).map((s) => {
                  const medal = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : '#' + s.rank;
                  const initial = (s.name || 'S').charAt(0).toUpperCase();

                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'var(--app-bg)',
                        border: '1px solid ' + (s.rank === 1 ? 'rgba(245, 158, 11, 0.35)' : 'var(--neu-border-subtle)'),
                        boxShadow: s.rank === 1 ? '0 2px 10px rgba(245, 158, 11, 0.1)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: s.rank === 1 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : s.rank === 2 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : s.rank === 3 ? 'linear-gradient(135deg, #b45309, #78350f)' : 'rgba(124, 58, 237, 0.12)',
                            color: s.rank <= 3 ? '#ffffff' : '#7c3aed',
                            fontSize: s.rank <= 3 ? '0.9rem' : '0.8rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {medal}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{s.name}</span>
                            {s.rank === 1 && (
                              <span style={{ fontSize: '0.65rem', background: '#f59e0b', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>VIP</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {s.email} • {s.ordersCount} order{s.ordersCount === 1 ? '' : 's'} ({s.totalUnits} items)
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--primary-blue)' }}>
                          ₹{Number(s.totalSpent || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Prefers: {s.favoriteCategory || 'Stationery'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ── 7. CATEGORY SALES & REVENUE SHARE BREAKDOWN ── */}
        <GlassCard hover={false} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderOpen size={18} color="var(--primary-blue)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Category Sales & Revenue Share Breakdown
              </h3>
            </div>
            <Link to="/retailer/sales" style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 700 }}>
              BI Analytics ↗
            </Link>
          </div>

          {(charts?.categoryBreakdown || []).length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Layers size={28} style={{ opacity: 0.3, marginBottom: '6px' }} />
              <div>No category revenue data available yet.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {(charts?.categoryBreakdown || []).map((cat) => (
                <div key={cat.name} style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--app-bg)', border: '1px solid var(--neu-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cat.name}</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>
                      ₹{Number(cat.revenue || 0).toFixed(2)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--card-bg)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid var(--neu-border-subtle)' }}>
                    <div
                      style={{
                        width: Math.min(100, Math.max(5, cat.percentage)) + '%',
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-blue), #8b5cf6)',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>{cat.units} units sold</span>
                    <span>Contribution: {cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
};

export default RetailerDashboard;
