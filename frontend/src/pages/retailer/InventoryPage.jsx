import React, { useState, useEffect, useMemo } from 'react';
import { Layers, PlusCircle, AlertTriangle, CheckCircle2, History, Search, X, ArrowUpDown, ChevronUp, ChevronDown, Package, TrendingDown } from 'lucide-react';
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedQty, setAddedQty] = useState('');
  const [newBuyingPrice, setNewBuyingPrice] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');
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
        newBuyingPrice: parseFloat(newBuyingPrice) || selectedProduct.buyingPrice,
        newSellingPrice: parseFloat(newSellingPrice) || selectedProduct.sellingPrice
      });

      if (res.data.success) {
        addToast(`Added ${addedQty} units to ${selectedProduct.name} successfully!`, 'success');
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update stock.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Header Sort Toggle
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

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = (p.name || '').toLowerCase().includes(q);
          const matchCat = (p.Category?.name || '').toLowerCase().includes(q);
          if (!matchName && !matchCat) return false;
        }

        // Category
        if (categoryFilter !== 'ALL') {
          if (String(p.categoryId) !== String(categoryFilter)) return false;
        }

        // Stock status
        if (stockStatusFilter === 'HEALTHY') {
          if (p.quantity <= p.lowStockThreshold || p.quantity === 0) return false;
        } else if (stockStatusFilter === 'LOW') {
          if (p.quantity > p.lowStockThreshold || p.quantity === 0) return false;
        } else if (stockStatusFilter === 'OUT') {
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
        } else if (sortKey === 'quantity' || sortKey === 'lowStockThreshold') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else if (sortKey === 'buyingPrice' || sortKey === 'sellingPrice') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, search, stockStatusFilter, categoryFilter, sortKey, sortDirection]);

  // Adjust page number if out of range
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleClearFilters = () => {
    setSearch('');
    setStockStatusFilter('ALL');
    setCategoryFilter('ALL');
    setSortKey('quantity');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const isFilterActive =
    search.trim() !== '' ||
    stockStatusFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    sortKey !== 'quantity' ||
    sortDirection !== 'asc';

  const lowStockCount = products.filter((p) => p.quantity <= p.lowStockThreshold && p.quantity > 0).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px', fontWeight: 800 }}>Inventory Stock & Restocking</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Monitor real-time inventory counts, replenish stock, and manage low stock thresholds.
          </p>
        </div>

        {/* Filter and Control Bar */}
        <GlassCard hover={false} style={{ padding: '20px', marginBottom: '22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search inventory by product name or category..."
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

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
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

            {/* Stock Status Filter */}
            <div>
              <select
                value={stockStatusFilter}
                onChange={(e) => {
                  setStockStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="HEALTHY">In Stock (Healthy)</option>
                <option value="LOW">Low Stock Alert ({lowStockCount})</option>
                <option value="OUT">Out of Stock ({outOfStockCount})</option>
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
                <option value="quantity_asc">Stock: Lowest First</option>
                <option value="quantity_desc">Stock: Highest First</option>
                <option value="name_asc">Product Name: A - Z</option>
                <option value="name_desc">Product Name: Z - A</option>
                <option value="lowStockThreshold_desc">Threshold: High to Low</option>
                <option value="sellingPrice_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Stats & Clear Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--neu-border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span>Total Catalog: <strong style={{ color: 'var(--text-main)' }}>{products.length}</strong></span>
              <span>Matched: <strong style={{ color: 'var(--primary-blue)' }}>{filteredProducts.length}</strong></span>
              {lowStockCount > 0 && (
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                  Low Stock Items: <strong>{lowStockCount}</strong>
                </span>
              )}
              {outOfStockCount > 0 && (
                <span style={{ color: 'var(--status-danger)', fontWeight: 600 }}>
                  Out of Stock: <strong>{outOfStockCount}</strong>
                </span>
              )}
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

        {/* Inventory Table */}
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
                <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Current Stock {renderSortIndicator('quantity')}
                  </div>
                </th>
                <th onClick={() => handleSort('lowStockThreshold')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Threshold {renderSortIndicator('lowStockThreshold')}
                  </div>
                </th>
                <th onClick={() => handleSort('buyingPrice')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Cost Price {renderSortIndicator('buyingPrice')}
                  </div>
                </th>
                <th onClick={() => handleSort('sellingPrice')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Retail Price {renderSortIndicator('sellingPrice')}
                  </div>
                </th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading inventory data...
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No products match your inventory filter criteria.
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
                      <td>₹{parseFloat(p.buyingPrice || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>₹{parseFloat(p.sellingPrice).toFixed(2)}</td>
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

            {/* WAC Preview — shows calculated weighted average cost in real-time */}
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
