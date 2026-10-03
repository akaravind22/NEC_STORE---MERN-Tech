import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Award, 
  Download, 
  Calendar, 
  Layers, 
  PieChart as PieChartIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  Tag, 
  Package, 
  Truck, 
  Filter, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import ExcelJS from 'exceljs';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import StatusBadge from '../../components/common/StatusBadge';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

const SalesAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingSection, setDownloadingSection] = useState(null);

  // Timeframe Filter States
  const [timeframe, setTimeframe] = useState('7d'); // '7d' | '30d' | 'month' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchAnalytics = async (range = timeframe, customStart = startDate, customEnd = endDate) => {
    setLoading(true);
    try {
      const params = { range };
      if (range === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }
      const res = await getAxios().get('/analytics/retailer', { params });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      addToast('Failed to load store analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe, startDate, endDate);
  }, [timeframe]);

  const handleApplyCustomDates = () => {
    if (!startDate || !endDate) {
      addToast('Please select both From and To dates.', 'warning');
      return;
    }
    setTimeframe('custom');
    fetchAnalytics('custom', startDate, endDate);
  };

  // Helper to trigger Excel download
  const saveWorkbook = async (workbook, defaultFilename) => {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', defaultFilename + '_' + Date.now() + '.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // ═════════════════════════════════════════════════════════════════
  // 1. DOWNLOAD FULL MASTER EXECUTIVE REPORT
  // ═════════════════════════════════════════════════════════════════
  const downloadMasterReport = async () => {
    if (!data) return;
    setDownloadingSection('master');
    try {
      const workbook = new ExcelJS.Workbook();
      const stats = data.stats || {};
      const tf = data.timeframe || {};

      // ── Sheet 1: Financial & KPI Summary ──
      const ws1 = workbook.addWorksheet('Executive Financial Summary');
      ws1.columns = [{ width: 28 }, { width: 22 }, { width: 34 }];

      ws1.mergeCells('A1:C1');
      const t1 = ws1.getCell('A1');
      t1.value = 'NEC CAMPUS STORE — EXECUTIVE SALES & FINANCIAL SUMMARY';
      t1.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
      t1.alignment = { horizontal: 'center', vertical: 'middle' };
      t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E40AF' } };
      ws1.getRow(1).height = 30;

      ws1.mergeCells('A2:C2');
      const m1 = ws1.getCell('A2');
      m1.value = 'Timeframe: ' + (tf.startDate || '') + ' to ' + (tf.endDate || '') + '  •  Generated on: ' + new Date().toLocaleString('en-IN');
      m1.font = { italic: true, size: 10, color: { argb: '374151' } };
      m1.alignment = { horizontal: 'center', vertical: 'middle' };
      m1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
      ws1.getRow(2).height = 20;

      ws1.getRow(3).values = [];
      const hRow1 = ws1.getRow(4);
      hRow1.values = ['Key Performance Metric', 'Calculated Value', 'Business Interpretation'];
      hRow1.font = { bold: true, color: { argb: 'FFFFFF' } };
      hRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
      hRow1.height = 24;

      const kpis = [
        ['Total Sales Revenue (Inflow)', '₹' + stats.totalRevenue?.toFixed(2), 'Total payments received from student orders'],
        ['Cost of Goods Sold (Wholesale Cost)', '₹' + stats.totalCostOfGoodsSold?.toFixed(2), 'Wholesale acquisition cost of sold items'],
        ['Net Gross Profit', '₹' + stats.grossProfit?.toFixed(2), 'Revenue minus cost of goods sold'],
        ['Gross Profit Margin', stats.profitMargin + '%', 'Return on store turnover'],
        ['Average Order Value (AOV)', '₹' + stats.averageOrderValue?.toFixed(2), 'Average student spend per order'],
        ['Total Student Orders Placed', stats.totalOrders + ' orders', 'Order volume in selected period'],
        ['Total Item Units Sold', stats.totalUnitsSold + ' units', 'Total physical items handed to students'],
        ['Wholesale Restock Purchases', '₹' + stats.totalWholesalePurchases?.toFixed(2), 'Capital spent on adding new inventory batches'],
        ['Pending Deliveries / Pickups', stats.pendingDeliveries + ' orders', 'Orders paid awaiting student counter collection'],
        ['Total Active Product Catalog', stats.totalActiveProducts + ' products', 'Live products listed in store']
      ];

      kpis.forEach((row, idx) => {
        const r = ws1.addRow(row);
        r.height = 20;
        if (idx % 2 === 1) r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
      });

      // ── Sheet 2: Top Selling Products ──
      const ws2 = workbook.addWorksheet('Top Selling Products');
      ws2.columns = [{ width: 10 }, { width: 14 }, { width: 34 }, { width: 20 }, { width: 14 }, { width: 18 }, { width: 16 }, { width: 18 }];
      ws2.mergeCells('A1:H1');
      const t2 = ws2.getCell('A1');
      t2.value = 'TOP SELLING PRODUCTS LEADERBOARD';
      t2.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
      t2.alignment = { horizontal: 'center', vertical: 'middle' };
      t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F766E' } };
      ws2.getRow(1).height = 28;

      const hRow2 = ws2.getRow(3);
      hRow2.values = ['Rank', 'Product ID', 'Product Name', 'Category', 'Units Sold', 'Revenue (₹)', 'Stock Left', 'Stock Status'];
      hRow2.font = { bold: true, color: { argb: 'FFFFFF' } };
      hRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D9488' } };
      hRow2.height = 24;

      (data.topProducts || []).forEach((p, idx) => {
        const r = ws2.addRow([
          '#' + p.rank,
          '#PROD-' + String(p.id).padStart(4, '0'),
          p.name,
          p.category,
          p.unitsSold + ' units',
          '₹' + p.revenue.toFixed(2),
          p.currentStock + ' units',
          p.stockStatus
        ]);
        r.height = 20;
        if (idx % 2 === 1) r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0FDFA' } };
      });

      // ── Sheet 3: Category Breakdown ──
      const ws3 = workbook.addWorksheet('Category Sales Share');
      ws3.columns = [{ width: 24 }, { width: 18 }, { width: 16 }, { width: 16 }];
      ws3.mergeCells('A1:D1');
      const t3 = ws3.getCell('A1');
      t3.value = 'CATEGORY SALES & REVENUE BREAKDOWN';
      t3.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
      t3.alignment = { horizontal: 'center', vertical: 'middle' };
      t3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '5B21B6' } };
      ws3.getRow(1).height = 28;

      const hRow3 = ws3.getRow(3);
      hRow3.values = ['Category Name', 'Revenue (₹)', 'Units Sold', 'Share of Sales (%)'];
      hRow3.font = { bold: true, color: { argb: 'FFFFFF' } };
      hRow3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } };
      hRow3.height = 24;

      (data.charts?.categoryBreakdown || []).forEach((c, idx) => {
        const r = ws3.addRow([c.name, '₹' + c.revenue.toFixed(2), c.units + ' units', c.percentage + '%']);
        r.height = 20;
        if (idx % 2 === 1) r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FAF5FF' } };
      });

      await saveWorkbook(workbook, 'NEC_Store_Master_Sales_Analytics');
      addToast('Downloaded Complete Master Sales Analytics workbook!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export master report.', 'error');
    } finally {
      setDownloadingSection(null);
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // 2. DOWNLOAD INDIVIDUAL SECTIONS
  // ═════════════════════════════════════════════════════════════════
  
  // A. Download Daily Trend
  const downloadTrendReport = async () => {
    if (!data?.charts?.salesTrend) return;
    setDownloadingSection('trend');
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Sales Trend');
      ws.columns = [{ width: 14 }, { width: 16 }, { width: 18 }, { width: 16 }];

      ws.mergeCells('A1:D1');
      const t = ws.getCell('A1');
      t.value = 'DAILY SALES & ORDER VOLUME TREND';
      t.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
      t.alignment = { horizontal: 'center', vertical: 'middle' };
      t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E40AF' } };
      ws.getRow(1).height = 28;

      const hRow = ws.getRow(3);
      hRow.values = ['Date', 'Day', 'Sales Revenue (₹)', 'Orders Placed'];
      hRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
      hRow.height = 24;

      let totS = 0;
      let totO = 0;
      data.charts.salesTrend.forEach((day, idx) => {
        totS += day.sales;
        totO += day.orders;
        const r = ws.addRow([day.date, day.day, '₹' + day.sales.toFixed(2), day.orders + ' orders']);
        r.height = 20;
        if (idx % 2 === 1) r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
      });

      const sumRow = ws.addRow(['TOTAL', '-', '₹' + totS.toFixed(2), totO + ' orders']);
      sumRow.font = { bold: true, color: { argb: '1E40AF' } };
      sumRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } };

      await saveWorkbook(workbook, 'NEC_Store_Daily_Sales_Trend');
      addToast('Downloaded Daily Sales Trend report!', 'success');
    } catch (e) {
      addToast('Failed to export trend report.', 'error');
    } finally {
      setDownloadingSection(null);
    }
  };

  // B. Download Category Breakdown
  const downloadCategoryReport = async () => {
    if (!data?.charts?.categoryBreakdown) return;
    setDownloadingSection('category');
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Category Breakdown');
      ws.columns = [{ width: 26 }, { width: 18 }, { width: 16 }, { width: 16 }];

      ws.mergeCells('A1:D1');
      const t = ws.getCell('A1');
      t.value = 'CATEGORY SALES & REVENUE CONTRIBUTION';
      t.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
      t.alignment = { horizontal: 'center', vertical: 'middle' };
      t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '5B21B6' } };
      ws.getRow(1).height = 28;

      const hRow = ws.getRow(3);
      hRow.values = ['Category Name', 'Revenue (₹)', 'Units Sold', 'Percentage Share'];
      hRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } };
      hRow.height = 24;

      data.charts.categoryBreakdown.forEach((c, idx) => {
        const r = ws.addRow([c.name, '₹' + c.revenue.toFixed(2), c.units + ' units', c.percentage + '%']);
        r.height = 20;
        if (idx % 2 === 1) r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FAF5FF' } };
      });

      await saveWorkbook(workbook, 'NEC_Store_Category_Sales_Share');
      addToast('Downloaded Category Revenue Breakdown report!', 'success');
    } catch (e) {
      addToast('Failed to export category report.', 'error');
    } finally {
      setDownloadingSection(null);
    }
  };

  // C. Download Top Sellers
  const downloadTopSellersReport = async () => {
    if (!data?.topProducts) return;
    setDownloadingSection('topSellers');
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Best Sellers');
      ws.columns = [{ width: 10 }, { width: 14 }, { width: 34 }, { width: 20 }, { width: 14 }, { width: 18 }, { width: 16 }, { width: 18 }];

      ws.mergeCells('A1:H1');
      const t = ws.getCell('A1');
      t.value = 'TOP SELLING PRODUCTS LEADERBOARD';
      t.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
      t.alignment = { horizontal: 'center', vertical: 'middle' };
      t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F766E' } };
      ws.getRow(1).height = 28;

      const hRow = ws.getRow(3);
      hRow.values = ['Rank', 'Product ID', 'Product Name', 'Category', 'Units Sold', 'Revenue (₹)', 'Current Stock', 'Stock Status'];
      hRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D9488' } };
      hRow.height = 24;

      data.topProducts.forEach((p, idx) => {
        const r = ws.addRow([
          '#' + p.rank,
          '#PROD-' + String(p.id).padStart(4, '0'),
          p.name,
          p.category,
          p.unitsSold + ' units',
          '₹' + p.revenue.toFixed(2),
          p.currentStock + ' units',
          p.stockStatus
        ]);
        r.height = 20;
        if (idx % 2 === 1) r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0FDFA' } };
      });

      await saveWorkbook(workbook, 'NEC_Store_Top_Selling_Products');
      addToast('Downloaded Top Selling Products report!', 'success');
    } catch (e) {
      addToast('Failed to export top sellers.', 'error');
    } finally {
      setDownloadingSection(null);
    }
  };

  // D. Download Low Stock Restock List
  const downloadRestockListReport = async () => {
    if (!data?.lowStockAlerts) return;
    setDownloadingSection('restock');
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Restock Alerts');
      ws.columns = [{ width: 14 }, { width: 34 }, { width: 22 }, { width: 16 }, { width: 18 }, { width: 18 }, { width: 18 }];

      ws.mergeCells('A1:G1');
      const t = ws.getCell('A1');
      t.value = 'CRITICAL RESTOCK & DEPLETING INVENTORY LIST';
      t.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
      t.alignment = { horizontal: 'center', vertical: 'middle' };
      t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '991B1B' } };
      ws.getRow(1).height = 28;

      const hRow = ws.getRow(3);
      hRow.values = ['Product ID', 'Product Name', 'Category', 'Stock Left', 'Low Threshold', 'Buying Cost (₹)', 'Status'];
      hRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DC2626' } };
      hRow.height = 24;

      data.lowStockAlerts.forEach((p, idx) => {
        const r = ws.addRow([
          '#PROD-' + String(p.id).padStart(4, '0'),
          p.name,
          p.category,
          p.quantity + ' units',
          p.threshold + ' units',
          '₹' + p.buyingPrice.toFixed(2),
          p.status === 'OUT_OF_STOCK' ? 'OUT OF STOCK' : 'LOW STOCK'
        ]);
        r.height = 20;
        if (idx % 2 === 1) r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF2F2' } };
      });

      await saveWorkbook(workbook, 'NEC_Store_Restock_Alerts_List');
      addToast('Downloaded Low Stock Restock Alerts list!', 'success');
    } catch (e) {
      addToast('Failed to export restock list.', 'error');
    } finally {
      setDownloadingSection(null);
    }
  };

  const stats = data?.stats || {};

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        
        {/* Header Title + Master Download Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Sales Analytics & Business Intelligence
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Real-time executive metrics on store revenue, gross profit margins, best sellers, category contributions, and restock alerts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <GlassButton
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchAnalytics(timeframe, startDate, endDate)}
            >
              Refresh
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              icon={downloadingSection === 'master' ? RefreshCw : Download}
              disabled={downloadingSection === 'master' || loading}
              onClick={downloadMasterReport}
            >
              {downloadingSection === 'master' ? 'Exporting...' : 'Download Master Analytics (.xlsx)'}
            </GlassButton>
          </div>
        </div>

        {/* Timeframe Filter Toolbar */}
        <GlassCard hover={false} style={{ padding: '14px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            
            {/* Preset Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
                Timeframe:
              </span>
              {[
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => { setTimeframe(btn.id); setStartDate(''); setEndDate(''); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm, 8px)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                    border: timeframe === btn.id ? 'none' : '1px solid var(--neu-border-subtle)',
                    background: timeframe === btn.id ? 'var(--gradient-primary)' : 'var(--card-bg)',
                    color: timeframe === btn.id ? '#ffffff' : 'var(--text-main)',
                    boxShadow: timeframe === btn.id ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'var(--neu-extruded-sm)'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Custom:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input"
                style={{ width: '135px', padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input"
                style={{ width: '135px', padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer' }}
              />
              <button
                onClick={handleApplyCustomDates}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: 'rgba(37, 99, 235, 0.12)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  color: 'var(--primary-blue)'
                }}
              >
                Apply Range
              </button>
            </div>
          </div>
        </GlassCard>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="skeleton" style={{ height: '110px', borderRadius: '16px' }}></div>
            ))}
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 5 EXECUTIVE FINANCIAL KPI CARDS                                 */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              
              {/* 1. Total Revenue */}
              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Sales Revenue (Inflow)
                  </span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '-0.02em' }}>
                  ₹{parseFloat(stats.totalRevenue || 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  From {stats.totalOrders || 0} student orders ({stats.totalUnitsSold || 0} units)
                </div>
              </GlassCard>

              {/* 2. Wholesale Outflow / Cost */}
              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Cost of Goods Sold (COGS)
                  </span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.12)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  ₹{parseFloat(stats.totalCostOfGoodsSold || 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Wholesale base cost of items sold
                </div>
              </GlassCard>

              {/* 3. Gross Profit & Margin */}
              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Net Gross Profit
                  </span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(22, 163, 74, 0.12)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--status-success)', letterSpacing: '-0.02em' }}>
                  ₹{parseFloat(stats.grossProfit || 0).toFixed(2)}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-success)', marginTop: '4px' }}>
                  <Percent size={12} /> {stats.profitMargin || 0}% Gross Margin
                </div>
              </GlassCard>

              {/* 4. Average Order Value (AOV) */}
              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Avg Order Value (AOV)
                  </span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--primary-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  ₹{parseFloat(stats.averageOrderValue || 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Average ticket size per checkout
                </div>
              </GlassCard>

              {/* 5. Pending Deliveries */}
              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Pending Pickups
                  </span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#d97706', letterSpacing: '-0.02em' }}>
                  {stats.pendingDeliveries || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Orders ready awaiting student pickup
                </div>
              </GlassCard>

            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 1: DAILY SALES & ORDER VOLUME TREND CHART               */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <GlassCard hover={false} style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Revenue & Order Volume Trend
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Visual correlation between daily revenue (₹) and student checkout volume over the selected timeframe.
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)' }}>
                    {stats.totalOrders || 0} Total Orders ({stats.totalUnitsSold || 0} Units)
                  </span>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={downloadingSection === 'trend' ? RefreshCw : Download}
                    disabled={downloadingSection === 'trend'}
                    onClick={downloadTrendReport}
                  >
                    Download Trend (.xlsx)
                  </GlassButton>
                </div>
              </div>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.charts?.salesTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neu-border-subtle)" />
                    <XAxis dataKey="formattedDate" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="var(--primary-blue)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => '₹' + v} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--neu-border)', boxShadow: 'var(--neu-extruded-sm)' }}
                      formatter={(val, name) => [name === 'sales' ? '₹' + parseFloat(val).toFixed(2) : val + ' orders', name === 'sales' ? 'Daily Revenue' : 'Orders Placed']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="sales" name="Sales Revenue (₹)" stroke="#2563eb" strokeWidth={2.5} fill="url(#revAreaGradient)" />
                    <Bar yAxisId="right" dataKey="orders" name="Order Volume" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 2: CATEGORY SHARE & ORDER FULFILLMENT (2-COLUMN GRID)   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              
              {/* Card A: Category-Wise Revenue Share */}
              <GlassCard hover={false} style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        Category Revenue Breakdown
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Revenue share by product category
                      </p>
                    </div>
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      icon={downloadingSection === 'category' ? RefreshCw : Download}
                      disabled={downloadingSection === 'category'}
                      onClick={downloadCategoryReport}
                    >
                      Export (.xlsx)
                    </GlassButton>
                  </div>

                  {(data.charts?.categoryBreakdown || []).length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      No category sales recorded in this timeframe.
                    </div>
                  ) : (
                    <div>
                      {/* Donut Chart */}
                      <div style={{ width: '100%', height: 180, marginBottom: '12px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.charts?.categoryBreakdown || []}
                              dataKey="revenue"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={75}
                              paddingAngle={4}
                            >
                              {(data.charts?.categoryBreakdown || []).map((entry, index) => (
                                <Cell key={'cell-' + index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--neu-border)' }}
                              formatter={(val, name, item) => ['₹' + parseFloat(val).toFixed(2) + ' (' + item.payload.percentage + '%)', name]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Progress Bars for Categories */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(data.charts?.categoryBreakdown || []).map((cat, idx) => (
                          <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}></span>
                                {cat.name}
                              </span>
                              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                ₹{cat.revenue.toFixed(2)} ({cat.percentage}%)
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                              <div style={{ width: cat.percentage + '%', height: '100%', borderRadius: '4px', background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Card B: Order Fulfillment & Delivery Status */}
              <GlassCard hover={false} style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        Delivery Fulfillment Rate
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Order completion & pickup collection status
                      </p>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: 180, marginBottom: '12px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.charts?.fulfillmentChart || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={75}
                          paddingAngle={4}
                        >
                          {(data.charts?.fulfillmentChart || []).map((entry, index) => (
                            <Cell key={'cell-ful-' + index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--neu-border)' }}
                          formatter={(val, name) => [val + ' orders', name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status List */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {(data.charts?.fulfillmentChart || []).map((f) => (
                      <div key={f.name} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--neu-border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }}></span>
                          <span>{f.name}</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px', color: 'var(--text-main)' }}>
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 3: TOP SELLING PRODUCTS LEADERBOARD TABLE               */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <GlassCard hover={false} style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} color="#eab308" />
                    Top Selling Products (Best Sellers)
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Ranked by total quantity units purchased by students
                  </p>
                </div>

                <GlassButton
                  variant="secondary"
                  size="sm"
                  icon={downloadingSection === 'topSellers' ? RefreshCw : Download}
                  disabled={downloadingSection === 'topSellers'}
                  onClick={downloadTopSellersReport}
                >
                  Download Best Sellers (.xlsx)
                </GlassButton>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0, 0, 0, 0.02)', borderBottom: '1px solid var(--neu-border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 16px' }}>Rank</th>
                      <th style={{ padding: '12px 16px' }}>Product Name</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Units Sold</th>
                      <th style={{ padding: '12px 16px' }}>Total Revenue (₹)</th>
                      <th style={{ padding: '12px 16px' }}>Stock Left</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.topProducts || []).length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No sales data recorded in this period.
                        </td>
                      </tr>
                    ) : (
                      (data.topProducts || []).map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--neu-border-subtle)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              background: p.rank === 1 ? '#fef08a' : p.rank === 2 ? '#e2e8f0' : p.rank === 3 ? '#fed7aa' : 'rgba(0,0,0,0.05)',
                              color: p.rank === 1 ? '#854d0e' : p.rank === 2 ? '#475569' : p.rank === 3 ? '#9a3412' : 'var(--text-muted)'
                            }}>
                              {p.rank}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {p.name}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-blue)' }}>
                              {p.category}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary-blue)' }}>
                            {p.unitsSold} units
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--status-success)' }}>
                            ₹{p.revenue.toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-main)', fontWeight: 600 }}>
                            {p.currentStock} in stock
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={p.stockStatus} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 4: LOW STOCK & FAST DEPLETING WARNINGS                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {(data.lowStockAlerts || []).length > 0 && (
              <GlassCard hover={false} style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.25)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.03) 0%, rgba(245, 158, 11, 0.03) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--status-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--status-danger)' }}>
                        Critical Restock & Depleting Inventory Warnings ({data.lowStockAlerts.length})
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        These items have fallen below their minimum safety thresholds and need restocking with distributors.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      icon={downloadingSection === 'restock' ? RefreshCw : Download}
                      disabled={downloadingSection === 'restock'}
                      onClick={downloadRestockListReport}
                    >
                      Download Restock List (.xlsx)
                    </GlassButton>
                    <Link to="/retailer/inventory" style={{ textDecoration: 'none' }}>
                      <GlassButton variant="primary" size="sm" icon={ExternalLink}>
                        Restock in Inventory
                      </GlassButton>
                    </Link>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {data.lowStockAlerts.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--neu-border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--neu-extruded-sm)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                            {item.category}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                          {item.name}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--neu-border-subtle)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--status-danger)', fontWeight: 800 }}>
                          {item.quantity} units left
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Threshold: {item.threshold}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

          </>
        )}

      </main>
    </div>
  );
};

export default SalesAnalyticsPage;
