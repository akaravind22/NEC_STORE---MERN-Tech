import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    const res = addToCart(product, 1);
    if (res === false) {
      navigate('/login');
    }
  };

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= product.lowStockThreshold;

  return (
    <GlassCard style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '20px' }}>
      {/* Image Header */}
      <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden', borderRadius: '18px 18px 0 0' }}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 300ms ease' }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Category Tag */}
        <span
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            boxShadow: 'var(--neu-extruded-sm)',
            border: '1px solid var(--neu-border)',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          {product.Category ? product.Category.name : 'Stationery'}
        </span>

        {/* Stock Badge */}
        <span
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: isOutOfStock
              ? 'rgba(239, 68, 68, 0.9)'
              : isLowStock
              ? 'rgba(245, 158, 11, 0.9)'
              : 'rgba(16, 185, 129, 0.9)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '9999px'
          }}
        >
          {isOutOfStock ? 'Out of stock' : `${product.quantity} left`}
        </span>
      </div>

      {/* Body Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <Link
            to={`/products/${product.id}`}
            style={{ textDecoration: 'none', color: 'var(--text-main)' }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
              {product.name}
            </h3>
          </Link>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description || 'Quality campus supplies for NEC students.'}
          </p>
        </div>

        {/* Footer Price & Add Button */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: (isAuthenticated && user?.role === 'CUSTOMER') ? '14px' : '0px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
              ₹{parseFloat(product.sellingPrice).toFixed(2)}
            </span>
          </div>

          {/* Only show Add to Cart when logged in as Student / Customer */}
          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <GlassButton
                variant="primary"
                size="sm"
                disabled={isOutOfStock}
                icon={ShoppingCart}
                onClick={handleAddToCart}
                className="w-full"
                style={{ width: '100%', fontWeight: 700 }}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </GlassButton>
            </div>
          )}

          {/* If Retailer is browsing products, show link to retailer management */}
          {isAuthenticated && user?.role === 'RETAILER' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <Link to="/retailer/products" style={{ textDecoration: 'none', width: '100%' }}>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  icon={Store}
                  style={{ width: '100%', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Manage in Stock
                </GlassButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductCard;
