import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, Layers, AlertTriangle } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchProducts = async () => {
    try {
      let query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await getAxios().get(`/products${query}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await getAxios().delete(`/products/${deleteId}`);
      if (res.data.success) {
        addToast('Product deleted successfully.', 'success');
        fetchProducts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Product Catalog Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Create, update, monitor stock threshold, and remove store items.</p>
          </div>

          <Link to="/retailer/products/add" style={{ textDecoration: 'none' }}>
            <GlassButton variant="primary" icon={Plus}>Add New Product</GlassButton>
          </Link>
        </div>

        {/* Search Bar */}
        <GlassCard hover={false} style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </GlassCard>

        {/* Glass Table */}
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Buying Price</th>
                <th>Selling Price</th>
                <th>Quantity</th>
                <th>Low Stock Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>Loading product catalog...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No products found in store database.</td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.quantity <= p.lowStockThreshold;
                  return (
                    <tr key={p.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={p.image} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '10px' }} />
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</span>
                      </td>
                      <td>{p.Category ? p.Category.name : 'N/A'}</td>
                      <td>₹{parseFloat(p.buyingPrice).toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>₹{parseFloat(p.sellingPrice).toFixed(2)}</td>
                      <td style={{ fontWeight: 800 }}>{p.quantity}</td>
                      <td>{p.lowStockThreshold}</td>
                      <td>
                        <StatusBadge status={isLow ? 'LOW STOCK' : 'HEALTHY'} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/retailer/products/${p.id}/edit`} style={{ textDecoration: 'none' }}>
                            <button style={{ background: 'rgba(56, 189, 248, 0.15)', border: 'none', borderRadius: '8px', padding: '6px 10px', color: 'var(--primary-blue)', cursor: 'pointer' }}>
                              <Edit3 size={15} />
                            </button>
                          </Link>
                          <button onClick={() => setDeleteId(p.id)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: '8px', padding: '6px 10px', color: 'var(--status-danger)', cursor: 'pointer' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product Confirmation"
        message="Are you sure you want to delete this product from store records?"
      />
    </div>
  );
};

export default ProductListPage;
