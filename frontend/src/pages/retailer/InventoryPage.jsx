import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Search, 
  X, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Package, 
  TrendingDown, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  Filter, 
  Tag, 
  Store 
} from 'lucide-react';
import ExcelJS from 'exceljs';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import GlassInput from '../../components/common/GlassInput';
import GlassModal from '../../components/common/GlassModal';
import StatusBadge from '../../components/common/StatusBadge';
import CenteredPagination from '../../components/common/CenteredPagination';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedQty, setAddedQty] = useState('');
  const [newBuyingPrice, setNewBuyingPrice] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter & Sort States
  const [search, setSearch] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL'); // ALL | HEALTHY | LOW | OUT
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('quantity');
  const [sortDirection, setSortDirection] = useState('asc'); // default show lowest stock first for restock

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAxios().get('/products');
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load inventory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAxios().get('/products/categories');
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenAddStock = (product) => {
    setSelectedProduct(product);
    setAddedQty('');
    setNewBuyingPrice(product.buyingPrice || '');
    setNewSellingPrice(product.sellingPrice || '');
    setSupplier('Authorized Campus Wholesaler');
  };

  const handleAddStockSubmit = async (e) => {
    e.preventDefault();
    if (!addedQty || parseInt(addedQty) <= 0) {
      addToast('Please enter a valid positive quantity to add.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await getAxios().post('/stock/add', {
        productId: selectedProduct.id,
        addedQuantity: parseInt(addedQty),
        newBuyingPrice: parseFloat(newBuyingPrice || selectedProduct.buyingPrice),
        newSellingPrice: parseFloat(newSellingPrice || selectedProduct.sellingPrice),
        supplier: supplier.trim() || 'Authorized Wholesale Supplier'
      });

      if (res.data.success) {
        addToast(res.data.message || 'Stock updated successfully!', 'success');
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to replenish stock.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if any filter is active
  const isFiltered = Boolean(search.trim() || categoryFilter !== 'ALL' || stockStatusFilter !== 'ALL');

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search Filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.Category && p.Category.name.toLowerCase().includes(q);
          const matchId = String(p.id).includes(q);
          if (!matchName && !matchCat && !matchId) return false;
        }

        // Category Filter
        if (categoryFilter !== 'ALL') {
          if (!p.Category || String(p.Category.id) !== String(categoryFilter)) {
            return false;
          }
        }

        // Stock Status Filter
        if (stockStatusFilter === 'OUT') {
          if (p.quantity !== 0) return false;
        } else if (stockStatusFilter === 'LOW') {
          if (p.quantity === 0 || p.quantity > p.lowStockThreshold) return false;
        } else if (stockStatusFilter === 'HEALTHY') {
          if (p.quantity <= p.lowStockThreshold) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'category') {
          valA = a.Category ? a.Category.name.toLowerCase() : '';
          valB = b.Category ? b.Category.name.toLowerCase() : '';
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        } else {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, search, categoryFilter, stockStatusFilter, sortKey, sortDirection]);

  // Overall Low Stock Count
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.quantity === 0).length;
  }, [products]);

  // Total Units & Stock Valuation in current filter
  const totalFilteredUnits = useMemo(() => {
    return filteredProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
  }, [filteredProducts]);

  const totalFilteredValuation = useMemo(() => {
    return filteredProducts.reduce((sum, p) => sum + ((p.quantity || 0) * Math.ceil(parseFloat(p.buyingPrice || 0))), 0);
  }, [filteredProducts]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

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
    setCategoryFilter('ALL');
    setStockStatusFilter('ALL');
    setCurrentPage(1);
  };

  // ═════════════════════════════════════════════════════════════════
  // EXCEL REPORT DOWNLOAD (Filtered vs Overall Category/Stock Report)
  // ═════════════════════════════════════════════════════════════════
  const handleDownloadExcel = async () => {
    const dataToExport = filteredProducts;
    if (dataToExport.length === 0) {
      addToast('No inventory records to export for the selected filters.', 'error');
      return;
    }

    setDownloading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventory Stock Report');

      // Set explicit column widths (no auto header to prevent overwriting Row 1)
      worksheet.columns = [
        { key: 'id', width: 14 },
        { key: 'category', width: 22 },
        { key: 'name', width: 38 },
        { key: 'quantity', width: 16 },
        { key: 'threshold', width: 20 },
        { key: 'buyingPrice', width: 18 },
        { key: 'sellingPrice', width: 18 },
        { key: 'status', width: 18 },
        { key: 'valuation', width: 24 }
      ];

      // 1. Title Banner (Row 1)
      worksheet.mergeCells('A1:I1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'NEC CAMPUS STORE — INVENTORY STOCK & VALUATION REPORT';
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F766E' } // Deep Teal / Emerald
      };
      worksheet.getRow(1).height = 32;

      // 2. Scope & Filter Metadata (Row 2)
      let filterDetails = [];
      if (categoryFilter !== 'ALL') {
        const catObj = categories.find(c => String(c.id) === String(categoryFilter));
        filterDetails.push('Category: ' + (catObj ? catObj.name : categoryFilter));
      }
      if (stockStatusFilter !== 'ALL') {
        const statusMap = { 'LOW': 'Low Stock Items Only', 'OUT': 'Out of Stock Only', 'HEALTHY': 'Healthy Stock Only' };
        filterDetails.push('Stock Status: ' + (statusMap[stockStatusFilter] || stockStatusFilter));
      }
      if (search.trim()) filterDetails.push('Search: "' + search.trim() + '"');

      const filterSummaryText = filterDetails.length > 0
        ? 'Filtered Scope: ' + filterDetails.join(' | ')
        : 'Overall Scope: All Categories & Products (Complete Catalog)';

      worksheet.mergeCells('A2:I2');
      const metaCell = worksheet.getCell('A2');
      metaCell.value = filterSummaryText + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Items: ' + dataToExport.length;
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
        'Product ID',
        'Category',
        'Product Name',
        'Current Stock',
        'Low Stock Threshold',
        'Buying Cost (₹)',
        'Selling Price (₹)',
        'Stock Status',
        'Total Valuation (₹)'
      ];

      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.height = 28;
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0D9488' } // Teal Brand Color
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'medium', color: { argb: '0F766E' } },
          bottom: { style: 'medium', color: { argb: '0F766E' } },
          left: { style: 'thin', color: { argb: '14B8A6' } },
          right: { style: 'thin', color: { argb: '14B8A6' } }
        };
      });

      // 4. Data Rows
      let exportTotalUnits = 0;
      let exportTotalValuation = 0;

      dataToExport.forEach((p, idx) => {
        const isOut = p.quantity === 0;
        const isLow = p.quantity > 0 && p.quantity <= p.lowStockThreshold;
        const statusText = isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'HEALTHY';
        const qty = p.quantity || 0;
        const bPrice = Math.ceil(parseFloat(p.buyingPrice || 0));
        const sPrice = parseFloat(p.sellingPrice || 0);
        const val = Math.ceil(qty * bPrice);

        exportTotalUnits += qty;
        exportTotalValuation += val;

        const row = worksheet.addRow({
          id: '#PROD-' + String(p.id).padStart(4, '0'),
          category: p.Category ? p.Category.name : 'Stationery',
          name: p.name,
          quantity: qty + ' units',
          threshold: p.lowStockThreshold + ' units',
          buyingPrice: '₹' + bPrice.toFixed(2),
          sellingPrice: '₹' + sPrice.toFixed(2),
          status: statusText,
          valuation: '₹' + val.toFixed(2)
        });

        row.height = 22;
        row.alignment = { vertical: 'middle' };

        // Alternate row coloring
        if (idx % 2 === 1) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F9FAFB' }
          };
        }

        // Color coding status cell (Column H)
        const statusCell = row.getCell(8);
        if (isOut) {
          statusCell.font = { bold: true, color: { argb: 'DC2626' } };
        } else if (isLow) {
          statusCell.font = { bold: true, color: { argb: 'D97706' } };
        } else {
          statusCell.font = { bold: true, color: { argb: '16A34A' } };
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
        id: 'TOTAL / SUMMARY',
        category: categoryFilter !== 'ALL' ? 'Selected Category' : 'All Categories',
        name: dataToExport.length + ' Products (' + (isFiltered ? 'Filtered' : 'Overall') + ')',
        quantity: exportTotalUnits + ' units in stock',
        threshold: '-',
        buyingPrice: '-',
        sellingPrice: '-',
        status: '-',
        valuation: '₹' + Math.ceil(exportTotalValuation).toFixed(2)
      });

      summaryRow.height = 28;
      summaryRow.font = { bold: true, size: 11, color: { argb: '0F766E' } };
      summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'CCFBF1' } // Light teal background
      };
      summaryRow.alignment = { vertical: 'middle' };
      summaryRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'medium', color: { argb: '0D9488' } },
          bottom: { style: 'double', color: { argb: '0D9488' } }
        };
      });

      // 6. Save and Trigger Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const catSlug = categoryFilter !== 'ALL' ? '_Cat_' + categoryFilter : '';
      const statusSlug = stockStatusFilter !== 'ALL' ? '_' + stockStatusFilter : '';
      a.download = 'NEC_Store_Inventory_Report' + catSlug + statusSlug + '_' + Date.now() + '.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      addToast(
        isFiltered
          ? 'Downloaded filtered inventory report (' + dataToExport.length + ' products) successfully!'
          : 'Downloaded overall inventory report successfully!',
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Failed to generate inventory Excel report.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Header with Title and Download Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={28} color="var(--primary-blue)" /> Inventory Stock & Restocking
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Monitor real-time inventory counts, replenish stock, and manage low stock thresholds.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <GlassButton
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={() => { fetchProducts(); fetchCategories(); }}
              disabled={loading}
            >
              Refresh
            </GlassButton>

            <GlassButton
              variant="accent"
              size="md"
              icon={downloading ? RefreshCw : Download}
              disabled={downloading || loading || filteredProducts.length === 0}
              onClick={handleDownloadExcel}
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                boxShadow: '0 4px 15px rgba(13, 148, 136, 0.35)',
                color: '#ffffff',
                fontWeight: 700
              }}
            >
              {downloading ? 'Exporting...' : isFiltered ? 'Download Filtered Excel (' + filteredProducts.length + ')' : 'Download Excel Report'}
            </GlassButton>
          </div>
        </div>

        {/* Filter Toolbar (Search, Category, Stock Status, Sort) */}
        <GlassCard hover={false} style={{ padding: '18px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '2 1 240px', minWidth: '200px' }}>
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
                placeholder="Search inventory by product name or category..."
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

            {/* Category Dropdown */}
            <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="glass-input"
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  borderColor: categoryFilter !== 'ALL' ? 'var(--primary-blue)' : undefined,
                  fontWeight: categoryFilter !== 'ALL' ? 600 : 'normal'
                }}
              >
                <option value="ALL">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter Dropdown */}
            <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
              <select
                value={stockStatusFilter}
                onChange={(e) => { setStockStatusFilter(e.target.value); setCurrentPage(1); }}
                className="glass-input"
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  borderColor: stockStatusFilter !== 'ALL' ? 'var(--primary-blue)' : undefined,
                  fontWeight: stockStatusFilter !== 'ALL' ? 600 : 'normal'
                }}
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="LOW">⚠️ Low Stock Items (≤ Alert)</option>
                <option value="OUT">❌ Out of Stock (0 units)</option>
                <option value="HEALTHY">✅ Healthy Stock (&gt; Alert)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
              <select
                value={sortKey + '_' + sortDirection}
                onChange={(e) => {
                  const parts = e.target.value.split('_');
                  const dir = parts.pop();
                  setSortKey(parts.join('_'));
                  setSortDirection(dir);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <option value="quantity_asc">Stock: Lowest First</option>
                <option value="quantity_desc">Stock: Highest First</option>
                <option value="name_asc">Product Name (A-Z)</option>
                <option value="category_asc">Category (A-Z)</option>
                <option value="buyingPrice_desc">Cost: High to Low</option>
                <option value="sellingPrice_desc">Retail Price: High to Low</option>
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

          {/* Stats Bar */}
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--neu-border-subtle)', fontSize: '0.83rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span>Total Catalog: <strong style={{ color: 'var(--text-main)' }}>{products.length}</strong></span>
              <span>Matched: <strong style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{filteredProducts.length}</strong></span>
              <span>Total Stock: <strong style={{ color: '#0d9488', fontWeight: 700 }}>{totalFilteredUnits} units</strong></span>
              <span>Asset Valuation: <strong style={{ color: '#059669', fontWeight: 700 }}>₹{Math.ceil(totalFilteredValuation).toFixed(2)}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {lowStockCount > 0 && (
                <span
                  onClick={() => { setStockStatusFilter('LOW'); setCurrentPage(1); }}
                  style={{ color: '#d97706', cursor: 'pointer', fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}
                >
                  ⚠️ Low Stock Items: {lowStockCount}
                </span>
              )}
              {outOfStockCount > 0 && (
                <span
                  onClick={() => { setStockStatusFilter('OUT'); setCurrentPage(1); }}
                  style={{ color: '#dc2626', cursor: 'pointer', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}
                >
                  ❌ Out of Stock: {outOfStockCount}
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Inventory Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>PRODUCT NAME {renderSortIndicator('name')}</div>
                </th>
                <th onClick={() => handleSort('category')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>CATEGORY {renderSortIndicator('category')}</div>
                </th>
                <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>CURRENT STOCK {renderSortIndicator('quantity')}</div>
                </th>
                <th onClick={() => handleSort('lowStockThreshold')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>THRESHOLD {renderSortIndicator('lowStockThreshold')}</div>
                </th>
                <th onClick={() => handleSort('buyingPrice')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>COST PRICE {renderSortIndicator('buyingPrice')}</div>
                </th>
                <th onClick={() => handleSort('sellingPrice')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>RETAIL PRICE {renderSortIndicator('sellingPrice')}</div>
                </th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading inventory details...
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <Package size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <div>No products match your inventory filter criteria.</div>
                    {isFiltered && (
                      <button
                        onClick={clearFilters}
                        style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                      >
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isOut = p.quantity === 0;
                  const isLow = p.quantity > 0 && p.quantity <= p.lowStockThreshold;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'}
                            alt={p.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid var(--neu-border-subtle)'
                            }}
                          />
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: 'var(--primary-blue)',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}>
                          {p.Category ? p.Category.name : 'Stationery'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          color: isOut ? 'var(--status-danger)' : isLow ? '#f59e0b' : 'var(--text-main)'
                        }}>
                          {p.quantity} units
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.lowStockThreshold} units</td>
                      <td>₹{Math.ceil(parseFloat(p.buyingPrice || 0)).toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>₹{parseFloat(p.sellingPrice || 0).toFixed(2)}</td>
                      <td>
                        <StatusBadge status={isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'HEALTHY'} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <GlassButton
                          variant="primary"
                          size="sm"
                          icon={PlusCircle}
                          onClick={() => handleOpenAddStock(p)}
                        >
                          Restock
                        </GlassButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Centered Pagination */}
        <CenteredPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="products"
        />
      </main>

      {/* Add Stock Modal */}
      <GlassModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Replenish Inventory Stock"
        maxWidth="500px"
      >
        {selectedProduct && (
          <form onSubmit={handleAddStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '10px' }}>
              <img
                src={selectedProduct.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'}
                alt=""
                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700 }}>{selectedProduct.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Stock: {selectedProduct.quantity} units</div>
              </div>
            </div>

            <GlassInput
              label="Quantity to Add *"
              type="number"
              min="1"
              placeholder="e.g. 50"
              value={addedQty}
              onChange={(e) => setAddedQty(e.target.value)}
              required
            />

            <GlassInput
              label="New Batch Purchase / Cost Price (₹)"
              type="number"
              step="0.01"
              min="0"
              placeholder={String(selectedProduct.buyingPrice || '0.00')}
              value={newBuyingPrice}
              onChange={(e) => setNewBuyingPrice(e.target.value)}
            />

            {/* WAC Preview */}
            {(() => {
              const prevQty = selectedProduct.quantity || 0;
              const prevPrice = parseFloat(selectedProduct.buyingPrice) || 0;
              const addQty = parseInt(addedQty) || 0;
              const addPrice = parseFloat(newBuyingPrice) || prevPrice;
              const totalQty = prevQty + addQty;
              const wac = totalQty === 0 ? 0
                : prevQty === 0 ? addPrice
                : ((prevQty * prevPrice) + (addQty * addPrice)) / totalQty;
              const changed = addQty > 0 && Math.abs(wac - prevPrice) > 0.001;
              return addQty > 0 ? (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: changed ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${changed ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  fontSize: '0.875rem'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px', color: changed ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingDown size={15} /> Weighted Average Cost Preview
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: 'var(--text-muted)' }}>
                    <span>Existing: <strong style={{color:'var(--text-main)'}}>{prevQty} units @ ₹{prevPrice.toFixed(2)}</strong></span>
                    <span>Adding: <strong style={{color:'var(--text-main)'}}>{addQty} units @ ₹{addPrice.toFixed(2)}</strong></span>
                    <span>Total Qty: <strong style={{color:'var(--text-main)'}}>{totalQty} units</strong></span>
                    <span>New Avg Cost: <strong style={{color: changed ? '#f59e0b' : '#10b981', fontSize:'1rem'}}>₹{wac.toFixed(2)}</strong></span>
                  </div>
                </div>
              ) : null;
            })()}

            <GlassInput
              label="Selling / Retail Price (₹)"
              type="number"
              step="0.01"
              min="0"
              placeholder={String(selectedProduct.sellingPrice || '0.00')}
              value={newSellingPrice}
              onChange={(e) => setNewSellingPrice(e.target.value)}
            />

            <div>
              <GlassInput
                label="Purchased From (Distributor / Supplier Name)"
                placeholder="e.g. Casio India Distributor, ITC Classmate Direct..."
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Distributor Presets:</span>
                {['ITC Classmate Direct', 'Casio India Distributor', 'Western Digital Wholesale', 'Navneet Stationery Hub', 'Sunrise Merchandising', 'RoboElements Tech'].map((dist, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSupplier(dist)}
                    style={{
                      background: supplier === dist ? 'var(--primary-purple, #7c3aed)' : 'var(--card-bg, #ffffff)',
                      color: supplier === dist ? '#ffffff' : 'var(--text-main, #334155)',
                      border: '1px solid var(--neu-border-subtle, #cbd5e1)',
                      borderRadius: '6px',
                      padding: '2px 7px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <GlassButton variant="secondary" onClick={() => setSelectedProduct(null)} disabled={submitting}>
                Cancel
              </GlassButton>
              <GlassButton variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Confirm Stock Addition'}
              </GlassButton>
            </div>
          </form>
        )}
      </GlassModal>
    </div>
  );
};

export default InventoryPage;
