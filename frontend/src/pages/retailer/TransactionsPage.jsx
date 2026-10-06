import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
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
  Store 
} from 'lucide-react';
import ExcelJS from 'exceljs';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
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
      <ChevronUp size={14} style={{ color: 'var(--primary-blue)', marginLeft: '6px', fontWeight: 700 }} />
    ) : (
      <ChevronDown size={14} style={{ color: 'var(--primary-blue)', marginLeft: '6px', fontWeight: 700 }} />
    );
  };

  const isFiltered = Boolean(search.trim() || paymentStatusFilter !== 'ALL' || fromDate || toDate);

  // Filtered Student Orders
  const filteredStudentOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTxn = ('#TXN-' + o.id).toLowerCase().includes(q) || String(o.id).includes(q);
          const matchCust = o.User && o.User.name.toLowerCase().includes(q);
          const matchEmail = o.User && o.User.email.toLowerCase().includes(q);
          if (!matchTxn && !matchCust && !matchEmail) return false;
        }

        if (paymentStatusFilter !== 'ALL' && o.paymentStatus !== paymentStatusFilter) return false;

        if (fromDate) {
          const start = new Date(fromDate + 'T00:00:00');
          if (new Date(o.createdAt) < start) return false;
        }
        if (toDate) {
          const end = new Date(toDate + 'T23:59:59');
          if (new Date(o.createdAt) > end) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'createdAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else if (sortKey === 'totalAmount') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [orders, search, paymentStatusFilter, fromDate, toDate, sortKey, sortDirection]);

  // Filtered Purchase Transactions
  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((p) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchBatch = ('#PURCH-' + p.id).toLowerCase().includes(q) || String(p.id).includes(q);
          const matchProd = p.productName && p.productName.toLowerCase().includes(q);
          const matchSupp = p.purchasedFrom && p.purchasedFrom.toLowerCase().includes(q);
          if (!matchBatch && !matchProd && !matchSupp) return false;
        }

        if (fromDate) {
          const start = new Date(fromDate + 'T00:00:00');
          if (new Date(p.createdAt) < start) return false;
        }
        if (toDate) {
          const end = new Date(toDate + 'T23:59:59');
          if (new Date(p.createdAt) > end) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'createdAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else if (sortKey === 'totalPurchaseCost') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [purchases, search, fromDate, toDate, sortKey, sortDirection]);

  const activeDataSet = activeTab === 'student' ? filteredStudentOrders : filteredPurchases;
  const totalPages = Math.ceil(activeDataSet.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeDataSet.slice(start, start + pageSize);
  }, [activeDataSet, currentPage]);

  const clearFilters = () => {
    setSearch('');
    setPaymentStatusFilter('ALL');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    addToast('Filters reset to overall dataset.', 'info');
  };

  // ═════════════════════════════════════════════════════════════════
  // EXCEL REPORT DOWNLOAD (Tab Aware: Student vs Purchase)
  // ═════════════════════════════════════════════════════════════════
  const handleDownloadExcel = async () => {
    if (activeDataSet.length === 0) {
      addToast('No records to export for current criteria.', 'error');
      return;
    }

    setDownloading(true);
    try {
      const workbook = new ExcelJS.Workbook();

      let filterDetails = [];
      if (fromDate) filterDetails.push('From: ' + fromDate);
      if (toDate) filterDetails.push('To: ' + toDate);
      if (search.trim()) filterDetails.push('Search: "' + search.trim() + '"');

      const filterSummaryText = filterDetails.length > 0
        ? 'Scope: Filtered (' + filterDetails.join(' | ') + ')'
        : 'Scope: Overall (All Records)';

      if (activeTab === 'student') {
        // STUDENT ORDERS TRANSACTIONS EXCEL
        const worksheet = workbook.addWorksheet('Student Transactions');
        worksheet.columns = [
          { key: 'id', width: 14 },
          { key: 'orderId', width: 14 },
          { key: 'customerName', width: 26 },
          { key: 'amount', width: 18 },
          { key: 'paymentMethod', width: 18 },
          { key: 'status', width: 16 },
          { key: 'date', width: 24 }
        ];

        worksheet.mergeCells('A1:G1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'NEC CAMPUS STORE — STUDENT PAYMENT TRANSACTIONS';
        titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '065F46' } };
        worksheet.getRow(1).height = 32;

        worksheet.mergeCells('A2:G2');
        const metaCell = worksheet.getCell('A2');
        metaCell.value = filterSummaryText + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Txns: ' + activeDataSet.length;
        metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
        metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
        metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
        worksheet.getRow(2).height = 22;

        worksheet.getRow(3).values = [];

        const headers = ['Txn ID', 'Order ID', 'Customer Name', 'Amount (₹)', 'Payment Method', 'Status', 'Date & Time'];
        const headerRow = worksheet.getRow(4);
        headerRow.values = headers;
        headerRow.height = 26;
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        let totalAmt = 0;
        activeDataSet.forEach((o, idx) => {
          const amt = parseFloat(o.totalAmount || 0);
          totalAmt += amt;
          const row = worksheet.addRow({
            id: '#TXN-' + String(o.id).padStart(4, '0'),
            orderId: '#ORD-' + String(o.id).padStart(4, '0'),
            customerName: o.User ? o.User.name : 'Student Customer',
            amount: '₹' + amt.toFixed(2),
            paymentMethod: 'RAZORPAY (Online)',
            status: o.paymentStatus || 'PAID',
            date: new Date(o.createdAt).toLocaleString('en-IN')
          });
          row.height = 22;
          if (idx % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
        });

        const summaryRow = worksheet.addRow({
          id: 'TOTAL / SUMMARY',
          orderId: activeDataSet.length + ' Orders',
          customerName: '-',
          amount: '₹' + totalAmt.toFixed(2),
          paymentMethod: '-',
          status: '-',
          date: '-'
        });
        summaryRow.height = 28;
        summaryRow.font = { bold: true, size: 11, color: { argb: '065F46' } };
        summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
      } else {
        // PURCHASE TRANSACTIONS EXCEL
        const worksheet = workbook.addWorksheet('Purchase Transactions');
        worksheet.columns = [
          { key: 'batchId', width: 16 },
          { key: 'productName', width: 34 },
          { key: 'purchasedFrom', width: 30 },
          { key: 'unitsAdded', width: 14 },
          { key: 'purchaseRate', width: 20 },
          { key: 'totalCost', width: 22 },
          { key: 'date', width: 24 }
        ];

        worksheet.mergeCells('A1:G1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'NEC CAMPUS STORE — STORE PRODUCT PURCHASE TRANSACTIONS';
        titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4C1D95' } };
        worksheet.getRow(1).height = 32;

        worksheet.mergeCells('A2:G2');
        const metaCell = worksheet.getCell('A2');
        metaCell.value = filterSummaryText + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Batches: ' + activeDataSet.length;
        metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
        metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
        metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
        worksheet.getRow(2).height = 22;

        worksheet.getRow(3).values = [];

        const headers = ['Batch ID', 'Product Name', 'Purchased From', 'Units Added', 'Purchase Rate (₹)', 'Total Cost (₹)', 'Date & Time'];
        const headerRow = worksheet.getRow(4);
        headerRow.values = headers;
        headerRow.height = 26;
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        let totalCost = 0;
        let totalUnits = 0;
        activeDataSet.forEach((p, idx) => {
          const cost = parseFloat(p.totalPurchaseCost || 0);
          const units = p.addedQuantity || 0;
          totalCost += cost;
          totalUnits += units;

          const row = worksheet.addRow({
            batchId: '#PURCH-' + String(p.id).padStart(4, '0'),
            productName: p.productName || 'Product',
            purchasedFrom: p.purchasedFrom || 'Authorized Wholesaler',
            unitsAdded: '+' + units + ' units',
            purchaseRate: '₹' + parseFloat(p.purchaseRatePerUnit || 0).toFixed(2),
            totalCost: '₹' + cost.toFixed(2),
            date: new Date(p.createdAt).toLocaleString('en-IN')
          });
          row.height = 22;
          if (idx % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
        });

        const summaryRow = worksheet.addRow({
          batchId: 'TOTAL / SUMMARY',
          productName: activeDataSet.length + ' Batches',
          purchasedFrom: '-',
          unitsAdded: totalUnits + ' total units',
          purchaseRate: '-',
          totalCost: '₹' + totalCost.toFixed(2),
          date: '-'
        });
        summaryRow.height = 28;
        summaryRow.font = { bold: true, size: 11, color: { argb: '4C1D95' } };
        summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDE9FE' } };
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const scopeName = isFiltered ? '_Filtered' : '_Overall';
      link.setAttribute('download', 'NEC_Store_' + (activeTab === 'student' ? 'Student_Txns' : 'Purchases') + scopeName + '_' + Date.now() + '.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addToast('Downloaded ' + (activeTab === 'student' ? 'Student Transactions' : 'Purchase Transactions') + ' Excel successfully!', 'success');
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

            {/* Reset Filters Button */}
            {isFiltered && (
              <button
                onClick={clearFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: 'var(--status-danger)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <X size={13} /> Reset
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
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        Loading student transaction records...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                  </tr>
                </thead>
                <tbody>
                  {purchaseLoading ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        Loading wholesale purchase records...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                          ₹₹{Math.ceil(parseFloat(item.purchaseRatePerUnit || item.batchRate || item.newBuyingPrice || 0)).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--status-danger)', fontSize: '0.95rem' }}>
                          -₹{parseFloat(item.totalPurchaseCost || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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

      </main>
    </div>
  );
};

export default TransactionsPage;
