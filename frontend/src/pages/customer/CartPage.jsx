import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import EmptyState from '../../components/common/EmptyState';
import { useCartStore } from '../../store/useCartStore';
import { useStoreTimingStore } from '../../store/useStoreTimingStore';
import { Coffee, AlertCircle } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const CartPage = () => {
  const { liveStatus } = useStoreTimingStore();
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const delivery = 0; // College store delivery ₹0
  const grandTotal = subtotal + delivery;

  if (cart.length === 0) {
    return (
      <div className="page-fade-enter">
        <Navbar />
        <main className="app-container" style={{ padding: '60px 16px' }}>
          <EmptyState
            icon={ShoppingBag}
            title="Your Shopping Cart is Empty"
            message="Start shopping and add notebooks, lab gear, textbooks, or electronics to your cart."
            actionText="Explore Campus Products"
            onAction={() => navigate('/customer/products')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '4px' }}>Shopping Cart</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Review your selected items before proceeding to payment.</p>
          </div>
          <button
            onClick={clearCart}
            style={{ background: 'none', border: 'none', color: 'var(--status-danger)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Trash2 size={16} /> Clear Cart
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 360px)', gap: '32px', alignItems: 'start' }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map((item) => (
              <GlassCard key={item.productId} hover={false} style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '16px' }}
                  />

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Unit Price: ₹{item.price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                      Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Modifier */}
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '9999px', padding: '2px 6px' }}>
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      style={{ background: 'none', border: 'none', width: '28px', height: '28px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '0 12px', fontWeight: 800, fontSize: '0.95rem' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      style={{ background: 'none', border: 'none', width: '28px', height: '28px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-danger)', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Cart Summary Card */}
          <GlassCard hover={false} style={{ padding: '28px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border-subtle)' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Campus Pickup / Delivery</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>₹0.00 (FREE)</span>
              </div>
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--glass-border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--primary-blue)' }}>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <GlassButton
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/customer/checkout')}
              style={{ width: '100%' }}
            >
              Proceed to Checkout
            </GlassButton>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
