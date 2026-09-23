import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Truck, Ban, AlertTriangle } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchOrder = async () => {
    try {
      const res = await getAxios().get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await getAxios().post(`/orders/${id}/cancel`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchOrder();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="page-fade-enter">
        <Navbar />
        <main className="app-container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '24px' }}></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-fade-enter">
        <Navbar />
        <main className="app-container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <h2>Order Not Found</h2>
          <Link to="/customer/orders" style={{ textDecoration: 'none', marginTop: '16px', display: 'inline-block' }}>
            <GlassButton variant="primary">Back to Orders</GlassButton>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Progress steps logic
  const steps = ['CREATED', 'PROCESSING', 'COMPLETED', 'DELIVERED'];
  const currentStepIndex = order.orderStatus === 'CANCELLED'
    ? -1
    : order.deliveryStatus === 'DELIVERED'
    ? 3
    : steps.indexOf(order.orderStatus);

  const isEligibleForCancel = ['CREATED', 'PROCESSING'].includes(order.orderStatus);

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container">
        <Link to="/customer/orders" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to My Orders
        </Link>

        {/* Order Header Card */}
        <GlassCard hover={false} style={{ padding: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>
                Order #{order.id}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <StatusBadge status={order.orderStatus} />
              <StatusBadge status={order.paymentStatus} />
              {isEligibleForCancel && (
                <GlassButton
                  variant="danger"
                  size="sm"
                  icon={Ban}
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel Order
                </GlassButton>
              )}
            </div>
          </div>

          {/* Visual Progress Steps Tracker */}
          {order.orderStatus !== 'CANCELLED' ? (
            <div style={{ margin: '32px 0 20px 0', padding: '20px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '20px', border: '1px solid var(--glass-border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  return (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isDone ? 'var(--gradient-primary)' : 'var(--glass-bg)',
                          border: isDone ? 'none' : '2px solid var(--glass-border)',
                          color: isDone ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          boxShadow: isDone ? '0 8px 16px rgba(37, 99, 235, 0.4)' : 'none'
                        }}
                      >
                        {isDone ? <CheckCircle2 size={20} /> : idx + 1}
                      </div>
                      <span style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 700, color: isDone ? 'var(--primary-blue)' : 'var(--text-muted)' }}>
                        {step.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--status-danger)', fontSize: '0.95rem', fontWeight: 700, margin: '20px 0' }}>
              ⚠️ This order has been cancelled. Any deducted product stock has been restored to store inventory.
            </div>
          )}
        </GlassCard>

        {/* Order Details & Items Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 360px)', gap: '32px' }}>
          <GlassCard hover={false} style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Items Purchased</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border-subtle)' }}>
                  <img
                    src={item.Product?.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'}
                    alt={item.Product?.name}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '14px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.Product?.name || 'Item'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ₹{parseFloat(item.unitPrice).toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '1.05rem' }}>
                    ₹{parseFloat(item.subtotal).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Payment Snapshot */}
          <GlassCard hover={false} style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Order Snapshot</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: 700 }}>Store Express Demo Verified</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Ref ID</span>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--primary-blue)' }}>{order.razorpayPaymentId || 'pay_demo_verified'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Status</span>
                <StatusBadge status={order.deliveryStatus} />
              </div>
              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--glass-border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800 }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary-blue)' }}>₹{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order Confirmation"
        message="Are you sure you want to cancel this order? Stock will be immediately restored to store inventory."
        confirmText={cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
      />

      <Footer />
    </div>
  );
};

export default OrderDetailsPage;
