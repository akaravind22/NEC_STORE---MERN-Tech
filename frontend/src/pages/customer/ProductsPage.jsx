import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, SlidersHorizontal, PackageX } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../../components/common/GlassCard';
import GlassInput from '../../components/common/GlassInput';
import ProductCard from '../../components/customer/ProductCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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
  }, [search, selectedCategory, availability, sortBy]);

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container">
        {/* Page Title Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Campus Store Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Browse through engineering textbooks, scientific calculators, stationery, and college essentials.
          </p>
        </div>

        {/* Filter & Search Panel */}
        <GlassCard hover={false} style={{ padding: '24px', marginBottom: '36px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            {/* Search Input */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Search Item
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  placeholder="Search by name or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;
