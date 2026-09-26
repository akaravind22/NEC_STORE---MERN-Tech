import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import StatusBadge from '../../components/common/StatusBadge';
import { useCartStore } from '../../store/useCartStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    const res = addToCart(product, qty);
    if (res === false) {
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="page-fade-enter">
        <Navbar />
        <main className="app-container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="skeleton" style={{ height: '400px', maxWidth: '800px', margin: '0 auto', borderRadius: '24px' }}></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-fade-enter">
        <Navbar />
        <main className="app-container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>Product Not Found</h2>
          <Link to="/products" style={{ textDecoration: 'none', marginTop: '16px', display: 'inline-block' }}>
            <GlassButton variant="primary">Back to Products</GlassButton>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = product.quantity <= 0;

  const handleDecrease = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrease = () => {
    if (qty < product.quantity) setQty(qty + 1);
  };

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container">
        <Link to="/products" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Products
        </Link>

        <GlassCard hover={false} style={{ padding: '36px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
            {/* Image Column */}
            <div style={{ width: '100%', height: '380px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img
                src={product.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Details Column */}
            <div>
              <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-blue)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
                {product.Category ? product.Category.name : 'Stationery'}
              </div>

              <h1 style={{ fontSize: '2.2rem', marginBottom: '12px', lineHeight: 1.2 }}>{product.name}</h1>

              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '16px' }}>
                ₹{parseFloat(product.sellingPrice).toFixed(2)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <StatusBadge status={isOutOfStock ? 'OUT_OF_STOCK' : 'HEALTHY'} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isOutOfStock ? '0 Available' : `${product.quantity} items available in store`}
                </span>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
                {product.description || 'High quality essential campus equipment for students at National Engineering College.'}
              </p>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quantity:</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '9999px', padding: '4px 8px' }}>
                    <button
                      onClick={handleDecrease}
                      disabled={qty <= 1}
                      style={{ background: 'none', border: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ padding: '0 16px', fontWeight: 800, fontSize: '1.1rem' }}>{qty}</span>
                    <button
                      onClick={handleIncrease}
                      disabled={qty >= product.quantity}
                      style={{ background: 'none', border: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <GlassButton
                  variant="primary"
                  size="lg"
                  disabled={isOutOfStock}
                  icon={ShoppingCart}
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                >
                  {isOutOfStock ? 'Out of Stock' : `Add ${qty} to Cart (₹${(parseFloat(product.sellingPrice) * qty).toFixed(2)})`}
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
