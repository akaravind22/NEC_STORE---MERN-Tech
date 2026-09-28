import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Search, X, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import CenteredPagination from '../../components/common/CenteredPagination';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';

const TransactionsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter & Sort States
  const [search, setSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { getAxios } = useAuthStore();

  useEffect(() => {
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
    fetchTransactions();
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

  // Filtered and Sorted Transactions
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const txnRef = ('#txn-' + (o.id * 1024)).toLowerCase();
          const matchTxn = txnRef.includes(q);
          const matchOrder = ('#' + o.id).includes(q) || String(o.id).includes(q);
          const matchCustomer = (o.User?.name || '').toLowerCase().includes(q);
          const matchEmail = (o.User?.email || '').toLowerCase().includes(q);
          const matchRazorpay = (o.razorpayPaymentId || '').toLowerCase().includes(q);
          if (!matchTxn && !matchOrder && !matchCustomer && !matchEmail && !matchRazorpay) return false;
        }

        // Payment status filter
        if (paymentStatusFilter !== 'ALL' && o.paymentStatus !== paymentStatusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'customer') {
          valA = a.User?.name || '';
          valB = b.User?.name || '';
        } else if (sortKey === 'totalAmount') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
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
  }, [orders, search, paymentStatusFilter, sortKey, sortDirection]);

  // Adjust page number if out of range
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleClearFilters = () => {
    setSearch('');
    setPaymentStatusFilter('ALL');
    setSortKey('createdAt');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const isFilterActive =
    search.trim() !== '' ||
    paymentStatusFilter !== 'ALL' ||
    sortKey !== 'createdAt' ||
    sortDirection !== 'desc';

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px', fontWeight: 800 }}>Transaction History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Payment transaction verification records and Razorpay Gateway signatures.
          </p>
        </div>

        {/* Filter and Control Bar */}
        <GlassCard hover={false} style={{ padding: '20px', marginBottom: '22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search transactions by Txn ID, Order #, customer, or Razorpay ID..."
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

            {/* Payment Status Filter */}
            <div>
              <select
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">PAID</option>
                <option value="UNPAID">UNPAID</option>
                <option value="FAILED">FAILED</option>
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
                <option value="createdAt_desc">Date: Newest First</option>
                <option value="createdAt_asc">Date: Oldest First</option>
                <option value="totalAmount_desc">Amount: High to Low</option>
                <option value="totalAmount_asc">Amount: Low to High</option>
                <option value="customer_asc">Customer: A - Z</option>
              </select>
            </div>
          </div>

          {/* Quick Stats & Clear Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--neu-border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
              <span>Total Transactions: <strong style={{ color: 'var(--text-main)' }}>{orders.length}</strong></span>
              <span>Matched: <strong style={{ color: 'var(--primary-blue)' }}>{filteredOrders.length}</strong></span>
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

        {/* Transactions Table */}
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Txn Ref ID</th>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Order ID {renderSortIndicator('id')}
                  </div>
                </th>
                <th onClick={() => handleSort('customer')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Customer {renderSortIndicator('customer')}
                  </div>
                </th>
                <th onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Amount {renderSortIndicator('totalAmount')}
                  </div>
                </th>
                <th>Method</th>
                <th>Razorpay Payment ID</th>
                <th>Payment Status</th>
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
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading transaction records...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No payment transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#TXN-{o.id * 1024}</td>
                    <td style={{ fontWeight: 800 }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{o.User?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.User?.email}</div>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '1rem' }}>
                      ₹{parseFloat(o.totalAmount).toFixed(2)}
                    </td>
                    <td><span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>RAZORPAY</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--primary-purple)' }}>
                      {o.razorpayPaymentId || 'pay_demo_verified'}
                    </td>
                    <td><StatusBadge status={o.paymentStatus} /></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString()}</td>
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
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="transactions"
        />
      </main>
    </div>
  );
};

export default TransactionsPage;
