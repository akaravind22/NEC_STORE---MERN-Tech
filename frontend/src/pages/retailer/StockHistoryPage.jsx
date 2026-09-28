import React, { useState, useEffect, useMemo } from 'react';
import { History, Search, X, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import CenteredPagination from '../../components/common/CenteredPagination';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';

const StockHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Sort States
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { getAxios } = useAuthStore();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getAxios().get('/stock/history');
        if (res.data.success) {
          setHistory(res.data.history || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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

  // Filtered and Sorted History
  const filteredHistory = useMemo(() => {
    return history
      .filter((h) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchLogId = ('#' + h.id).includes(q) || String(h.id).includes(q);
          const matchProd = (h.Product?.name || '').toLowerCase().includes(q);
          const matchRetailer = (h.retailer?.name || '').toLowerCase().includes(q);
          if (!matchLogId && !matchProd && !matchRetailer) return false;
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
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        } else if (sortKey === 'id') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [history, search, sortKey, sortDirection]);

  // Adjust page number if out of range
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  const handleClearFilters = () => {
    setSearch('');
    setSortKey('createdAt');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const isFilterActive = search.trim() !== '' || sortKey !== 'createdAt' || sortDirection !== 'desc';

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px', fontWeight: 800 }}>Incoming Stock Audit Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Historical record of every inventory batch added, unit prices, and weighted average calculations.
          </p>
        </div>

        {/* Filter and Control Bar */}
        <GlassCard hover={false} style={{ padding: '20px', marginBottom: '22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search audit trail by product name, retailer, or Log ID..."
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
                <option value="createdAt_desc">Date: Newest First</option>
                <option value="createdAt_asc">Date: Oldest First</option>
                <option value="addedQuantity_desc">Added Qty: High to Low</option>
                <option value="addedQuantity_asc">Added Qty: Low to High</option>
                <option value="product_asc">Product Name: A - Z</option>
              </select>
            </div>
          </div>

          {/* Quick Stats & Clear Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--neu-border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
              <span>Total Audit Records: <strong style={{ color: 'var(--text-main)' }}>{history.length}</strong></span>
              <span>Matched: <strong style={{ color: 'var(--primary-blue)' }}>{filteredHistory.length}</strong></span>
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

        {/* Audit Table */}
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Log ID {renderSortIndicator('id')}
                  </div>
                </th>
                <th onClick={() => handleSort('product')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Product {renderSortIndicator('product')}
                  </div>
                </th>
                <th onClick={() => handleSort('retailer')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Retailer {renderSortIndicator('retailer')}
                  </div>
                </th>
                <th>Prev Qty</th>
                <th onClick={() => handleSort('addedQuantity')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Added Qty {renderSortIndicator('addedQuantity')}
                  </div>
                </th>
                <th>New Qty</th>
                <th>Prev Price</th>
                <th>New Price</th>
                <th>Weighted Avg Price</th>
                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Date & Time {renderSortIndicator('createdAt')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading stock audit trail...
                  </td>
                </tr>
              ) : paginatedHistory.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No stock audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 800 }}>#{h.id}</td>
                    <td style={{ fontWeight: 700 }}>{h.Product?.name || 'N/A'}</td>
                    <td>{h.retailer?.name || 'Retailer'}</td>
                    <td>{h.previousQuantity}</td>
                    <td style={{ color: '#10b981', fontWeight: 800 }}>+{h.addedQuantity}</td>
                    <td style={{ fontWeight: 800 }}>{h.newQuantity}</td>
                    <td>₹{parseFloat(h.previousBuyingPrice || 0).toFixed(2)}</td>
                    <td>₹{parseFloat(h.newBuyingPrice || 0).toFixed(2)}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-purple)' }}>
                      ₹{parseFloat(h.averageBuyingPrice || 0).toFixed(2)}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(h.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Centered Pagination */}
        <CenteredPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredHistory.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="records"
        />
      </main>
    </div>
  );
};

export default StockHistoryPage;
