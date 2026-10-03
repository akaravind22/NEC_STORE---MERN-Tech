import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  X, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  Calendar, 
  Store 
} from 'lucide-react';
import ExcelJS from 'exceljs';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import CenteredPagination from '../../components/common/CenteredPagination';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const StockHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Search & Filter & Sort States
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Date Range
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getAxios().get('/stock/history');
      if (res.data.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load stock history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
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

  const isFiltered = Boolean(search.trim() || fromDate || toDate);

  const filteredHistory = useMemo(() => {
    return history
      .filter((h) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchLogId = ('#' + h.id).includes(q) || String(h.id).includes(q);
          const matchProd = (h.Product?.name || '').toLowerCase().includes(q);
          const matchVendor = (h.supplier || h.purchasedFrom || '').toLowerCase().includes(q);
          const matchRetailer = (h.retailer?.name || '').toLowerCase().includes(q);
          if (!matchLogId && !matchProd && !matchVendor && !matchRetailer) return false;
        }

        if (fromDate) {
          const start = new Date(fromDate + 'T00:00:00');
          if (new Date(h.createdAt) < start) return false;
        }
        if (toDate) {
          const end = new Date(toDate + 'T23:59:59');
          if (new Date(h.createdAt) > end) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'product') {
          valA = a.Product?.name || '';
          valB = b.Product?.name || '';
        } else if (sortKey === 'retailer') {
          valA = a.retailer?.name || '';
          valB = b.retailer?.name || '';
        } else if (sortKey === 'addedQuantity' || sortKey === 'newQuantity') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else if (sortKey === 'createdAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [history, search, fromDate, toDate, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage]);

  const clearFilters = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  // ═════════════════════════════════════════════════════════════════
  // EXCEL REPORT DOWNLOAD (Stock History)
  // ═════════════════════════════════════════════════════════════════
  const handleDownloadExcel = async () => {
    const dataToExport = filteredHistory;
    if (dataToExport.length === 0) {
      addToast('No stock history logs found to export.', 'error');
      return;
    }

    setDownloading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Incoming Stock History');

      worksheet.columns = [
        { key: 'id', width: 14 },
        { key: 'productName', width: 34 },
        { key: 'purchasedFrom', width: 30 },
        { key: 'retailerName', width: 22 },
        { key: 'prevQty', width: 14 },
        { key: 'addedQty', width: 14 },
        { key: 'newQty', width: 14 },
        { key: 'newPrice', width: 18 },
        { key: 'avgPrice', width: 20 },
        { key: 'date', width: 24 }
      ];

      worksheet.mergeCells('A1:J1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'NEC CAMPUS STORE — INCOMING STOCK & AUDIT HISTORY';
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '5B21B6' } };
      worksheet.getRow(1).height = 32;

      let filterDetails = [];
      if (fromDate) filterDetails.push('From: ' + fromDate);
      if (toDate) filterDetails.push('To: ' + toDate);
      if (search.trim()) filterDetails.push('Search: "' + search.trim() + '"');

      const filterSummaryText = filterDetails.length > 0
        ? 'Filtered Scope: ' + filterDetails.join(' | ')
        : 'Overall Scope: All Stock Logs (No Filter Applied)';

      worksheet.mergeCells('A2:J2');
      const metaCell = worksheet.getCell('A2');
      metaCell.value = filterSummaryText + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Logs: ' + dataToExport.length;
      metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
      metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
      metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
      worksheet.getRow(2).height = 22;

      worksheet.getRow(3).values = [];

      const headers = [
        'Log ID',
        'Product Name',
        'Purchased From (Vendor)',
        'Logged By',
        'Previous Qty',
        'Added Units',
        'New Stock',
        'Batch Rate (₹)',
        'Avg Cost (WAC) (₹)',
        'Date & Time'
      ];

      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.height = 26;
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      let totalAddedUnits = 0;
      dataToExport.forEach((h, idx) => {
        const added = h.addedQuantity || 0;
        totalAddedUnits += added;

        const row = worksheet.addRow({
          id: '#LOG-' + String(h.id).padStart(4, '0'),
          productName: h.Product ? h.Product.name : 'Product',
          purchasedFrom: h.supplier || 'Authorized Wholesale Supplier',
          retailerName: h.retailer ? h.retailer.name : 'Campus Retailer',
          prevQty: (h.previousQuantity || 0) + ' units',
          addedQty: '+' + added + ' units',
          newQty: (h.newQuantity || 0) + ' units',
          newPrice: '₹' + parseFloat(h.newBuyingPrice || 0).toFixed(2),
          avgPrice: '₹' + parseFloat(h.averageBuyingPrice || 0).toFixed(2),
          date: new Date(h.createdAt).toLocaleString('en-IN')
        });

        row.height = 22;
        if (idx % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
      });

      const summaryRow = worksheet.addRow({
        id: 'TOTAL / SUMMARY',
        productName: dataToExport.length + ' Logs (' + (isFiltered ? 'Filtered' : 'Overall') + ')',
        purchasedFrom: '-',
        retailerName: '-',
        prevQty: '-',
        addedQty: totalAddedUnits + ' units added',
        newQty: '-',
        newPrice: '-',
        avgPrice: '-',
        date: '-'
      });
      summaryRow.height = 28;
      summaryRow.font = { bold: true, size: 11, color: { argb: '5B21B6' } };
      summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDE9FE' } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NEC_Store_Stock_History_' + Date.now() + '.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      addToast('Downloaded incoming stock history Excel successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export stock history Excel.', 'error');
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
              <History size={28} color="var(--primary-purple)" /> Incoming Stock History
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Detailed audit trail of all restocked units, suppliers, and updated weighted average costs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <GlassButton
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={fetchHistory}
              disabled={loading}
            >
              Refresh
            </GlassButton>

            <GlassButton
              variant="accent"
              size="md"
              icon={downloading ? RefreshCw : Download}
              disabled={downloading || loading || filteredHistory.length === 0}
              onClick={handleDownloadExcel}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.35)',
                color: '#ffffff',
                fontWeight: 700
              }}
            >
              {downloading ? 'Exporting...' : isFiltered ? 'Download Filtered Excel (' + filteredHistory.length + ')' : 'Download Excel Report'}
            </GlassButton>
          </div>
        </div>

        {/* Filter Toolbar */}
        <GlassCard hover={false} style={{ padding: '18px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '2 1 200px', minWidth: '180px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by product, vendor, log ID..."
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

        {/* History Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>LOG ID {renderSortIndicator('id')}</div>
                </th>
                <th onClick={() => handleSort('product')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>PRODUCT {renderSortIndicator('product')}</div>
                </th>
                <th>PURCHASED FROM</th>
                <th onClick={() => handleSort('retailer')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>LOGGED BY {renderSortIndicator('retailer')}</div>
                </th>
                <th>PREV QTY</th>
                <th onClick={() => handleSort('addedQuantity')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>ADDED UNITS {renderSortIndicator('addedQuantity')}</div>
                </th>
                <th>NEW QTY</th>
                <th>BATCH RATE</th>
                <th>NEW AVG COST</th>
                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>DATE {renderSortIndicator('createdAt')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading history...</td></tr>
              ) : paginatedHistory.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No stock history logs match your filter criteria.</td></tr>
              ) : (
                paginatedHistory.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary-purple)' }}>#LOG-{String(h.id).padStart(4, '0')}</td>
                    <td style={{ fontWeight: 700 }}>{h.Product ? h.Product.name : 'Unknown Product'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Store size={14} color="#059669" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{h.supplier || 'Wholesale Supplier'}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{h.retailer ? h.retailer.name : 'Campus Retailer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.retailer?.email || ''}</div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{h.previousQuantity} units</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>+{h.addedQuantity} units</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{h.newQuantity} units</td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(h.newBuyingPrice).toFixed(2)}</td>
                    <td style={{ color: '#f59e0b', fontWeight: 700 }}>₹{parseFloat(h.averageBuyingPrice).toFixed(2)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
          totalItems={filteredHistory.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="stock logs"
        />
      </main>
    </div>
  );
};

export default StockHistoryPage;
