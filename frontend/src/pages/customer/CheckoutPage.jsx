import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, CheckCircle2, ArrowLeft, Store } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const CheckoutPage = () => {
  const { user, getAxios, isAuthenticated } = useAuthStore();
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const subtotal = getTotalPrice();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (cart.length === 0) {
    navigate('/customer/products');
    return null;
  }

  const handleDemoCheckout = async () => {
    setProcessing(true);
    try {
      const orderPayload = {
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: 'STORE_EXPRESS_DEMO',
        razorpayOrderId: `ord_demo_${Date.now()}`,
        razorpayPaymentId: `pay_demo_${Date.now()}`
      };

      // Server validates real product stock and prices inside DB transaction
      const res = await getAxios().post('/orders', orderPayload);

      if (res.data.success) {
        clearCart();
        addToast('Payment verified & Store Order placed successfully!', 'success');
        navigate(`/customer/orders/${res.data.order.id}`);
      } else {
        addToast(res.data.message || 'Order creation failed.', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error creating order.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container">
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Store Checkout</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
          Confirm your student details and complete instant campus store order payment.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(320px, 400px)', gap: '32px' }}>
          {/* Customer Details & Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <GlassCard hover={false} style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--primary-blue)" /> Customer Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Name</div>
                  <div style={{ fontWeight: 700 }}>{user?.name}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Email</div>
                  <div style={{ fontWeight: 700 }}>{user?.email}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Roll Number</div>
                  <div style={{ fontWeight: 700 }}>{user?.rollNumber || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Department</div>
                  <div style={{ fontWeight: 700 }}>{user?.department || 'N/A'}</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard hover={false} style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Ordered Items ({cart.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cart.map((item) => (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity} × ₹{item.price.toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Payment Card */}
          <GlassCard hover={false} style={{ padding: '28px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Payment Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Campus Delivery</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>₹0.00 (FREE)</span>
              </div>
              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--glass-border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 800 }}>
                <span>Total Payable</span>
                <span style={{ color: 'var(--primary-blue)' }}>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--primary-cyan)" style={{ flexShrink: 0 }} />
              <div>Prices and stock availability are verified on backend server against official database records.</div>
            </div>

            <GlassButton
              variant="primary"
              size="lg"
              disabled={processing}
              icon={CheckCircle2}
              onClick={handleDemoCheckout}
              style={{ width: '100%' }}
            >
              {processing ? 'Processing Payment...' : `Confirm & Pay ₹${subtotal.toFixed(2)} (Instant Demo)`}
            </GlassButton>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
