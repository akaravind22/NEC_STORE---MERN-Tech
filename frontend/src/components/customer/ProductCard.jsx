import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';
import { useCartStore } from '../../store/useCartStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= product.lowStockThreshold;

  return (
    <GlassCard style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image Header */}
      <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden', borderRadius: '18px 18px 0 0' }}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 300ms ease' }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Category Tag */}
        <span
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '9999px',
            textTransform: 'uppercase'
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
              ? 'rgba(239, 68, 68, 0.85)'
              : isLowStock
              ? 'rgba(245, 158, 11, 0.85)'
              : 'rgba(16, 185, 129, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: '0.75rem',
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
            to={`/customer/products/${product.id}`}
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '14px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
              ₹{parseFloat(product.sellingPrice).toFixed(2)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <GlassButton
              variant="primary"
              size="sm"
              disabled={isOutOfStock}
              icon={ShoppingCart}
              onClick={() => addToCart(product, 1)}
              className="w-full"
              style={{ width: '100%' }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </GlassButton>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductCard;
