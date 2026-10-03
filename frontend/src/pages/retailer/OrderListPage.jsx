import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Search, 
  X, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Filter, 
  Calendar, 
  Download, 
  RefreshCw, 
  FileSpreadsheet 
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

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Search & Filter & Sort States
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Date range filter
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAxios().get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newOrderStatus, newDeliveryStatus) => {
    setUpdating(true);
    try {
      const res = await getAxios().put(`/orders/${orderId}/status`, {
        orderStatus: newOrderStatus,
        deliveryStatus: newDeliveryStatus
      });

      if (res.data.success) {
        addToast('Order status updated successfully.', 'success');
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.data.order);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setUpdating(false);
    }
  };

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

  const isFiltered = Boolean(
    search.trim() ||
    orderStatusFilter !== 'ALL' ||
    paymentStatusFilter !== 'ALL' ||
    deliveryStatusFilter !== 'ALL' ||
    fromDate ||
    toDate
  );

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Search Filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchId = ('#ORD-' + o.id).toLowerCase().includes(q) || String(o.id).includes(q);
          const matchCust = o.User && o.User.name.toLowerCase().includes(q);
          const matchEmail = o.User && o.User.email.toLowerCase().includes(q);
          if (!matchId && !matchCust && !matchEmail) return false;
        }

        // Status Filters
        if (orderStatusFilter !== 'ALL' && o.orderStatus !== orderStatusFilter) return false;
        if (paymentStatusFilter !== 'ALL' && o.paymentStatus !== paymentStatusFilter) return false;
        if (deliveryStatusFilter !== 'ALL' && o.deliveryStatus !== deliveryStatusFilter) return false;

        // Date Range
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
        } else if (sortKey === 'customer') {
          valA = a.User ? a.User.name.toLowerCase() : '';
          valB = b.User ? b.User.name.toLowerCase() : '';
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [orders, search, orderStatusFilter, paymentStatusFilter, deliveryStatusFilter, fromDate, toDate, sortKey, sortDirection]);

  const totalFilteredRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const clearFilters = () => {
    setSearch('');
    setOrderStatusFilter('ALL');
    setPaymentStatusFilter('ALL');
    setDeliveryStatusFilter('ALL');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  // ═════════════════════════════════════════════════════════════════
  // EXCEL REPORT DOWNLOAD (Orders)
  // ═════════════════════════════════════════════════════════════════
  const handleDownloadExcel = async () => {
    const dataToExport = filteredOrders;
    if (dataToExport.length === 0) {
      addToast('No orders found to export for selected criteria.', 'error');
      return;
    }

    setDownloading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders Report');

      worksheet.columns = [
        { key: 'id', width: 14 },
        { key: 'customerName', width: 26 },
        { key: 'customerEmail', width: 28 },
        { key: 'paymentStatus', width: 16 },
        { key: 'orderStatus', width: 16 },
        { key: 'deliveryStatus', width: 16 },
        { key: 'totalAmount', width: 20 },
        { key: 'date', width: 24 }
      ];

      // 1. Title Banner
      worksheet.mergeCells('A1:H1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'NEC CAMPUS STORE — SALES ORDERS & REVENUE REPORT';
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E40AF' }
      };
      worksheet.getRow(1).height = 32;

      // 2. Metadata Subheader
      let filterDetails = [];
      if (fromDate) filterDetails.push('From: ' + fromDate);
      if (toDate) filterDetails.push('To: ' + toDate);
      if (orderStatusFilter !== 'ALL') filterDetails.push('Order: ' + orderStatusFilter);
      if (paymentStatusFilter !== 'ALL') filterDetails.push('Payment: ' + paymentStatusFilter);
      if (search.trim()) filterDetails.push('Search: "' + search.trim() + '"');

      const filterSummaryText = filterDetails.length > 0
        ? 'Filtered Scope: ' + filterDetails.join(' | ')
        : 'Overall Scope: All Orders (No Filter Applied)';

      worksheet.mergeCells('A2:H2');
      const metaCell = worksheet.getCell('A2');
      metaCell.value = filterSummaryText + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Orders: ' + dataToExport.length;
      metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
      metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
      metaCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F3F4F6' }
      };
      worksheet.getRow(2).height = 22;

      worksheet.getRow(3).values = [];
      worksheet.getRow(3).height = 10;

      // 3. Table Headers
      const headers = [
        'Order ID',
        'Customer Name',
        'Email Address',
        'Payment Status',
        'Order Status',
        'Delivery Status',
        'Total Amount (₹)',
        'Order Date & Time'
      ];

      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.height = 26;
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '2563EB' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'medium', color: { argb: '1E40AF' } },
          bottom: { style: 'medium', color: { argb: '1E40AF' } },
          left: { style: 'thin', color: { argb: '3B82F6' } },
          right: { style: 'thin', color: { argb: '3B82F6' } }
        };
      });

      let totalExportRevenue = 0;

      dataToExport.forEach((o, idx) => {
        const amt = parseFloat(o.totalAmount || 0);
        totalExportRevenue += amt;

        const row = worksheet.addRow({
          id: '#ORD-' + String(o.id).padStart(4, '0'),
          customerName: o.User ? o.User.name : 'Walk-in Student',
          customerEmail: o.User ? o.User.email : 'N/A',
          paymentStatus: o.paymentStatus || 'PAID',
          orderStatus: o.orderStatus || 'COMPLETED',
          deliveryStatus: o.deliveryStatus || 'DELIVERED',
          totalAmount: '₹' + amt.toFixed(2),
          date: new Date(o.createdAt).toLocaleString('en-IN')
        });

        row.height = 22;
        row.alignment = { vertical: 'middle' };

        if (idx % 2 === 1) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F9FAFB' }
          };
        }

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } }
          };
        });
      });

      // 5. Summary Row
      const summaryRow = worksheet.addRow({
        id: 'TOTAL / SUMMARY',
        customerName: dataToExport.length + ' Orders (' + (isFiltered ? 'Filtered' : 'Overall') + ')',
        customerEmail: '-',
        paymentStatus: '-',
        orderStatus: '-',
        deliveryStatus: '-',
        totalAmount: '₹' + totalExportRevenue.toFixed(2),
        date: '-'
      });

      summaryRow.height = 28;
      summaryRow.font = { bold: true, size: 11, color: { argb: '1E40AF' } };
      summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DBEAFE' }
      };
      summaryRow.alignment = { vertical: 'middle' };
      summaryRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'medium', color: { argb: '2563EB' } },
          bottom: { style: 'double', color: { argb: '2563EB' } }
        };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateScope = fromDate && toDate ? '_' + fromDate + '_to_' + toDate : (fromDate ? '_from_' + fromDate : (toDate ? '_until_' + toDate : ''));
      a.download = 'NEC_Store_Orders_Report' + dateScope + '_' + Date.now() + '.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      addToast(
        isFiltered
          ? 'Downloaded filtered orders report (' + dataToExport.length + ' orders) successfully!'
          : 'Downloaded overall orders report successfully!',
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Failed to export orders Excel report.', 'error');
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
              <ShoppingBag size={28} color="var(--primary-blue)" /> Customer Orders
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Manage incoming student orders, track payments, and update delivery statuses.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <GlassButton
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={fetchOrders}
              disabled={loading}
            >
              Refresh
            </GlassButton>

            <GlassButton
              variant="accent"
              size="md"
              icon={downloading ? RefreshCw : Download}
              disabled={downloading || loading || filteredOrders.length === 0}
              onClick={handleDownloadExcel}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35)',
                color: '#ffffff',
                fontWeight: 700
              }}
            >
              {downloading ? 'Exporting...' : isFiltered ? 'Download Filtered Excel (' + filteredOrders.length + ')' : 'Download Excel Report'}
            </GlassButton>
          </div>
        </div>

        {/* Filter Toolbar */}
        <GlassCard hover={false} style={{ padding: '18px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '2 1 200px', minWidth: '180px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search by Order ID, customer..."
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
            <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>From:</span>
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
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>To:</span>
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

            {/* Payment Filter */}
            <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
              <select
                value={paymentStatusFilter}
                onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(1); }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">PAID</option>
                <option value="UNPAID">UNPAID</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            {/* Delivery Filter */}
            <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
              <select
                value={deliveryStatusFilter}
                onChange={(e) => { setDeliveryStatusFilter(e.target.value); setCurrentPage(1); }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Deliveries</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="NOT_DELIVERED">NOT DELIVERED</option>
              </select>
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

          {/* Stats Bar */}
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--neu-border-subtle)', fontSize: '0.83rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span>Total Orders: <strong style={{ color: 'var(--text-main)' }}>{orders.length}</strong></span>
              <span>Matched: <strong style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{filteredOrders.length}</strong></span>
              <span>Total Revenue: <strong style={{ color: '#059669', fontWeight: 700 }}>₹{totalFilteredRevenue.toFixed(2)}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {fromDate && (
                <span style={{ color: 'var(--primary-blue)', fontWeight: 600, background: 'rgba(37,99,235,0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                  📅 From: {new Date(fromDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              {toDate && (
                <span style={{ color: 'var(--primary-blue)', fontWeight: 600, background: 'rgba(37,99,235,0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                  📅 To: {new Date(toDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>ORDER ID {renderSortIndicator('id')}</div>
                </th>
                <th onClick={() => handleSort('customer')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>CUSTOMER {renderSortIndicator('customer')}</div>
                </th>
                <th onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>TOTAL AMOUNT {renderSortIndicator('totalAmount')}</div>
                </th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>DELIVERY</th>
                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>DATE {renderSortIndicator('createdAt')}</div>
                </th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '0.85rem' }}>
                      #ORD-{String(o.id).padStart(4, '0')}
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{o.User ? o.User.name : 'Unknown User'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.User?.email || ''}</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{parseFloat(o.totalAmount).toFixed(2)}</td>
                    <td><StatusBadge status={o.paymentStatus} /></td>
                    <td><StatusBadge status={o.orderStatus} /></td>
                    <td><StatusBadge status={o.deliveryStatus} /></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedOrder(o)}
                      >
                        Details
                      </GlassButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <CenteredPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="orders"
        />
      </main>

      {/* Order Details Modal */}
      <GlassModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Details #ORD-${String(selectedOrder.id).padStart(4, '0')}` : 'Order Details'}
        maxWidth="600px"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', background: 'var(--neu-inset-bg)', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer</div>
                <div style={{ fontWeight: 600 }}>{selectedOrder.User?.name || 'Walk-in'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedOrder.User?.email || ''}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment & Delivery</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <StatusBadge status={selectedOrder.paymentStatus} />
                  <StatusBadge status={selectedOrder.deliveryStatus} />
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Purchased Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--neu-border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.Product?.name || 'Item'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{parseFloat(item.unitPrice).toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>₹{parseFloat(item.subtotal).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--neu-border-subtle)', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total Bill Amount</span>
              <span style={{ color: 'var(--primary-blue)' }}>₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
            </div>

            {/* Status Update Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Update Order / Delivery:</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {selectedOrder.deliveryStatus !== 'DELIVERED' && (
                  <GlassButton
                    variant="primary"
                    size="sm"
                    icon={Truck}
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED', 'DELIVERED')}
                  >
                    Mark Delivered
                  </GlassButton>
                )}
                {selectedOrder.orderStatus === 'CREATED' && (
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={Clock}
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING', selectedOrder.deliveryStatus)}
                  >
                    Mark Processing
                  </GlassButton>
                )}
              </div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export default OrderListPage;
