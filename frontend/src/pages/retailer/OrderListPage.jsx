import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Eye, CheckCircle2, Clock, Truck, Search, X, ArrowUpDown, ChevronUp, ChevronDown, Filter, Calendar } from 'lucide-react';
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Search & Filter & Sort States
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Date filter — single day
  const [selectedDate, setSelectedDate] = useState('');

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

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchId = String(o.id).includes(q) || ('#' + o.id).toLowerCase().includes(q);
          const matchCustomer = (o.User?.name || '').toLowerCase().includes(q);
          const matchEmail = (o.User?.email || '').toLowerCase().includes(q);
          const matchDept = (o.User?.department || '').toLowerCase().includes(q);
          if (!matchId && !matchCustomer && !matchEmail && !matchDept) return false;
        }

        // Order status filter
        if (orderStatusFilter !== 'ALL' && o.orderStatus !== orderStatusFilter) {
          return false;
        }

        // Payment status filter
        if (paymentStatusFilter !== 'ALL' && o.paymentStatus !== paymentStatusFilter) {
          return false;
        }

        // Delivery status filter
        if (deliveryStatusFilter !== 'ALL' && o.deliveryStatus !== deliveryStatusFilter) {
          return false;
        }

        // Single date filter
        if (selectedDate) {
          const orderDateStr = new Date(o.createdAt).toLocaleDateString('en-CA');
          if (orderDateStr !== selectedDate) return false;
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
  }, [orders, search, orderStatusFilter, paymentStatusFilter, deliveryStatusFilter, selectedDate, sortKey, sortDirection]);

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
    setDeliveryStatusFilter('ALL');
    setSelectedDate('');
    setSortKey('createdAt');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const isFilterActive =
    search.trim() !== '' ||
    orderStatusFilter !== 'ALL' ||
    paymentStatusFilter !== 'ALL' ||
    deliveryStatusFilter !== 'ALL' ||
    selectedDate !== '' ||
    sortKey !== 'createdAt' ||
    sortDirection !== 'desc';

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px', fontWeight: 800 }}>Customer Orders Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Review incoming orders, process store dispatch, update delivery statuses, and filter transactions.
          </p>
        </div>

        {/* Filter and Control Bar */}
        <GlassCard hover={false} style={{ padding: '20px', marginBottom: '22px' }}>
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '10px', alignItems: 'center', overflowX: 'auto' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '2 1 200px', minWidth: '160px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search by Order #, student name, email, department..."
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
            <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
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
            <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
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

            {/* Delivery Status Filter */}
            <div style={{ flex: '1 1 130px', minWidth: '120px' }}>
              <select
                value={deliveryStatusFilter}
                onChange={(e) => {
                  setDeliveryStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="ALL">All Delivery Statuses</option>
                <option value="NOT_DELIVERED">NOT DELIVERED</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>

            {/* Date Picker — filter by exact day */}
            <div style={{ position: 'relative', flex: '1 1 140px', minWidth: '130px' }}>
              <Calendar size={16} style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: selectedDate ? 'var(--primary-blue)' : 'var(--text-subtle)', pointerEvents: 'none', zIndex: 1
              }} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                className="glass-input"
                title="Filter by exact date"
                style={{
                  paddingLeft: '36px',
                  width: '100%',
                  cursor: 'pointer',
                  color: selectedDate ? 'var(--text-main)' : 'var(--text-muted)',
                  borderColor: selectedDate ? 'var(--primary-blue)' : undefined,
                  boxSizing: 'border-box'
                }}
              />
              {selectedDate && (
                <button
                  onClick={() => { setSelectedDate(''); setCurrentPage(1); }}
                  title="Clear date"
                  style={{
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', zIndex: 2
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Dropdown — amount & name only */}
            <div style={{ flex: '1 1 130px', minWidth: '120px' }}>
              <select
                value={sortKey + '_' + sortDirection}
                onChange={(e) => {
                  const parts = e.target.value.split('_');
                  const dir = parts.pop();
                  const key = parts.join('_');
                  setSortKey(key);
                  setSortDirection(dir);
                  setCurrentPage(1);
                }}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="createdAt_desc">Sort: Default</option>
                <option value="totalAmount_desc">Amount: High to Low</option>
                <option value="totalAmount_asc">Amount: Low to High</option>
                <option value="customer_asc">Customer: A - Z</option>
                <option value="customer_desc">Customer: Z - A</option>
              </select>
            </div>
          </div>

          {/* Quick Stats & Clear Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--neu-border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
              <span>Total Orders: <strong style={{ color: 'var(--text-main)' }}>{orders.length}</strong></span>
              <span>Matched: <strong style={{ color: 'var(--primary-blue)' }}>{filteredOrders.length}</strong></span>
              {selectedDate && (
                <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                  📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
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

        {/* Orders Table */}
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
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
                <th>Department</th>
                <th onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Amount {renderSortIndicator('totalAmount')}
                  </div>
                </th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Delivery Status</th>
                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Date {renderSortIndicator('createdAt')}
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {selectedDate
                        ? `No orders found on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                        : 'No customer orders match your criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 800 }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{o.User?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.User?.email}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {o.User?.department || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '1rem' }}>
                      ₹{parseFloat(o.totalAmount).toFixed(2)}
                    </td>
                    <td><StatusBadge status={o.paymentStatus} /></td>
                    <td><StatusBadge status={o.orderStatus} /></td>
                    <td><StatusBadge status={o.deliveryStatus} /></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          color: 'var(--primary-blue)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Eye size={14} /> Manage
                      </button>
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
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="orders"
        />
      </main>

      {/* Order Management Glass Modal */}
      <GlassModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Manage Order #${selectedOrder?.id}`}
        maxWidth="600px"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Customer Name:</span>
                <div style={{ fontWeight: 700 }}>{selectedOrder.User?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedOrder.User?.email}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <div style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '1.2rem' }}>
                  ₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Item Breakdown */}
            <div style={{ borderTop: '1px solid var(--neu-border-subtle)', borderBottom: '1px solid var(--neu-border-subtle)', padding: '14px 0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                Purchased Items ({selectedOrder.items?.length || 0}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                    <span>
                      <strong style={{ color: 'var(--text-main)' }}>{item.Product?.name || 'Product'}</strong>{' '}
                      <span style={{ color: 'var(--text-muted)' }}>(x{item.quantity})</span>
                    </span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>₹{parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Status Modifiers */}
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                Update Order Status:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <GlassButton
                  variant={selectedOrder.orderStatus === 'PROCESSING' ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={updating || selectedOrder.orderStatus === 'CANCELLED'}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING', selectedOrder.deliveryStatus)}
                >
                  Mark PROCESSING
                </GlassButton>

                <GlassButton
                  variant={selectedOrder.orderStatus === 'COMPLETED' ? 'accent' : 'secondary'}
                  size="sm"
                  disabled={updating || selectedOrder.orderStatus === 'CANCELLED'}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED', 'DELIVERED')}
                >
                  Mark COMPLETED & DELIVERED
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export default OrderListPage;
