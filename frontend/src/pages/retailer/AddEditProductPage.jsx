import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassInput from '../../components/common/GlassInput';
import GlassButton from '../../components/common/GlassButton';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const AddEditProductPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    image: '',
    buyingPrice: '',
    sellingPrice: '',
    quantity: '',
    lowStockThreshold: '5'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAxios().get('/products/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
          if (!isEdit && res.data.categories.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: res.data.categories[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();

    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await getAxios().get(`/products/${id}`);
          if (res.data.success) {
            const p = res.data.product;
            setFormData({
              name: p.name,
              categoryId: p.categoryId,
              description: p.description || '',
              image: p.image || '',
              buyingPrice: p.buyingPrice,
              sellingPrice: p.sellingPrice,
              quantity: p.quantity,
              lowStockThreshold: p.lowStockThreshold
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(formData.sellingPrice) <= 0 || parseFloat(formData.buyingPrice) <= 0) {
      addToast('Prices must be greater than 0.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const res = await getAxios().put(`/products/${id}`, formData);
        if (res.data.success) {
          addToast('Product updated successfully!', 'success');
          navigate('/retailer/products');
        }
      } else {
        const res = await getAxios().post('/products', formData);
        if (res.data.success) {
          addToast('Product created successfully!', 'success');
          navigate('/retailer/products');
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <Link to="/retailer/products" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Catalog
        </Link>

        <h1 style={{ fontSize: '2rem', marginBottom: '28px' }}>
          {isEdit ? 'Edit Product Details' : 'Add New Product to Store'}
        </h1>

        <GlassCard hover={false} style={{ padding: '36px', maxWidth: '720px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <GlassInput
              label="Product Name"
              name="name"
              placeholder="e.g. NEC Premium A4 Notebook 200 Pages"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <div className="glass-input-group">
              <label className="glass-input-label">Product Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="glass-input"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <GlassInput
              label="Image URL"
              name="image"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={handleChange}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <GlassInput
                label="Buying Unit Price (₹)"
                name="buyingPrice"
                type="number"
                step="0.01"
                placeholder="45.00"
                value={formData.buyingPrice}
                onChange={handleChange}
                required
              />

              <GlassInput
                label="Selling Price (₹)"
                name="sellingPrice"
                type="number"
                step="0.01"
                placeholder="80.00"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <GlassInput
                label="Initial Quantity"
                name="quantity"
                type="number"
                placeholder="50"
                value={formData.quantity}
                onChange={handleChange}
                required
              />

              <GlassInput
                label="Low Stock Alert Threshold"
                name="lowStockThreshold"
                type="number"
                placeholder="5"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                required
              />
            </div>

            <GlassInput
              label="Product Description"
              name="description"
              type="textarea"
              rows={4}
              placeholder="Describe quality, paper GSM, specifications..."
              value={formData.description}
              onChange={handleChange}
            />

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              icon={Save}
              style={{ width: '100%', marginTop: '12px' }}
            >
              {loading ? 'Saving Product...' : isEdit ? 'Update Product' : 'Create Product'}
            </GlassButton>
          </form>
        </GlassCard>
      </main>
    </div>
  );
};

export default AddEditProductPage;
