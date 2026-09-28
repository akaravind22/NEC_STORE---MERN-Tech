import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Clock, Calendar, Search, X, Filter } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import CenteredPagination from '../../components/common/CenteredPagination';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuthStore } from '../../store/useAuthStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter & Sort States
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { getAxios } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
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
    fetchOrders();
  }, []);

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchId = ('#' + o.id).includes(q) || String(o.id).includes(q);
          const matchDate = new Date(o.createdAt).toLocaleDateString().toLowerCase().includes(q);
          const matchItem = (o.items || []).some((item) => (item.Product?.name || '').toLowerCase().includes(q));
          if (!matchId && !matchDate && !matchItem) return false;
        }

        // Order status
        if (orderStatusFilter !== 'ALL' && o.orderStatus !== orderStatusFilter) {
          return false;
        }

        // Payment status
        if (paymentStatusFilter !== 'ALL' && o.paymentStatus !== paymentStatusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'totalAmount') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        } else if (sortKey === 'createdAt') {
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        } else if (sortKey === 'id') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [orders, search, orderStatusFilter, paymentStatusFilter, sortKey, sortDirection]);

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
    setOrderStatusFilter('ALL');
    setPaymentStatusFilter('ALL');
    setSortKey('createdAt');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const isFilterActive =
    search.trim() !== '' ||
    orderStatusFilter !== 'ALL' ||
    paymentStatusFilter !== 'ALL' ||
    sortKey !== 'createdAt' ||
    sortDirection !== 'desc';

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container" style={{ minHeight: '80vh' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', fontWeight: 800 }}>My Orders</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Track the progress and history of your store purchases.
        </p>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            message="You haven't placed any store orders yet."
            actionText="Start Shopping"
            onAction={() => (window.location.href = '/customer/products')}
          />
        ) : (
          <>
            {/* Filter and Search Bar */}
            <GlassCard hover={false} style={{ padding: '18px 20px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
                {/* Search Input */}
                <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    placeholder="Search orders by Order #, product name, or date..."
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

                {/* Order Status Filter */}
                <div>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => {
                      setOrderStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="glass-input"
                    style={{ width: '100%', cursor: 'pointer' }}
                  >
                    <option value="ALL">All Order Statuses</option>
                    <option value="CREATED">CREATED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
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
                  </select>
                </div>
              </div>

              {/* Quick Filter Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--neu-border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Total Orders: <strong style={{ color: 'var(--text-main)' }}>{orders.length}</strong> | Matched: <strong style={{ color: 'var(--primary-blue)' }}>{filteredOrders.length}</strong>
                </div>

                {isFilterActive && (
                  <button
                    onClick={handleClearFilters}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--status-danger)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} /> Clear filters
                  </button>
                )}
              </div>
            </GlassCard>

            {/* Orders Cards List */}
            {paginatedOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No orders match your search criteria.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {paginatedOrders.map((order) => (
                  <GlassCard key={order.id} hover={true} style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Order #{order.id}</span>
                          <StatusBadge status={order.orderStatus} />
                          <StatusBadge status={order.paymentStatus} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span>{order.items?.length || 0} item(s)</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                            ₹{parseFloat(order.totalAmount).toFixed(2)}
                          </div>
                        </div>

                        <Link
                          to={`/customer/orders/${order.id}`}
                          className="glass-btn btn-secondary btn-sm"
                          style={{ borderRadius: '9999px', textDecoration: 'none' }}
                        >
                          View Details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Centered Pagination */}
            <CenteredPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemLabel="orders"
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrdersPage;
