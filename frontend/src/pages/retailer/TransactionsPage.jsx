import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Eye,
  Search, 
  X, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Calendar, 
  ShoppingCart, 
  GraduationCap, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  Store,
  Receipt,
  User,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ExcelJS from 'exceljs';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import GlassModal from '../../components/common/GlassModal';
import GlassButton from '../../components/common/GlassButton';
import CenteredPagination from '../../components/common/CenteredPagination';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const TransactionsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'purchase'
  const [purchases, setPurchases] = useState([]);
  const [purchaseSummary, setPurchaseSummary] = useState({ totalTransactions: 0, totalSpent: 0, totalUnits: 0 });
  const [purchaseLoading, setPurchaseLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Modal View States
  const [selectedStudentTxn, setSelectedStudentTxn] = useState(null);
  const [selectedPurchaseTxn, setSelectedPurchaseTxn] = useState(null);

  // Search & Filter & Sort States
  const [search, setSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Date Range Filter
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getAxios().get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      setPurchaseLoading(true);
      const res = await getAxios().get('/stock/purchases');
      if (res.data.success) {
        const list = res.data.transactions || res.data.purchases || res.data.data || [];
        setPurchases(list);
        setPurchaseSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPurchaseLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchPurchases();
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const renderSortIndicator = (key) => {
    if (sortKey !== key) {
      return <ArrowUpDown size={13} style={{ opacity: 0.35, marginLeft: '6px' }} />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={14} style={{ color: 'var(--primary-blue)', marginLeft: '6px' }} />
    ) : (
      <ChevronDown size={14} style={{ color: 'var(--primary-blue)', marginLeft: '6px' }} />
    );
  };

  const clearFilters = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setPaymentStatusFilter('ALL');
    setCurrentPage(1);
  };

  const isFiltered = search !== '' || fromDate !== '' || toDate !== '' || paymentStatusFilter !== 'ALL';

  // Filtered and Sorted Student Transactions (Orders)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search (ID, Student Name, Email, Amount)
      if (search.trim()) {
        const q = search.toLowerCase();
        const idMatch = String(order.id).toLowerCase().includes(q) || ('#txn-' + String(order.id).padStart(4, '0')).toLowerCase().includes(q);
        const nameMatch = (order.User?.name || '').toLowerCase().includes(q);
        const emailMatch = (order.User?.email || '').toLowerCase().includes(q);
        const amountMatch = String(order.totalAmount || '').includes(q);
        if (!idMatch && !nameMatch && !emailMatch && !amountMatch) return false;
      }

      // 2. Date Range Filter
      if (fromDate) {
        const orderDate = new Date(order.createdAt).setHours(0, 0, 0, 0);
        const from = new Date(fromDate).setHours(0, 0, 0, 0);
        if (orderDate < from) return false;
      }
      if (toDate) {
        const orderDate = new Date(order.createdAt).setHours(23, 59, 59, 999);
        const to = new Date(toDate).setHours(23, 59, 59, 999);
        if (orderDate > to) return false;
      }

      // 3. Payment Status Filter
      if (paymentStatusFilter !== 'ALL') {
        if ((order.paymentStatus || 'PAID') !== paymentStatusFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortKey === 'totalAmount') {
        valA = parseFloat(a.totalAmount || 0);
        valB = parseFloat(b.totalAmount || 0);
      } else if (sortKey === 'id') {
        valA = parseInt(a.id);
        valB = parseInt(b.id);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, search, fromDate, toDate, paymentStatusFilter, sortKey, sortDirection]);

  // Filtered and Sorted Purchase Transactions (Stock history)
  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      // 1. Search (Batch ID, Product Name, Supplier, Cost)
      if (search.trim()) {
        const q = search.toLowerCase();
        const idMatch = String(item.id).toLowerCase().includes(q) || ('#purch-' + String(item.id).padStart(4, '0')).toLowerCase().includes(q);
        const nameMatch = (item.productName || '').toLowerCase().includes(q);
        const supplierMatch = (item.purchasedFrom || '').toLowerCase().includes(q);
        const costMatch = String(item.totalPurchaseCost || '').includes(q);
        if (!idMatch && !nameMatch && !supplierMatch && !costMatch) return false;
      }

      // 2. Date Range Filter
      if (fromDate) {
        const itemDate = new Date(item.createdAt).setHours(0, 0, 0, 0);
        const from = new Date(fromDate).setHours(0, 0, 0, 0);
        if (itemDate < from) return false;
      }
      if (toDate) {
        const itemDate = new Date(item.createdAt).setHours(23, 59, 59, 999);
        const to = new Date(toDate).setHours(23, 59, 59, 999);
        if (itemDate > to) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortKey === 'totalPurchaseCost') {
        valA = parseFloat(item.totalPurchaseCost || 0);
        valB = parseFloat(item.totalPurchaseCost || 0);
      } else if (sortKey === 'id') {
        valA = parseInt(a.id);
        valB = parseInt(b.id);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [purchases, search, fromDate, toDate, sortKey, sortDirection]);

  // Current active data set & pagination
  const activeDataSet = activeTab === 'student' ? filteredOrders : filteredPurchases;
  const totalPages = Math.ceil(activeDataSet.length / pageSize) || 1;
  const paginatedData = activeDataSet.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export to Excel handler
  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const workbook = new ExcelJS.Workbook();
      
      if (activeTab === 'student') {
        const worksheet = workbook.addWorksheet('Student Transactions');
        worksheet.columns = [
          { header: 'Transaction ID', key: 'id', width: 18 },
          { header: 'Student Name', key: 'name', width: 25 },
          { header: 'Student Email', key: 'email', width: 30 },
          { header: 'Payment Gateway', key: 'gateway', width: 20 },
          { header: 'Amount (₹)', key: 'amount', width: 15 },
          { header: 'Payment Status', key: 'status', width: 16 },
          { header: 'Date & Time', key: 'date', width: 22 }
        ];

        // Header Styling
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E40AF' }
        };

        filteredOrders.forEach((order) => {
          worksheet.addRow({
            id: '#TXN-' + String(order.id).padStart(4, '0'),
            name: order.User ? order.User.name : 'Walk-in Customer',
            email: order.User ? order.User.email : 'N/A',
            gateway: 'RAZORPAY (Online)',
            amount: parseFloat(order.totalAmount || 0).toFixed(2),
            status: order.paymentStatus || 'PAID',
            date: new Date(order.createdAt).toLocaleString('en-IN')
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'NEC_Store_Student_Transactions_' + new Date().toISOString().split('T')[0] + '.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      } else {
        const worksheet = workbook.addWorksheet('Purchase Transactions');
        worksheet.columns = [
          { header: 'Batch ID', key: 'id', width: 18 },
          { header: 'Product Name', key: 'product', width: 35 },
          { header: 'Supplier / Distributor', key: 'supplier', width: 30 },
          { header: 'Units Added', key: 'qty', width: 15 },
          { header: 'Purchase Rate (₹)', key: 'rate', width: 18 },
          { header: 'Total Batch Cost (₹)', key: 'cost', width: 20 },
          { header: 'Date & Time', key: 'date', width: 22 }
        ];

        // Header Styling
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF6D28D9' }
        };

        filteredPurchases.forEach((item) => {
          worksheet.addRow({
            id: '#PURCH-' + String(item.id).padStart(4, '0'),
            product: item.productName || 'Store Item',
            supplier: item.purchasedFrom || 'Wholesale Supplier',
            qty: item.addedQuantity || 0,
            rate: Math.ceil(parseFloat(item.purchaseRatePerUnit || item.batchRate || item.newBuyingPrice || 0)).toFixed(2),
            cost: parseFloat(item.totalPurchaseCost || 0).toFixed(2),
            date: new Date(item.createdAt).toLocaleString('en-IN')
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'NEC_Store_Stock_Purchases_' + new Date().toISOString().split('T')[0] + '.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      }

      addToast('Excel export downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export Excel file.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(37, 99, 235, 0.12)',
                color: 'var(--primary-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                  Transactions Ledger
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                  Separate ledger for customer payments received vs product stock purchases made for the store.
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <GlassButton
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                fetchTransactions();
                fetchPurchases();
              }}
            >
              Refresh
            </GlassButton>

            <GlassButton
              variant={activeTab === 'student' ? 'primary' : 'accent'}
              size="sm"
              disabled={downloading}
              icon={downloading ? RefreshCw : Download}
              onClick={handleDownloadExcel}
            >
              {downloading 
                ? 'Exporting...' 
                : isFiltered 
                  ? 'Download Filtered Excel (' + activeDataSet.length + ')'
                  : activeTab === 'student' ? 'Download Excel (Student)' : 'Download Excel (Purchases)'}
            </GlassButton>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => { setActiveTab('student'); setCurrentPage(1); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              border: activeTab === 'student' ? 'none' : '1px solid var(--neu-border-subtle)',
              background: activeTab === 'student' ? 'var(--gradient-primary)' : 'var(--card-bg)',
              color: activeTab === 'student' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'student' ? '4px 4px 12px rgba(37, 99, 235, 0.35)' : 'var(--neu-extruded-sm)'
            }}
          >
            <GraduationCap size={18} />
            <span>Student Transactions ({orders.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('purchase'); setCurrentPage(1); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              border: activeTab === 'purchase' ? 'none' : '1px solid var(--neu-border-subtle)',
              background: activeTab === 'purchase' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'var(--card-bg)',
              color: activeTab === 'purchase' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'purchase' ? '4px 4px 12px rgba(124, 58, 237, 0.35)' : 'var(--neu-extruded-sm)'
            }}
          >
            <ShoppingCart size={18} />
            <span>Purchase Transactions ({purchases.length})</span>
          </button>
        </div>

        {/* Filter Toolbar (Search + Date Range + Reset) */}
        <GlassCard hover={false} style={{ padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '2 1 240px', minWidth: '200px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder={activeTab === 'student' ? 'Search student, txn ID...' : 'Search batch, product, vendor...'}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="glass-input"
                style={{ paddingLeft: '36px', width: '100%', fontSize: '0.85rem' }}
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setCurrentPage(1); }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* From Date */}
            <div style={{ flex: '1 1 150px', minWidth: '130px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                  className="glass-input"
                  style={{ width: '100%', cursor: 'pointer', fontSize: '0.82rem', padding: '7px 10px' }}
                />
              </div>
            </div>

            {/* To Date */}
            <div style={{ flex: '1 1 150px', minWidth: '130px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>To:</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                  className="glass-input"
                  style={{ width: '100%', cursor: 'pointer', fontSize: '0.82rem', padding: '7px 10px' }}
                />
              </div>
            </div>

            {/* Payment Filter for Student tab */}
            {activeTab === 'student' && (
              <div style={{ flex: '1 1 130px', minWidth: '120px' }}>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="glass-input"
                  style={{ width: '100%', cursor: 'pointer', fontSize: '0.85rem', padding: '7px 10px' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            )}

            {/* Reset Button */}
            {isFiltered && (
              <button
                onClick={clearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  transition: 'all 150ms ease'
                }}
              >
                <X size={13} />
                <span>Reset Filters</span>
              </button>
            )}

          </div>
        </GlassCard>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 1: STUDENT TRANSACTIONS TABLE                               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'student' && (
          <GlassCard style={{ padding: '0px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.02)', borderBottom: '1px solid var(--neu-border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th onClick={() => handleSort('id')} style={{ padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}>
                      Transaction ID {renderSortIndicator('id')}
                    </th>
                    <th style={{ padding: '14px 18px' }}>Student / Customer</th>
                    <th style={{ padding: '14px 18px' }}>Payment Method</th>
                    <th onClick={() => handleSort('totalAmount')} style={{ padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}>
                      Amount (₹) {renderSortIndicator('totalAmount')}
                    </th>
                    <th style={{ padding: '14px 18px' }}>Status</th>
                    <th onClick={() => handleSort('createdAt')} style={{ padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}>
                      Date {renderSortIndicator('createdAt')}
                    </th>
                    <th style={{ padding: '14px 18px', textAlign: 'center', width: '110px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        Loading student transaction records...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <CreditCard size={32} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                        No student payment transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--neu-border-subtle)', transition: 'background 150ms ease' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--primary-blue)' }}>
                          #TXN-{String(order.id).padStart(4, '0')}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{order.User ? order.User.name : 'Walk-in Customer'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.User ? order.User.email : 'N/A'}</div>
                        </td>
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                          RAZORPAY (Online)
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--status-success)', fontSize: '0.95rem' }}>
                          +₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <StatusBadge status={order.paymentStatus || 'PAID'} />
                        </td>
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedStudentTxn(order)}
                            title="View Transaction Receipt"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: '1px solid rgba(37, 99, 235, 0.3)',
                              background: 'rgba(37, 99, 235, 0.1)',
                              color: 'var(--primary-blue)',
                              transition: 'all 180ms ease'
                            }}
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <CenteredPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </GlassCard>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 2: PURCHASE TRANSACTIONS TABLE                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'purchase' && (
          <GlassCard style={{ padding: '0px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.02)', borderBottom: '1px solid var(--neu-border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th onClick={() => handleSort('id')} style={{ padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}>
                      Batch ID {renderSortIndicator('id')}
                    </th>
                    <th style={{ padding: '14px 18px' }}>Product Restocked</th>
                    <th style={{ padding: '14px 18px' }}>Purchased From (Distributor)</th>
                    <th style={{ padding: '14px 18px' }}>Units Added</th>
                    <th style={{ padding: '14px 18px' }}>Batch Rate</th>
                    <th onClick={() => handleSort('totalPurchaseCost')} style={{ padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}>
                      Total Cost (₹) {renderSortIndicator('totalPurchaseCost')}
                    </th>
                    <th onClick={() => handleSort('createdAt')} style={{ padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}>
                      Date {renderSortIndicator('createdAt')}
                    </th>
                    <th style={{ padding: '14px 18px', textAlign: 'center', width: '110px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseLoading ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        Loading wholesale purchase records...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Store size={32} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                        No purchase transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--neu-border-subtle)', transition: 'background 150ms ease' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                          #PURCH-{String(item.id).padStart(4, '0')}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.productName}
                        </td>
                        <td style={{ padding: '14px 18px', color: 'var(--text-main)', fontWeight: 500 }}>
                          {item.purchasedFrom || 'Authorized Wholesale Supplier'}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--primary-blue)' }}>
                          +{item.addedQuantity} units
                        </td>
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                          ₹{Math.ceil(parseFloat(item.purchaseRatePerUnit || item.batchRate || item.newBuyingPrice || 0)).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--status-danger)', fontSize: '0.95rem' }}>
                          -₹{parseFloat(item.totalPurchaseCost || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedPurchaseTxn(item)}
                            title="View Purchase Details"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: '1px solid rgba(124, 58, 237, 0.3)',
                              background: 'rgba(124, 58, 237, 0.1)',
                              color: 'var(--primary-purple)',
                              transition: 'all 180ms ease'
                            }}
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <CenteredPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </GlassCard>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STUDENT TRANSACTION RECEIPT MODAL                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <GlassModal
          isOpen={!!selectedStudentTxn}
          onClose={() => setSelectedStudentTxn(null)}
          title={selectedStudentTxn ? 'Transaction Receipt #TXN-' + String(selectedStudentTxn.id).padStart(4, '0') : 'Transaction Receipt'}
          maxWidth="620px"
        >
          {selectedStudentTxn && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Header Summary Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px',
                padding: '16px',
                background: 'var(--neu-inset-bg)',
                borderRadius: '12px',
                border: '1px solid var(--neu-border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Student / Customer
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {selectedStudentTxn.User ? selectedStudentTxn.User.name : 'Walk-in Customer'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedStudentTxn.User ? selectedStudentTxn.User.email : 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Payment & Status
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <StatusBadge status={selectedStudentTxn.paymentStatus || 'PAID'} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      RAZORPAY (Online)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(selectedStudentTxn.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Purchased Items Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                  {(selectedStudentTxn.items && selectedStudentTxn.items.length > 0) ? (
                    selectedStudentTxn.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'var(--card-bg)',
                          border: '1px solid var(--neu-border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(37, 99, 235, 0.1)',
                            color: 'var(--primary-blue)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}>
                            {idx + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                              {item.Product ? item.Product.name : 'Store Item'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Qty: <strong>{item.quantity}</strong> × ₹{parseFloat(item.unitPrice || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          ₹{parseFloat(item.subtotal || (item.quantity * item.unitPrice) || 0).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--neu-inset-bg)', borderRadius: '10px', fontSize: '0.85rem' }}>
                      Online purchase transaction for Order #ORD-{String(selectedStudentTxn.id).padStart(4, '0')}
                    </div>
                  )}
                </div>
              </div>

              {/* Total Paid Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '14px',
                borderTop: '2px dashed var(--neu-border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount Received</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-success)', fontWeight: 600 }}>Verified & Credited to Store</div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--status-success)' }}>
                  +₹{parseFloat(selectedStudentTxn.totalAmount || 0).toFixed(2)}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <GlassButton variant="primary" onClick={() => setSelectedStudentTxn(null)}>
                  Close Receipt
                </GlassButton>
              </div>

            </div>
          )}
        </GlassModal>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* WHOLESALE STOCK PURCHASE MODAL                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <GlassModal
          isOpen={!!selectedPurchaseTxn}
          onClose={() => setSelectedPurchaseTxn(null)}
          title={selectedPurchaseTxn ? 'Restock Purchase #PURCH-' + String(selectedPurchaseTxn.id).padStart(4, '0') : 'Purchase Batch Details'}
          maxWidth="560px"
        >
          {selectedPurchaseTxn && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Product Info Card */}
              <div style={{
                padding: '16px',
                background: 'var(--neu-inset-bg)',
                borderRadius: '12px',
                border: '1px solid var(--neu-border-subtle)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Restocked Item
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {selectedPurchaseTxn.productName}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Supplier: <strong style={{ color: 'var(--text-main)' }}>{selectedPurchaseTxn.purchasedFrom || 'Authorized Wholesale Supplier'}</strong>
                </div>
              </div>

              {/* Cost & Units Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.06)', border: '1px solid rgba(37, 99, 235, 0.18)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Units Restocked</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-blue)', marginTop: '4px' }}>
                    +{selectedPurchaseTxn.addedQuantity} units
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.18)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Purchase Rate (Per Unit)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-purple)', marginTop: '4px' }}>
                    ₹{Math.ceil(parseFloat(selectedPurchaseTxn.purchaseRatePerUnit || selectedPurchaseTxn.batchRate || selectedPurchaseTxn.newBuyingPrice || 0)).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Total Outflow */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '14px',
                borderTop: '2px dashed var(--neu-border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Expense (Inventory Outflow)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-danger)', fontWeight: 600 }}>Paid to Wholesaler</div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--status-danger)' }}>
                  -₹{parseFloat(selectedPurchaseTxn.totalPurchaseCost || 0).toFixed(2)}
                </div>
              </div>

              {/* Date & Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Recorded on: {new Date(selectedPurchaseTxn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <GlassButton variant="primary" onClick={() => setSelectedPurchaseTxn(null)}>
                  Close
                </GlassButton>
              </div>

            </div>
          )}
        </GlassModal>

      </main>
    </div>
  );
};

export default TransactionsPage;
