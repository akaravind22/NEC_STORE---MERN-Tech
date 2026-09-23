import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, CheckCircle2, Clock, Truck } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import GlassModal from '../../components/common/GlassModal';
import GlassButton from '../../components/common/GlassButton';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(false);
  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchOrders = async () => {
    try {
      let query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await getAxios().get(`/orders${query}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

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

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Customer Orders Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Review incoming orders, process store dispatch, and update delivery status.</p>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input"
            style={{ width: '200px', cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            <option value="CREATED">CREATED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Department</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Delivery Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No customer orders found.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 800 }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{o.User?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.User?.email}</div>
                    </td>
                    <td>{o.User?.department || 'N/A'}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>₹{parseFloat(o.totalAmount).toFixed(2)}</td>
                    <td><StatusBadge status={o.paymentStatus} /></td>
                    <td><StatusBadge status={o.orderStatus} /></td>
                    <td><StatusBadge status={o.deliveryStatus} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        style={{ background: 'rgba(56, 189, 248, 0.15)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
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
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <div style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '1.1rem' }}>₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</div>
              </div>
            </div>

            {/* Item Breakdown */}
            <div style={{ borderTop: '1px solid var(--glass-border-subtle)', borderBottom: '1px solid var(--glass-border-subtle)', padding: '12px 0' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Purchased Items:</div>
              {selectedOrder.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>{item.Product?.name || 'Product'} (x{item.quantity})</span>
                  <span>₹{parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Quick Status Modifiers */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Update Order Status:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
