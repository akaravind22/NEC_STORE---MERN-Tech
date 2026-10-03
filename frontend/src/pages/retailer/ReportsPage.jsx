import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Layers, 
  TrendingUp, 
  CreditCard, 
  RefreshCw, 
  ShoppingCart, 
  Calendar, 
  Filter, 
  Search, 
  X,
  Tag
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const ReportsPage = () => {
  const [downloading, setDownloading] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [categories, setCategories] = useState([]);

  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getAxios().get('/categories');
      setCategories(res.data.data || res.data || []);
    } catch (e) {
      // fallback categories
      setCategories([
        { id: '1', name: 'Notebooks' },
        { id: '2', name: 'Stationery' },
        { id: '3', name: 'Lab Equipment' },
        { id: '4', name: 'Electronics' },
        { id: '5', name: 'Uniforms & Accessories' }
      ]);
    }
  };

  const isFiltered = Boolean(startDate || endDate || search || category !== 'ALL');

  const handleDownload = async (endpoint, filename) => {
    setDownloading(endpoint);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;
      if (category && category !== 'ALL') params.category = category;

      const response = await getAxios().get('/reports/' + endpoint, {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filterSuffix = isFiltered ? '_Filtered' : '_Overall';
      link.setAttribute('download', filename + filterSuffix + '_' + Date.now() + '.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addToast('Downloaded ' + filename + (isFiltered ? ' (Filtered subset)' : ' (Overall dataset)') + ' successfully!', 'success');
    } catch (err) {
      addToast('Failed to generate Excel report.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearch('');
    setCategory('ALL');
    addToast('Filters reset to overall dataset.', 'info');
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Header Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}>
                Excel Report Generation
              </h1>
              <span style={{ 
                fontSize: '0.78rem', 
                fontWeight: 700, 
                padding: '4px 12px', 
                borderRadius: '20px', 
                background: isFiltered ? 'rgba(37, 99, 235, 0.12)' : 'rgba(22, 163, 74, 0.12)',
                color: isFiltered ? 'var(--primary-blue)' : 'var(--status-success)',
                border: isFiltered ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid rgba(22, 163, 74, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isFiltered ? 'var(--primary-blue)' : 'var(--status-success)' }}></span>
                {isFiltered ? 'FILTERED EXPORT MODE' : 'OVERALL CATALOG MODE'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              Download structured Excel (.xlsx) workbooks with automatic category breakdowns, distributor references, date ranges, and accounting totals.
            </p>
          </div>
        </div>

        {/* Global Export Filter Bar */}
        <GlassCard hover={false} style={{ padding: '20px 24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              <Filter size={18} color="var(--primary-blue)" />
              <span>Smart Report Filter Scope</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                (Applies to any downloaded Excel workbook below)
              </span>
            </div>
            {isFiltered && (
              <button
                onClick={handleClearFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: 'var(--status-danger)',
                  borderRadius: 'var(--radius-sm, 8px)',
                  padding: '5px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <X size={14} /> Clear Filters (Export All)
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Search Keyword
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Product / Vendor / Customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Category Selection
              </label>
              <div style={{ position: 'relative' }}>
                <Tag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '38px', fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  <option value="ALL">All Categories (Full Catalog)</option>
                  {categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* From Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                From Date
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '38px', fontSize: '0.88rem', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                To Date
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '38px', fontSize: '0.88rem', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 5 Standardized Report Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* 1. Purchases & Cost Outflow */}
          <GlassCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124, 58, 237, 0.12)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShoppingCart size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Purchases & Cost Outflow</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                Complete audit of wholesale stock restocks, <strong>Purchased From (Distributors)</strong>, batch buying rates, weighted average cost (WAC), and total expenditure.
              </p>
            </div>
            <GlassButton
              variant="accent"
              size="md"
              disabled={downloading === 'purchases'}
              icon={downloading === 'purchases' ? RefreshCw : Download}
              onClick={() => handleDownload('purchases', 'NEC_Store_Purchases_Report')}
              style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.35)' }}
            >
              {downloading === 'purchases' ? 'Generating...' : (isFiltered ? 'Download Filtered Purchases (.xlsx)' : 'Download Purchases (.xlsx)')}
            </GlassButton>
          </GlassCard>

          {/* 2. Inventory Stock Report */}
          <GlassCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.12)', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Inventory Stock & Valuation</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                Full product stock ledger grouped by category, stock quantities, low-stock reorder triggers, unit buying prices, and current holding valuation.
              </p>
            </div>
            <GlassButton
              variant="accent"
              size="md"
              disabled={downloading === 'stock'}
              icon={downloading === 'stock' ? RefreshCw : Download}
              onClick={() => handleDownload('stock', 'NEC_Store_Stock_Report')}
              style={{ width: '100%', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', boxShadow: '0 4px 15px rgba(13, 148, 136, 0.35)' }}
            >
              {downloading === 'stock' ? 'Generating...' : (isFiltered ? 'Download Filtered Stock (.xlsx)' : 'Download Stock (.xlsx)')}
            </GlassButton>
          </GlassCard>

          {/* 3. Sales Revenue Report */}
          <GlassCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Sales Revenue & Orders</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                Comprehensive student orders export containing order IDs, student details, payment statuses, order totals, and fulfillment delivery logs.
              </p>
            </div>
            <GlassButton
              variant="primary"
              size="md"
              disabled={downloading === 'sales'}
              icon={downloading === 'sales' ? RefreshCw : Download}
              onClick={() => handleDownload('sales', 'NEC_Store_Sales_Report')}
              style={{ width: '100%' }}
            >
              {downloading === 'sales' ? 'Generating...' : (isFiltered ? 'Download Filtered Sales (.xlsx)' : 'Download Sales (.xlsx)')}
            </GlassButton>
          </GlassCard>

          {/* 4. Incoming Stock History Audit */}
          <GlassCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124, 58, 237, 0.12)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <FileSpreadsheet size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Incoming Stock History</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                Sequential audit log of every stock increment batch, retailer user who processed the restock, previous/new stock levels, and distributor names.
              </p>
            </div>
            <GlassButton
              variant="accent"
              size="md"
              disabled={downloading === 'stock-history'}
              icon={downloading === 'stock-history' ? RefreshCw : Download}
              onClick={() => handleDownload('stock-history', 'NEC_Store_Stock_History')}
              style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.35)' }}
            >
              {downloading === 'stock-history' ? 'Generating...' : (isFiltered ? 'Download Filtered Stock History (.xlsx)' : 'Download Stock History (.xlsx)')}
            </GlassButton>
          </GlassCard>

          {/* 5. Transactions Audit Report */}
          <GlassCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <CreditCard size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Payment Transactions Audit</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                Financial ledger of Razorpay payment IDs, order numbers, student customer names, payment methods, transaction statuses, and timestamps.
              </p>
            </div>
            <GlassButton
              variant="primary"
              size="md"
              disabled={downloading === 'transactions'}
              icon={downloading === 'transactions' ? RefreshCw : Download}
              onClick={() => handleDownload('transactions', 'NEC_Store_Transactions')}
              style={{ width: '100%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 4px 15px rgba(5, 150, 105, 0.35)' }}
            >
              {downloading === 'transactions' ? 'Generating...' : (isFiltered ? 'Download Filtered Txns (.xlsx)' : 'Download Transactions (.xlsx)')}
            </GlassButton>
          </GlassCard>

        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
