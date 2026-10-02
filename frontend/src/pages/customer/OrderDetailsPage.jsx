import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Truck, Ban, AlertTriangle, Download, FileText } from 'lucide-react';
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

  // ── Generate & Download Invoice as HTML print ──
  const handleDownloadInvoice = () => {
    if (!order) return;

    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const invoiceTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const itemRows = (order.items || []).map(item => `
      <tr>
        <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb;">${item.Product?.name || 'Product'}</td>
        <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; text-align:center;">${item.quantity}</td>
        <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; text-align:right;">₹${parseFloat(item.unitPrice).toFixed(2)}</td>
        <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:700;">₹${parseFloat(item.subtotal).toFixed(2)}</td>
      </tr>
    `).join('');

    const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice #${order.id} — NEC Store</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #2563eb; }
    .brand { font-size: 28px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; }
    .brand span { color: #7c3aed; }
    .brand-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 22px; font-weight: 800; color: #1f2937; }
    .invoice-title p { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .badges { display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .badge-paid { background: #d1fae5; color: #065f46; }
    .badge-order { background: #dbeafe; color: #1e40af; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
    .info-box h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 10px; }
    .info-box p { font-size: 14px; color: #1f2937; margin-bottom: 5px; line-height: 1.6; }
    .info-box strong { font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #2563eb; color: #fff; }
    thead th { padding: 12px 8px; font-size: 13px; font-weight: 700; text-align: left; }
    thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
    .totals-final { display: flex; justify-content: space-between; padding: 14px 0; font-size: 20px; font-weight: 900; color: #2563eb; border-top: 3px solid #2563eb; margin-top: 8px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; }
    .watermark { text-align: center; font-size: 11px; color: #d1d5db; margin-top: 32px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">NEC <span>STORE</span></div>
      <div class="brand-sub">National Engineering College, Kovilpatti</div>
      <div class="brand-sub">support@nec.edu.in &nbsp;|&nbsp; +91 1234567890</div>
    </div>
    <div class="invoice-title">
      <h2>TAX INVOICE</h2>
      <p>Invoice #INV-${String(order.id).padStart(5, '0')}</p>
      <p>Date: ${invoiceDate} &nbsp;${invoiceTime}</p>
      <div class="badges">
        <span class="badge badge-paid">${order.paymentStatus}</span>
        <span class="badge badge-order">Order #${order.id}</span>
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h4>Billed To (Student)</h4>
      <p><strong>${order.User?.name || 'Student'}</strong></p>
      <p>${order.User?.email || ''}</p>
      <p>${order.User?.department || ''}</p>
      <p>National Engineering College</p>
    </div>
    <div class="info-box">
      <h4>Payment Details</h4>
      <p><strong>Payment Method:</strong> Razorpay Gateway</p>
      <p><strong>Payment Ref ID:</strong> ${order.razorpayPaymentId || 'pay_demo_verified'}</p>
      <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
      <p><strong>Order Status:</strong> ${order.orderStatus}</p>
      <p><strong>Delivery Status:</strong> ${order.deliveryStatus}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item / Product</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>₹${parseFloat(order.totalAmount).toFixed(2)}</span>
    </div>
    <div class="totals-row">
      <span>Delivery</span>
      <span style="color:#10b981; font-weight:700;">FREE</span>
    </div>
    <div class="totals-row">
      <span>Tax (GST)</span>
      <span>Included</span>
    </div>
    <div class="totals-final">
      <span>TOTAL PAID</span>
      <span>₹${parseFloat(order.totalAmount).toFixed(2)}</span>
    </div>
  </div>

  <div class="footer">
    <span>NEC Store — Campus Co-op Store, National Engineering College</span>
    <span>Generated on ${new Date().toLocaleString('en-IN')}</span>
  </div>
  <div class="watermark">This is a computer-generated invoice and does not require a physical signature.</div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) win.focus();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
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
              {order.paymentStatus === 'PAID' && (
                <GlassButton
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={handleDownloadInvoice}
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)' }}
                >
                  Download Invoice
                </GlassButton>
              )}
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

            {order.paymentStatus === 'PAID' && (
              <button
                onClick={handleDownloadInvoice}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <FileText size={18} /> Download Invoice (PDF)
              </button>
            )}
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
