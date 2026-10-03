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
        setPurchases(res.data.transactions || []);
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

  // Filtered Purchase Batches
  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((p) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchId = ('#PURCH-' + p.id).toLowerCase().includes(q) || String(p.id).includes(q);
          const matchProd = (p.productName || '').toLowerCase().includes(q);
          const matchVendor = (p.purchasedFrom || '').toLowerCase().includes(q);
          if (!matchId && !matchProd && !matchVendor) return false;
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
        ? 'Filtered Scope: ' + filterDetails.join(' | ')
        : 'Overall Scope: All Records (No Filter Applied)';

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
        metaCell.value = filterSummaryText + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total: ' + activeDataSet.length;
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
            paymentMethod: 'RAZORPAY',
            status: o.paymentStatus || 'PAID',
            date: new Date(o.createdAt).toLocaleString('en-IN')
          });
          row.height = 22;
          if (idx % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
        });

        const summaryRow = worksheet.addRow({
          id: 'TOTAL / SUMMARY',
          orderId: activeDataSet.length + ' Txns',
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
          { key: 'category', width: 18 },
          { key: 'productName', width: 34 },
          { key: 'purchasedFrom', width: 30 },
          { key: 'unitsAdded', width: 14 },
          { key: 'purchaseRate', width: 20 },
          { key: 'totalCost', width: 22 },
          { key: 'date', width: 24 }
        ];

        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'NEC CAMPUS STORE — STORE PRODUCT PURCHASE TRANSACTIONS';
        titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4C1D95' } };
        worksheet.getRow(1).height = 32;

        worksheet.mergeCells('A2:H2');
        const metaCell = worksheet.getCell('A2');
        metaCell.value = filterSummaryText + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Batches: ' + activeDataSet.length;
        metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
        metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
        metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
        worksheet.getRow(2).height = 22;

        worksheet.getRow(3).values = [];

        const headers = ['Batch ID', 'Category', 'Product Name', 'Purchased From', 'Units Added', 'Purchase Rate (₹)', 'Total Cost (₹)', 'Date & Time'];
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
            category: p.categoryName || 'General',
            productName: p.productName || 'Product',
            purchasedFrom: p.purchasedFrom || 'Wholesale Supplier',
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
          category: '-',
          productName: activeDataSet.length + ' Batches',
          purchasedFrom: '-',
          unitsAdded: totalUnits + ' units',
          purchaseRate: '-',
          totalCost: '₹' + totalCost.toFixed(2),
          date: '-'
        });
        summaryRow.height = 28;
        summaryRow.font = { bold: true, size: 11, color: { argb: '4C1D95' } };
        summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDE9FE' } };
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const typeSlug = activeTab === 'student' ? 'Student_Transactions' : 'Purchase_Transactions';
      a.download = 'NEC_Store_' + typeSlug + '_' + Date.now() + '.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      addToast('Downloaded ' + (activeTab === 'student' ? 'Student' : 'Purchase') + ' transactions Excel successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export transactions Excel.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={28} color="var(--primary-blue)" /> Transactions Ledger
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Separate ledger for customer payments received vs product stock purchases made for the store.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <GlassButton
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={() => { fetchTransactions(); fetchPurchases(); }}
              disabled={loading || purchaseLoading}
            >
              Refresh
            </GlassButton>

            <GlassButton
              variant="accent"
              size="md"
              icon={downloading ? RefreshCw : Download}
              disabled={downloading || loading || purchaseLoading || activeDataSet.length === 0}
              onClick={handleDownloadExcel}
              style={{
                background: activeTab === 'student'
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                color: '#ffffff',
                fontWeight: 700
              }}
            >
              {downloading ? 'Exporting...' : isFiltered ? 'Download Filtered Excel (' + activeDataSet.length + ')' : 'Download Excel (' + (activeTab === 'student' ? 'Student' : 'Purchases') + ')'}
            </GlassButton>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => { setActiveTab('student'); setCurrentPage(1); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'student' ? 'var(--primary-blue)' : 'var(--card-bg, rgba(255,255,255,0.06))',
              color: activeTab === 'student' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <GraduationCap size={18} />
            Student Transactions ({orders.length})
          </button>

          <button
            onClick={() => { setActiveTab('purchase'); setCurrentPage(1); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'purchase' ? 'var(--primary-purple)' : 'var(--card-bg, rgba(255,255,255,0.06))',
              color: activeTab === 'purchase' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <ShoppingCart size={18} />
            Purchase Transactions ({purchases.length})
          </button>
        </div>

        {/* Filter Toolbar */}
        <GlassCard hover={false} style={{ padding: '18px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '2 1 200px', minWidth: '180px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={activeTab === 'student' ? "Search student, txn ID..." : "Search product, vendor, batch..."}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="glass-input"
                style={{ paddingLeft: '36px', width: '100%', fontSize: '0.85rem' }}
              />
              {search && (
                <button onClick={() => { setSearch(''); setCurrentPage(1); }} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* From Date */}
            <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                  className="glass-input"
                  style={{ width: '100%', cursor: 'pointer', fontSize: '0.82rem', padding: '6px 8px' }}
                />
              </div>
            </div>

            {/* To Date */}
            <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>To:</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                  className="glass-input"
                  style={{ width: '100%', cursor: 'pointer', fontSize: '0.82rem', padding: '6px 8px' }}
                />
              </div>
            </div>

            {/* Reset */}
            {isFiltered && (
              <button
                onClick={clearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <X size={12} /> Reset
              </button>
            )}
          </div>
        </GlassCard>

        {/* Tab 1: Student Transactions Table */}
        {activeTab === 'student' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>TRANSACTION ID {renderSortIndicator('id')}</div>
                  </th>
                  <th>STUDENT / CUSTOMER</th>
                  <th>PAYMENT METHOD</th>
                  <th onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>AMOUNT (₹) {renderSortIndicator('totalAmount')}</div>
                  </th>
                  <th>STATUS</th>
                  <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>DATE {renderSortIndicator('createdAt')}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading student transactions...</td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No student transactions found.</td></tr>
                ) : paginatedData.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>#TXN-{String(o.id).padStart(4, '0')}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{o.User ? o.User.name : 'Student Customer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.User?.email || ''}</div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>RAZORPAY (Online)</span></td>
                    <td style={{ fontWeight: 800, color: '#059669', fontSize: '1rem' }}>+₹{parseFloat(o.totalAmount).toFixed(2)}</td>
                    <td><StatusBadge status={o.paymentStatus} /></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Purchase Transactions Table */}
        {activeTab === 'purchase' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>BATCH ID</th>
                  <th>CATEGORY</th>
                  <th>PRODUCT</th>
                  <th>PURCHASED FROM</th>
                  <th>UNITS ADDED</th>
                  <th>PURCHASE RATE</th>
                  <th>TOTAL COST</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {purchaseLoading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading purchase batches...</td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No purchase batches found.</td></tr>
                ) : paginatedData.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary-purple)' }}>#PURCH-{String(p.id).padStart(4, '0')}</td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.78rem', background: 'rgba(124,58,237,0.1)', color: 'var(--primary-purple)', fontWeight: 600 }}>
                        {p.categoryName || 'General'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{p.productName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Store size={14} color="#059669" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.purchasedFrom || 'Wholesale Supplier'}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>+{p.addedQuantity} units</td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(p.purchaseRatePerUnit || 0).toFixed(2)}</td>
                    <td style={{ fontWeight: 800, color: '#ef4444' }}>-₹{parseFloat(p.totalPurchaseCost || 0).toFixed(2)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <CenteredPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={activeDataSet.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel={activeTab === 'student' ? 'student transactions' : 'purchase batches'}
        />
      </main>
    </div>
  );
};

export default TransactionsPage;
