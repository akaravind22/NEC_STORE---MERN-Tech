import React, { useState, useEffect, useMemo, useRef } from 'react';
import ExcelJS from 'exceljs';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  FileSpreadsheet,
  Upload,
  Download,
  Filter,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  Package
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import GlassModal from '../../components/common/GlassModal';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CenteredPagination from '../../components/common/CenteredPagination';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL | HEALTHY | LOW | OUT

  // Sort States
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Bulk Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAxios().get('/products');
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await getAxios().get('/products/categories');
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle single product delete
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await getAxios().delete('/products/' + deleteId);
      if (res.data.success) {
        addToast('Product deleted successfully.', 'success');
        fetchProducts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  // Download Excel template
  
  const [downloadingExport, setDownloadingExport] = useState(false);

  const handleExportProductsExcel = async () => {
    const dataToExport = filteredProducts;
    if (dataToExport.length === 0) {
      addToast('No products found to export.', 'error');
      return;
    }

    setDownloadingExport(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Product Catalog');

      worksheet.columns = [
        { key: 'id', width: 14 },
        { key: 'category', width: 22 },
        { key: 'name', width: 36 },
        { key: 'buyingPrice', width: 18 },
        { key: 'sellingPrice', width: 18 },
        { key: 'quantity', width: 16 },
        { key: 'threshold', width: 20 },
        { key: 'status', width: 18 },
        { key: 'totalValuation', width: 22 }
      ];

      // 1. Title Banner
      worksheet.mergeCells('A1:I1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'NEC CAMPUS STORE — PRODUCT CATALOG & INVENTORY';
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E40AF' }
      };
      worksheet.getRow(1).height = 32;

      // 2. Metadata Banner
      const isFiltered = searchTerm || selectedCategory !== 'ALL' || selectedStockFilter !== 'ALL';
      let filterDetails = [];
      if (searchTerm) filterDetails.push('Search: "' + searchTerm + '"');
      if (selectedCategory !== 'ALL') {
        const catObj = categories.find(c => String(c.id) === String(selectedCategory));
        filterDetails.push('Category: ' + (catObj ? catObj.name : selectedCategory));
      }
      if (selectedStockFilter !== 'ALL') filterDetails.push('Stock Status: ' + selectedStockFilter);

      worksheet.mergeCells('A2:I2');
      const metaCell = worksheet.getCell('A2');
      metaCell.value = (isFiltered ? 'Scope: Filtered (' + filterDetails.join(' | ') + ')' : 'Scope: Overall Product Catalog') + 
        '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Products: ' + dataToExport.length;
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
        'Product ID',
        'Category',
        'Product Name',
        'Buying Cost (₹)',
        'Selling Price (₹)',
        'Current Stock',
        'Low Stock Threshold',
        'Stock Status',
        'Total Valuation (₹)'
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

      let totalStockUnits = 0;
      let totalInventoryValuation = 0;

      dataToExport.forEach((p, idx) => {
        const qty = p.quantity || 0;
        const bPrice = parseFloat(p.buyingPrice || 0);
        const sPrice = parseFloat(p.sellingPrice || 0);
        const val = qty * bPrice;
        totalStockUnits += qty;
        totalInventoryValuation += val;

        const isOut = qty === 0;
        const isLow = qty > 0 && qty <= (p.lowStockThreshold || 10);
        const statusText = isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'HEALTHY';

        const row = worksheet.addRow({
          id: '#PROD-' + String(p.id).padStart(4, '0'),
          category: p.Category ? p.Category.name : (p.categoryName || 'General'),
          name: p.name,
          buyingPrice: '₹' + bPrice.toFixed(2),
          sellingPrice: '₹' + sPrice.toFixed(2),
          quantity: qty + ' units',
          threshold: (p.lowStockThreshold || 10) + ' units',
          status: statusText,
          totalValuation: '₹' + val.toFixed(2)
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

        const statusCell = row.getCell(8);
        if (isOut) statusCell.font = { bold: true, color: { argb: 'DC2626' } };
        else if (isLow) statusCell.font = { bold: true, color: { argb: 'D97706' } };
        else statusCell.font = { bold: true, color: { argb: '16A34A' } };

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } }
          };
        });
      });

      // 5. Grand Summary Row
      const summaryRow = worksheet.addRow({
        id: 'TOTAL / SUMMARY',
        category: '-',
        name: dataToExport.length + ' Products',
        buyingPrice: '-',
        sellingPrice: '-',
        quantity: totalStockUnits + ' total units',
        threshold: '-',
        status: '-',
        totalValuation: '₹' + totalInventoryValuation.toFixed(2)
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
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileScope = isFiltered ? 'Filtered' : 'Overall';
      link.setAttribute('download', 'NEC_Store_Products_' + fileScope + '_' + Date.now() + '.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addToast('Downloaded ' + (isFiltered ? 'filtered products (' + dataToExport.length + ' items)' : 'overall product catalog') + ' successfully!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      addToast('Failed to export product Excel report.', 'error');
    } finally {
      setDownloadingExport(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await getAxios().get('/products/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'NEC_Store_Product_Import_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Sample Excel template downloaded!', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to download Excel template.', 'error');
    }
  };

  // File drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      addToast('Please select a valid Excel (.xlsx, .xls) or CSV file.', 'warning');
      return;
    }
    setSelectedFile(file);
    setImportError(null);
    setImportResult(null);
  };

  // Execute bulk import
  const handleImportSubmit = async () => {
    if (!selectedFile) {
      addToast('Please select an Excel file first.', 'warning');
      return;
    }
    setImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          const res = await getAxios().post('/products/bulk-import', {
            fileBase64: base64Data
          });
          if (res.data.success) {
            setImportResult(res.data);
            addToast(res.data.message || 'Bulk import completed successfully!', 'success');
            fetchProducts();
            fetchCategories();
          }
        } catch (err) {
          console.error(err);
          const errMsg = err.response?.data?.message || 'Bulk import failed. Please verify spreadsheet structure.';
          setImportError(errMsg);
          addToast(errMsg, 'error');
        } finally {
          setImporting(false);
        }
      };
      reader.onerror = () => {
        setImporting(false);
        setImportError('Failed to read file from local disk.');
        addToast('Failed to read file.', 'error');
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setImporting(false);
      setImportError(err.message);
    }
  };

  const resetImportModal = () => {
    setSelectedFile(null);
    setImportResult(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsImportModalOpen(false);
  };

  // Sort toggle handler for table header
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search match
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = (p.name || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchCat = (p.Category?.name || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL') {
          if (String(p.categoryId) !== String(selectedCategory)) return false;
        }

        // Stock status filter
        if (stockFilter === 'HEALTHY') {
          if (p.quantity <= p.lowStockThreshold || p.quantity === 0) return false;
        } else if (stockFilter === 'LOW') {
          if (p.quantity > p.lowStockThreshold || p.quantity === 0) return false;
        } else if (stockFilter === 'OUT') {
          if (p.quantity > 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'category') {
          valA = a.Category?.name || '';
          valB = b.Category?.name || '';
        } else if (sortKey === 'buyingPrice' || sortKey === 'sellingPrice') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        } else if (sortKey === 'quantity' || sortKey === 'lowStockThreshold') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else if (sortKey === 'createdAt') {
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, search, selectedCategory, stockFilter, sortKey, sortDirection]);

  // Adjust page number if out of range
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Paginated product slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('ALL');
    setStockFilter('ALL');
    setSortKey('createdAt');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const isFilterActive = search.trim() !== '' || selectedCategory !== 'ALL' || stockFilter !== 'ALL' || sortKey !== 'createdAt' || sortDirection !== 'desc';

  // Render sort icon helper
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

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <Package size={26} style={{ color: 'var(--primary-blue)' }} />
              <h1 style={{ fontSize: '1.9rem', margin: 0, fontWeight: 800 }}>Product Catalog Management</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              Bulk import via Excel, monitor inventory levels, manage retail pricing, and filter items.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <GlassButton
              variant="secondary"
              icon={FileSpreadsheet}
              onClick={() => setIsImportModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.18))',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                color: '#10b981',
                fontWeight: 700
              }}
            >
              Bulk Import (Excel)
            </GlassButton>

            <Link to="/retailer/products/add" style={{ textDecoration: 'none' }}>
              <GlassButton variant="primary" icon={Plus}>Add New Product</GlassButton>
            </Link>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <GlassCard hover={false} style={{ padding: '20px', marginBottom: '22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search products by title, category, or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ paddingLeft: '42px', width: '100%' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="ALL">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Dropdown */}
            <div>
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="ALL">All Stock Status</option>
                <option value="HEALTHY">In Stock (Healthy)</option>
                <option value="LOW">Low Stock Alert</option>
                <option value="OUT">Out of Stock (0)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortKey + '_' + sortDirection}
                onChange={(e) => {
                  const [key, dir] = e.target.value.split('_');
                  setSortKey(key);
                  setSortDirection(dir);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="sellingPrice_asc">Price: Low to High</option>
                <option value="sellingPrice_desc">Price: High to Low</option>
                <option value="quantity_asc">Stock: Low to High</option>
                <option value="quantity_desc">Stock: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Stats & Clear Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--neu-border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
              <span>Total in Catalog: <strong style={{ color: 'var(--text-main)' }}>{products.length}</strong></span>
              <span>Matched: <strong style={{ color: 'var(--primary-blue)' }}>{filteredProducts.length}</strong></span>
            </div>

            {isFilterActive && (
              <button
                onClick={handleClearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--status-danger)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        </GlassCard>

        {/* Glass Products Table */}
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Product Name {renderSortIndicator('name')}
                  </div>
                </th>
                <th onClick={() => handleSort('category')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Category {renderSortIndicator('category')}
                  </div>
                </th>
                <th onClick={() => handleSort('buyingPrice')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Buying Price {renderSortIndicator('buyingPrice')}
                  </div>
                </th>
                <th onClick={() => handleSort('sellingPrice')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Selling Price {renderSortIndicator('sellingPrice')}
                  </div>
                </th>
                <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Quantity {renderSortIndicator('quantity')}
                  </div>
                </th>
                <th onClick={() => handleSort('lowStockThreshold')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Threshold {renderSortIndicator('lowStockThreshold')}
                  </div>
                </th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <RefreshCw className="spin" size={24} style={{ color: 'var(--primary-blue)', marginBottom: '8px' }} />
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Loading product catalog...</p>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <Package size={36} style={{ color: 'var(--text-subtle)', marginBottom: '12px' }} />
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                      No matching products found
                    </div>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                      Try adjusting your search criteria, clearing filters, or import products using Excel.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isOut = p.quantity === 0;
                  const isLow = p.quantity > 0 && p.quantity <= p.lowStockThreshold;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'}
                            alt={p.name}
                            style={{
                              width: '46px',
                              height: '46px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              border: '1px solid var(--neu-border-subtle)',
                              boxShadow: 'var(--neu-extruded-sm)'
                            }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{p.name}</div>
                            {p.description && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.description}
                              </div>
                            )}
                          </div>
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
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                        ₹{parseFloat(p.buyingPrice || 0).toFixed(2)}
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>
                          ₹{parseFloat(p.sellingPrice).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: isOut ? 'var(--status-danger)' : isLow ? '#f59e0b' : 'var(--text-main)'
                        }}>
                          {p.quantity} units
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.lowStockThreshold} units</td>
                      <td>
                        <StatusBadge status={isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'HEALTHY'} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link to={`/retailer/products/${p.id}/edit`} style={{ textDecoration: 'none' }}>
                            <button
                              title="Edit Product"
                              style={{
                                background: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                color: 'var(--primary-blue)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Edit3 size={15} />
                            </button>
                          </Link>
                          <button
                            title="Delete Product"
                            onClick={() => setDeleteId(p.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: 'var(--status-danger)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <CenteredPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="products"
        />
      </main>

      {/* Bulk Import Modal */}
      <GlassModal
        isOpen={isImportModalOpen}
        onClose={resetImportModal}
        title="Bulk Import Products via Excel"
        maxWidth="620px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Explanation */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <FileSpreadsheet size={24} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
              Import catalog items in bulk using an Excel spreadsheet (.xlsx, .xls) or CSV. Categories will be automatically linked or created.
            </div>
          </div>

          {/* Download Templates Action Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--neu-inset-bg, rgba(255, 255, 255, 0.03))',
              borderRadius: '10px',
              border: '1px dashed var(--neu-border-subtle)',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>📦 Full Product Import Template</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Add new products with prices, stock, supplier, and category.</div>
              </div>
              <GlassButton
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleDownloadTemplate}
                style={{ width: '100%' }}
              >
                Download Full Template (.xlsx)
              </GlassButton>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'rgba(22, 163, 74, 0.05)',
              borderRadius: '10px',
              border: '1px dashed rgba(22, 163, 74, 0.4)',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#16a34a' }}>🖼️ Photo URL Update Sheet (234 Products)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pre-filled with all product names. Simply paste new photo URLs in Column E!</div>
              </div>
              <a
                href="/NEC_Store_Product_Images_Update.xlsx"
                download="NEC_Store_Product_Images_Update.xlsx"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                }}
              >
                <Download size={14} />
                <span>Download Photo Update Sheet (.xlsx)</span>
              </a>
            </div>
          </div>

          {/* Drag & Drop Upload Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed ' + (isDragging ? 'var(--primary-blue)' : selectedFile ? '#10b981' : 'var(--neu-border-subtle)'),
              background: isDragging
                ? 'rgba(56, 189, 248, 0.08)'
                : selectedFile
                ? 'rgba(16, 185, 129, 0.05)'
                : 'transparent',
              borderRadius: '14px',
              padding: '28px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
            />
            {selectedFile ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={36} style={{ color: '#10b981' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB — Click or drag another file to replace
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Upload size={36} style={{ color: isDragging ? 'var(--primary-blue)' : 'var(--text-subtle)' }} />
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Click to select or drag and drop your Excel file here
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Supported formats: .xlsx, .xls, .csv
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {importError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              color: 'var(--status-danger)',
              fontSize: '0.88rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{importError}</div>
            </div>
          )}

          {/* Success Result Summary */}
          {importResult && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, marginBottom: '8px' }}>
                <CheckCircle2 size={18} />
                <span>{importResult.message}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '8px' }}>
                <span>Processed: <strong>{importResult.summary?.totalRows || 0}</strong></span>
                <span>Added: <strong style={{ color: '#10b981' }}>{importResult.summary?.createdCount || 0}</strong></span>
                <span>Updated: <strong style={{ color: 'var(--primary-blue)' }}>{importResult.summary?.updatedCount || 0}</strong></span>
                {importResult.summary?.failedCount > 0 && (
                  <span>Failed: <strong style={{ color: 'var(--status-danger)' }}>{importResult.summary?.failedCount}</strong></span>
                )}
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <GlassButton variant="secondary" onClick={resetImportModal} disabled={importing}>
              {importResult ? 'Close' : 'Cancel'}
            </GlassButton>
            <GlassButton
              variant="primary"
              icon={importing ? RefreshCw : Upload}
              onClick={handleImportSubmit}
              disabled={!selectedFile || importing}
            >
              {importing ? 'Processing File...' : 'Upload & Import Products'}
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product Confirmation"
        message="Are you sure you want to delete this product from store records? This action cannot be undone."
      />
    </div>
  );
};

export default ProductListPage;
