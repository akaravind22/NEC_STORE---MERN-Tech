import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, X, Calendar, ArrowUpDown, ChevronUp, ChevronDown, Package, TrendingDown, IndianRupee, Download, RefreshCw, FileSpreadsheet, Filter, Tag, Building2, Store, Truck } from 'lucide-react';
import ExcelJS from 'exceljs';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import CenteredPagination from '../../components/common/CenteredPagination';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const PurchasePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalTransactions: 0, totalSpent: 0, totalUnits: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchPurchasesAndCategories = async () => {
    try {
      setLoading(true);
      const [purchasesRes, catRes] = await Promise.all([
        getAxios().get('/stock/purchases'),
        getAxios().get('/products/categories').catch(() => ({ data: { categories: [] } }))
      ]);

      if (purchasesRes.data.success) {
        setTransactions(purchasesRes.data.transactions || []);
        setSummary(purchasesRes.data.summary || {});
      }

      if (catRes.data && catRes.data.categories) {
        setCategories(catRes.data.categories);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load purchase transactions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasesAndCategories();
  }, []);

  const allCategoriesList = useMemo(() => {
    const set = new Set();
    categories.forEach(c => set.add(c.name));
    transactions.forEach(t => {
      if (t.categoryName) set.add(t.categoryName);
    });
    return Array.from(set).filter(Boolean);
  }, [categories, transactions]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDirection(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDirection('asc'); }
    setCurrentPage(1);
  };

  const renderSortIndicator = (key) => {
    if (sortKey !== key) return <ArrowUpDown size={13} style={{ opacity: 0.35, marginLeft: '6px' }} />;
    return sortDirection === 'asc'
      ? <ChevronUp size={14} style={{ color: 'var(--primary-blue)', marginLeft: '6px' }} />
      : <ChevronDown size={14} style={{ color: 'var(--primary-blue)', marginLeft: '6px' }} />;
  };

  const isFiltered = Boolean(search.trim() || selectedCategory || fromDate || toDate);

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const pFrom = (t.purchasedFrom || '').toLowerCase();
          const pName = (t.purchaserName || t.retailer?.name || '').toLowerCase();
          if (
            !t.productName.toLowerCase().includes(q) &&
            !String(t.id).includes(q) &&
            !(t.categoryName || '').toLowerCase().includes(q) &&
            !pFrom.includes(q) &&
            !pName.includes(q)
          ) return false;
        }
        if (selectedCategory) {
          if ((t.categoryName || '').toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }
        if (fromDate) {
          const start = new Date(fromDate + 'T00:00:00');
          if (new Date(t.createdAt) < start) return false;
        }
        if (toDate) {
          const end = new Date(toDate + 'T23:59:59');
          if (new Date(t.createdAt) > end) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'createdAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [transactions, search, selectedCategory, fromDate, toDate, sortKey, sortDirection]);

  const filteredSpent = useMemo(() => {
    return filtered.reduce((s, t) => s + (t.totalPurchaseCost || 0), 0);
  }, [filtered]);

  const filteredUnits = useMemo(() => {
    return filtered.reduce((s, t) => s + (t.addedQuantity || 0), 0);
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  // ═════════════════════════════════════════════════════════════════
  // EXCEL REPORT DOWNLOAD (With Purchased From Vendor & Category)
  // ═════════════════════════════════════════════════════════════════
  const handleDownloadExcel = async () => {
    const dataToExport = filtered;
    if (dataToExport.length === 0) {
      addToast('No purchase records found to export.', 'error');
      return;
    }

    setDownloading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Purchase Report');

      // Set column widths explicitly WITHOUT headers to prevent overwriting Row 1
      worksheet.columns = [
        { key: 'batchId', width: 16 },
        { key: 'category', width: 18 },
        { key: 'productName', width: 34 },
        { key: 'purchasedFrom', width: 32 },
        { key: 'unitsAdded', width: 14 },
        { key: 'stockFlow', width: 16 },
        { key: 'purchaseRate', width: 20 },
        { key: 'avgCost', width: 20 },
        { key: 'totalCost', width: 22 },
        { key: 'date', width: 24 }
      ];

      // 1. Title Banner (Row 1)
      worksheet.mergeCells('A1:J1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'NEC CAMPUS STORE — PRODUCT PURCHASES & EXPENDITURE REPORT';
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4C1D95' } // Royal Purple
      };
      worksheet.getRow(1).height = 32;

      // 2. Scope & Filter Metadata (Row 2)
      let filterDetails = [];
      if (selectedCategory) filterDetails.push('Category: ' + selectedCategory);
      if (fromDate) filterDetails.push('From: ' + fromDate);
      if (toDate) filterDetails.push('To: ' + toDate);
      if (search.trim()) filterDetails.push('Search: "' + search.trim() + '"');

      const filterSummaryText = filterDetails.length > 0 
        ? 'Filtered Scope: ' + filterDetails.join(' | ') 
        : 'Overall Scope: All Categories & Products (No Filter Applied)';

      worksheet.mergeCells('A2:J2');
      const metaCell = worksheet.getCell('A2');
      metaCell.value = filterSummaryText + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Batches: ' + dataToExport.length;
      metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
      metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
      metaCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F3F4F6' }
      };
      worksheet.getRow(2).height = 22;

      // Spacer (Row 3)
      worksheet.getRow(3).values = [];
      worksheet.getRow(3).height = 10;

      // 3. Table Column Headers (Row 4)
      const headers = [
        'Batch ID',
        'Category',
        'Product Name',
        'Purchased From',
        'Units Added',
        'Stock Flow',
        'Purchase Rate (₹)',
        'Avg Cost (WAC) (₹)',
        'Total Cost (₹)',
        'Purchase Date & Time'
      ];

      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.height = 28;
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '7C3AED' } // Vivid Purple
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'medium', color: { argb: '4C1D95' } },
          bottom: { style: 'medium', color: { argb: '4C1D95' } },
          left: { style: 'thin', color: { argb: '6D28D9' } },
          right: { style: 'thin', color: { argb: '6D28D9' } }
        };
      });

      // 4. Data Rows
      let exportTotalUnits = 0;
      let exportTotalCost = 0;

      dataToExport.forEach((p, idx) => {
        const added = p.addedQuantity || 0;
        const rate = parseFloat(p.purchaseRatePerUnit || 0);
        const cost = parseFloat(p.totalPurchaseCost || (added * rate));
        exportTotalUnits += added;
        exportTotalCost += cost;

        const row = worksheet.addRow({
          batchId: '#PURCH-' + String(p.id).padStart(4, '0'),
          category: p.categoryName || 'General',
          productName: p.productName || 'Product',
          purchasedFrom: p.purchasedFrom || 'Authorized Wholesale Supplier',
          unitsAdded: '+' + added + ' units',
          stockFlow: (p.previousQuantity || 0) + ' → ' + (p.newQuantity || 0),
          purchaseRate: '₹' + rate.toFixed(2),
          avgCost: '₹' + parseFloat(p.averageCostPrice || 0).toFixed(2),
          totalCost: '₹' + cost.toFixed(2),
          date: new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        });

        row.height = 22;
        row.alignment = { vertical: 'middle' };

        // Alternate row shading
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

      // 5. Grand Total Summary Row
      const summaryRow = worksheet.addRow({
        batchId: 'TOTAL / SUMMARY',
        category: selectedCategory || 'All Categories',
        productName: dataToExport.length + ' Batches (' + (isFiltered ? 'Filtered' : 'Overall') + ')',
        purchasedFrom: '-',
        unitsAdded: exportTotalUnits + ' units',
        stockFlow: '-',
        purchaseRate: '-',
        avgCost: '-',
        totalCost: '₹' + exportTotalCost.toFixed(2),
        date: '-'
      });

      summaryRow.height = 28;
      summaryRow.font = { bold: true, size: 11, color: { argb: '4C1D95' } };
      summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'EDE9FE' }
      };
      summaryRow.alignment = { vertical: 'middle' };
      summaryRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'medium', color: { argb: '7C3AED' } },
          bottom: { style: 'double', color: { argb: '7C3AED' } }
        };
      });

      // 6. Generate and Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const catSlug = selectedCategory ? '_' + selectedCategory.replace(/\s+/g, '_') : '';
      const dateScope = fromDate && toDate ? '_' + fromDate + '_to_' + toDate : (fromDate ? '_from_' + fromDate : (toDate ? '_until_' + toDate : ''));
      a.download = 'NEC_Store_Purchases_Report' + catSlug + dateScope + '_' + Date.now() + '.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      addToast(
        isFiltered 
          ? 'Downloaded filtered report (' + dataToExport.length + ' batches) successfully!' 
          : 'Downloaded overall purchase report successfully!',
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Failed to export Excel report.', 'error');
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
              <ShoppingCart size={28} color="var(--primary-purple)" /> Purchase History & Reports
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Track all product purchases made for the store — supplier / vendor details, category-wise costs, unit rates, and weighted average prices.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <GlassButton
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={fetchPurchasesAndCategories}
              disabled={loading}
            >
              Refresh
            </GlassButton>

            <GlassButton
              variant="accent"
              size="md"
              icon={downloading ? RefreshCw : Download}
              disabled={downloading || loading || filtered.length === 0}
              onClick={handleDownloadExcel}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.35)',
                color: '#ffffff',
                fontWeight: 700
              }}
            >
              {downloading ? 'Exporting...' : isFiltered ? 'Download Filtered Excel (' + filtered.length + ')' : 'Download Excel Report'}
            </GlassButton>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <GlassCard hover={false} style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              TOTAL PURCHASE BATCHES
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
              {summary.totalTransactions}
            </div>
          </GlassCard>

          <GlassCard hover={false} style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              TOTAL UNITS PURCHASED
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-purple)' }}>
              {summary.totalUnits}
            </div>
          </GlassCard>

          <GlassCard hover={false} style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              TOTAL MONEY SPENT
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>
              ₹{(summary.totalSpent || 0).toFixed(2)}
            </div>
          </GlassCard>

          <GlassCard hover={false} style={{ padding: '20px', borderColor: isFiltered ? 'rgba(124,58,237,0.4)' : undefined, background: isFiltered ? 'rgba(124,58,237,0.06)' : undefined }}>
            <div style={{ fontSize: '0.8rem', color: isFiltered ? 'var(--primary-purple)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: isFiltered ? 700 : 500 }}>
              {isFiltered ? 'FILTERED SPEND (' + filtered.length + ' BATCHES)' : 'ACTIVE SCOPE'}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
              ₹{filteredSpent.toFixed(2)}
            </div>
          </GlassCard>
        </div>

        {/* Filter Toolbar (Search, Category Filter, From Date, To Date, Sort) */}
        <GlassCard hover={false} style={{ padding: '18px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '2 1 200px', minWidth: '180px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search product, supplier, batch..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="glass-input"
                style={{ paddingLeft: '36px', width: '100%', fontSize: '0.85rem' }}
              />
              {search && (
                <button onClick={() => { setSearch(''); setCurrentPage(1); }} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Dropdown Filter */}
            <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
              <select
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="glass-input"
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  borderColor: selectedCategory ? 'var(--primary-purple)' : undefined,
                  fontWeight: selectedCategory ? 600 : 'normal'
                }}
              >
                <option value="">All Categories</option>
                {allCategoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* From Date Picker */}
            <div style={{ flex: '1 1 145px', minWidth: '135px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>From:</span>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={e => { setFromDate(e.target.value); setCurrentPage(1); }}
                    className="glass-input"
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      borderColor: fromDate ? 'var(--primary-purple)' : undefined,
                      paddingRight: fromDate ? '24px' : '6px',
                      fontSize: '0.82rem',
                      padding: '6px 8px'
                    }}
                  />
                  {fromDate && (
                    <button
                      onClick={() => { setFromDate(''); setCurrentPage(1); }}
                      title="Clear From Date"
                      style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger)' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* To Date Picker */}
            <div style={{ flex: '1 1 145px', minWidth: '135px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>To:</span>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={e => { setToDate(e.target.value); setCurrentPage(1); }}
                    className="glass-input"
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      borderColor: toDate ? 'var(--primary-purple)' : undefined,
                      paddingRight: toDate ? '24px' : '6px',
                      fontSize: '0.82rem',
                      padding: '6px 8px'
                    }}
                  />
                  {toDate && (
                    <button
                      onClick={() => { setToDate(''); setCurrentPage(1); }}
                      title="Clear To Date"
                      style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger)' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
              <select
                value={sortKey + '_' + sortDirection}
                onChange={e => {
                  const parts = e.target.value.split('_');
                  const dir = parts.pop();
                  setSortKey(parts.join('_'));
                  setSortDirection(dir);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <option value="createdAt_desc">Date: Newest First</option>
                <option value="createdAt_asc">Date: Oldest First</option>
                <option value="totalPurchaseCost_desc">Cost: High to Low</option>
                <option value="totalPurchaseCost_asc">Cost: Low to High</option>
                <option value="addedQuantity_desc">Units: Most First</option>
                <option value="purchasedFrom_asc">Purchased From (A-Z)</option>
                <option value="productName_asc">Product Name (A-Z)</option>
              </select>
            </div>

            {/* Reset Filters Button */}
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

          {/* Active Filter Details Bar */}
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--neu-border-subtle)', fontSize: '0.83rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span>Total Batches: <strong style={{ color: 'var(--text-main)' }}>{summary.totalTransactions}</strong></span>
              <span>Matched: <strong style={{ color: 'var(--primary-purple)', fontWeight: 700 }}>{filtered.length}</strong></span>
              <span>Units: <strong style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{filteredUnits}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {selectedCategory && (
                <span style={{ color: 'var(--primary-purple)', fontWeight: 700, background: 'rgba(124,58,237,0.12)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                  🏷️ Category: {selectedCategory}
                </span>
              )}
              {fromDate && (
                <span style={{ color: 'var(--primary-purple)', fontWeight: 600, background: 'rgba(124,58,237,0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                  📅 From: {new Date(fromDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              {toDate && (
                <span style={{ color: 'var(--primary-purple)', fontWeight: 600, background: 'rgba(124,58,237,0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                  📅 To: {new Date(toDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Purchase Transactions Table */}
        <GlassCard hover={false} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }} className="glass-table">
              <thead>
                <tr>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Batch ID</th>
                  <th onClick={() => handleSort('categoryName')} style={{ padding: '14px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Category {renderSortIndicator('categoryName')}</div>
                  </th>
                  <th onClick={() => handleSort('productName')} style={{ padding: '14px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Product {renderSortIndicator('productName')}</div>
                  </th>
                  <th onClick={() => handleSort('purchasedFrom')} style={{ padding: '14px 16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Purchased From {renderSortIndicator('purchasedFrom')}</div>
                  </th>
                  <th onClick={() => handleSort('addedQuantity')} style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Units Added {renderSortIndicator('addedQuantity')}</div>
                  </th>
                  <th onClick={() => handleSort('purchaseRatePerUnit')} style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Purchase Rate {renderSortIndicator('purchaseRatePerUnit')}</div>
                  </th>
                  <th style={{ padding: '14px 16px' }}>Avg Cost After</th>
                  <th onClick={() => handleSort('totalPurchaseCost')} style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Total Cost {renderSortIndicator('totalPurchaseCost')}</div>
                  </th>
                  <th onClick={() => handleSort('createdAt')} style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Date {renderSortIndicator('createdAt')}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading purchases...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      <Package size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                      <div>No purchase transactions found matching the selected filters.</div>
                      {isFiltered && (
                        <button
                          onClick={clearFilters}
                          style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--primary-purple)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          Clear all filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : paginated.map(t => (
                  <tr key={t.id}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary-purple)', fontSize: '0.85rem' }}>
                      #PURCH-{String(t.id).padStart(4, '0')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: 'rgba(124,58,237,0.1)',
                        color: 'var(--primary-purple)',
                        border: '1px solid rgba(124,58,237,0.2)'
                      }}>
                        {t.categoryName || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {t.productImage ? (
                          <img src={t.productImage} alt="" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--neu-border-subtle)' }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} color="var(--primary-purple)" />
                          </div>
                        )}
                        <span style={{ fontWeight: 700 }}>{t.productName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={15} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            {t.purchasedFrom || 'Authorized Wholesale Supplier'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Vendor / Dealer
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary-blue)', fontSize: '0.95rem' }}>
                      +{t.addedQuantity} units
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      ₹{(Number(t.purchaseRatePerUnit || t.batchRate || 0)).toFixed(2)}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        prev: ₹{(Number(t.previousCostPrice ?? t.previousBuyingPrice ?? 0)).toFixed(2)}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#f59e0b', fontWeight: 700 }}>
                      ₹{(Number(t.averageCostPrice ?? t.averageBuyingPrice ?? 0)).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 900, fontSize: '1rem', color: '#ef4444' }}>
                      ₹{(Number(t.totalPurchaseCost ?? t.totalCost ?? 0)).toFixed(2)}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {t.addedQuantity} × ₹{(Number(t.purchaseRatePerUnit || t.batchRate || 0)).toFixed(2)}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <div style={{ fontSize: '0.72rem' }}>
                        {new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <CenteredPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="purchases"
        />
      </main>
    </div>
  );
};

export default PurchasePage;
