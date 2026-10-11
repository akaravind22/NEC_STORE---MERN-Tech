import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, SlidersHorizontal, PackageX, ShoppingCart, Info, CheckCircle2, ShieldCheck, Truck, Store, Tag } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/common/GlassCard';
import GlassInput from '../../components/common/GlassInput';
import GlassModal from '../../components/common/GlassModal';
import GlassButton from '../../components/common/GlassButton';
import ProductCard from '../../components/customer/ProductCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import CenteredPagination from '../../components/common/CenteredPagination';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Info State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { addToCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = `?sortBy=${sortBy}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) query += `&categoryId=${selectedCategory}`;
      if (availability) query += `&availability=${availability}`;

      const res = await axios.get(`${API_URL}/products${query}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/categories`);
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1);
  }, [search, selectedCategory, availability, sortBy]);

  // Handle URL param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    const s = searchParams.get('search');
    if (cat !== null) setSelectedCategory(cat);
    if (s !== null) setSearch(s);
  }, [searchParams]);

  // Client-side pagination
  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage, pageSize]);

  const handleOpenInfo = (product) => {
    setSelectedProduct(product);
    setModalQty(1);
  };

  const handleModalAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, modalQty);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container" style={{ padding: '36px 16px', minHeight: '80vh' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Campus Store Products
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
            Browse through engineering textbooks, scientific calculators, stationery, and college essentials.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <GlassCard hover={false} style={{ padding: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            
            {/* Search Input */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Search Item
              </label>
              <GlassInput
                icon={Search}
                placeholder="Search notebook, pen, calculator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="glass-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="">All Stock Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name (A - Z)</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Product Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            message="We couldn't find any products matching your search criteria."
            actionText="Reset Search Filters"
            onAction={() => {
              setSearch('');
              setSelectedCategory('');
              setAvailability('');
              setSortBy('newest');
            }}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {paginatedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={handleOpenInfo}
              />
            ))}
          </div>
        )}

        {/* Centered Pagination */}
        <CenteredPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={products.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="products"
        />
      </main>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PRODUCT INFORMATION & SPECIFICATIONS MODAL                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <GlassModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Product Information & Details"
        maxWidth="680px"
      >
        {selectedProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Media & Key Attributes Card */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{
                width: '180px',
                height: '180px',
                borderRadius: '16px',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--neu-border-subtle)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
              }}>
                <img
                  src={selectedProduct.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'}
                  alt={selectedProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ flex: '1 1 240px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--primary-blue)',
                    border: '1px solid rgba(37, 99, 235, 0.2)'
                  }}>
                    {selectedProduct.Category ? selectedProduct.Category.name : 'Stationery'}
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: selectedProduct.quantity > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: selectedProduct.quantity > 0 ? '#10b981' : '#ef4444',
                    border: selectedProduct.quantity > 0 ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)'
                  }}>
                    {selectedProduct.quantity > 0 ? `In Stock (${selectedProduct.quantity} units)` : 'Out of Stock'}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0', lineHeight: 1.25 }}>
                  {selectedProduct.name}
                </h2>

                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-blue)' }}>
                  ₹{parseFloat(selectedProduct.sellingPrice).toFixed(2)}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '6px' }}>
                    (Campus Standard Rate)
                  </span>
                </div>
              </div>
            </div>

            {/* Description & Technical Info Section */}
            <div style={{
              padding: '16px',
              background: 'var(--neu-inset-bg)',
              borderRadius: '14px',
              border: '1px solid var(--neu-border-subtle)'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Item Description & Features
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                {selectedProduct.description || 'Verified genuine campus academic and daily essential store product.'}
              </p>
            </div>

            {/* Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: 'var(--card-bg)', border: '1px solid var(--neu-border-subtle)' }}>
                <Store size={18} color="var(--primary-blue)" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pickup Location</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>NEC Campus Store</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: 'var(--card-bg)', border: '1px solid var(--neu-border-subtle)' }}>
                <ShieldCheck size={18} color="#10b981" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quality Guarantee</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>100% Genuine Item</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: 'var(--card-bg)', border: '1px solid var(--neu-border-subtle)' }}>
                <Truck size={18} color="var(--primary-purple)" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Instant Readiness</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>1-Click Counter Pickup</div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--neu-border-subtle)', flexWrap: 'wrap', gap: '14px' }}>
              
              {/* Quantity Counter (Only for Customer) */}
              {isAuthenticated && user?.role === 'CUSTOMER' && selectedProduct.quantity > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quantity:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--neu-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      style={{ padding: '6px 12px', background: 'var(--card-bg)', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '6px 14px', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {modalQty}
                    </span>
                    <button
                      onClick={() => setModalQty(Math.min(selectedProduct.quantity, modalQty + 1))}
                      style={{ padding: '6px 12px', background: 'var(--card-bg)', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                <GlassButton variant="secondary" onClick={() => setSelectedProduct(null)}>
                  Close
                </GlassButton>

                {isAuthenticated && user?.role === 'CUSTOMER' && (
                  <GlassButton
                    variant="primary"
                    disabled={selectedProduct.quantity <= 0}
                    icon={ShoppingCart}
                    onClick={handleModalAddToCart}
                  >
                    {selectedProduct.quantity > 0 ? `Add ${modalQty} to Cart (₹${(modalQty * parseFloat(selectedProduct.sellingPrice)).toFixed(2)})` : 'Out of Stock'}
                  </GlassButton>
                )}
              </div>
            </div>
          </div>
        )}
      </GlassModal>

      <Footer />
    </div>
  );
};

export default ProductsPage;
