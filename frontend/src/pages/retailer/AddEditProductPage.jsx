import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Upload, 
  Image as ImageIcon, 
  HelpCircle, 
  ExternalLink, 
  X, 
  Sparkles,
  Check
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassInput from '../../components/common/GlassInput';
import GlassButton from '../../components/common/GlassButton';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

// Common college store sample presets for 1-click image filling
const SAMPLE_IMAGE_PRESETS = [
  { label: '📚 Notebook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop' },
  { label: '🧮 Calculator', url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop' },
  { label: '🖊️ Pens & Markers', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop' },
  { label: '🥼 Lab Coat', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop' },
  { label: '🎒 Campus Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop' },
  { label: '💾 USB Pen Drive', url: 'https://images.unsplash.com/photo-1624823183493-4e1b0b2e8ef9?w=600&auto=format&fit=crop' },
  { label: '📁 Files & Folders', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop' }
];

const AddEditProductPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageGuide, setShowImageGuide] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    if (e.target.name === 'image') setImageError(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle direct file upload from computer/phone
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    // Convert file to Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setImageError(false);
        setFormData(prev => ({ ...prev, image: dataUrl }));
        addToast('Image uploaded successfully from your device!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (url) => {
    setImageError(false);
    setFormData(prev => ({ ...prev, image: url }));
    addToast('Sample image URL applied!', 'info');
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

        <GlassCard hover={false} style={{ padding: '36px', maxWidth: '760px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <GlassInput
              label="Product Name *"
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

            {/* ========================================================= */}
            {/* ENHANCED IMAGE INPUT + UPLOAD + PRESETS + GUIDE */}
            {/* ========================================================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="glass-input-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={15} color="var(--primary-blue, #2563eb)" />
                  <span>Product Image</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(URL or Upload from Device)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowImageGuide(!showImageGuide)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-blue, #2563eb)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}
                >
                  <HelpCircle size={14} />
                  <span>{showImageGuide ? 'Hide Guide' : 'Where to get image URLs?'}</span>
                </button>
              </div>

              {/* Step-by-Step Guide Card */}
              {showImageGuide && (
                <div
                  style={{
                    background: 'var(--card-bg, #f8fafc)',
                    borderRadius: '14px',
                    padding: '16px',
                    border: '1px solid var(--neu-border-subtle, #cbd5e1)',
                    fontSize: '12.5px',
                    lineHeight: 1.6,
                    color: 'var(--text-main, #334155)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-blue, #2563eb)' }}>
                    <Sparkles size={15} />
                    <span>How to get an Image URL or Upload:</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ background: 'var(--bg-color, #ffffff)', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <strong>1. Free Photos (Unsplash / Pexels)</strong>
                      <ol style={{ paddingLeft: '18px', margin: '6px 0 0 0' }}>
                        <li>Open <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>unsplash.com <ExternalLink size={10} style={{ display: 'inline' }} /></a></li>
                        <li>Search for item (e.g. <i>notebook</i>)</li>
                        <li>Right-click image ➔ <b>"Copy image address"</b></li>
                        <li>Paste in the box below (Ctrl + V)</li>
                      </ol>
                    </div>

                    <div style={{ background: 'var(--bg-color, #ffffff)', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <strong>2. Google Images</strong>
                      <ol style={{ paddingLeft: '18px', margin: '6px 0 0 0' }}>
                        <li>Search on Google Images</li>
                        <li>Click image to preview on the right</li>
                        <li>Right-click large preview ➔ <b>"Copy image address"</b></li>
                        <li>Paste in the box below</li>
                      </ol>
                    </div>

                    <div style={{ background: 'var(--bg-color, #ffffff)', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <strong>3. From Your Computer / Phone</strong>
                      <p style={{ margin: '6px 0 0 0' }}>
                        Click the <b>"Upload from Device"</b> button below to pick any photo directly from your files!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Input + Device Upload Button */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  name="image"
                  placeholder="Paste URL here (e.g. https://images.unsplash.com/...)"
                  value={formData.image}
                  onChange={handleChange}
                  className="glass-input"
                  style={{ flex: 1 }}
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '11px 16px',
                    borderRadius: '14px',
                    background: 'var(--card-bg, #ffffff)',
                    border: '1px solid var(--primary-blue, #2563eb)',
                    color: 'var(--primary-blue, #2563eb)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--neu-extruded-sm, 0 2px 6px rgba(0,0,0,0.06))',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-blue, #2563eb)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--card-bg, #ffffff)';
                    e.currentTarget.style.color = 'var(--primary-blue, #2563eb)';
                  }}
                >
                  <Upload size={16} />
                  <span>Upload from Device</span>
                </button>
              </div>

              {/* Quick Sample Image Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Presets:</span>
                {SAMPLE_IMAGE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p.url)}
                    style={{
                      background: formData.image === p.url ? 'var(--primary-blue, #2563eb)' : 'var(--card-bg, #ffffff)',
                      color: formData.image === p.url ? '#ffffff' : 'var(--text-main, #334155)',
                      border: '1px solid var(--neu-border-subtle, #cbd5e1)',
                      borderRadius: '8px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Live Image Preview Card */}
              {formData.image && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '12px',
                    borderRadius: '14px',
                    background: 'var(--bg-color, #f1f5f9)',
                    border: '1px solid var(--neu-border-subtle, #cbd5e1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  <img
                    src={formData.image}
                    alt="Preview"
                    onError={() => setImageError(true)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: imageError ? '#dc2626' : '#16a34a' }}>
                        {imageError ? '⚠️ Image failed to load (check URL)' : '✅ Image Preview Ready'}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted, #64748b)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px'
                      }}
                    >
                      {formData.image.startsWith('data:') ? 'Local Image File (Data URL)' : formData.image}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: '' }));
                      setImageError(false);
                    }}
                    title="Remove Image"
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: 'none',
                      color: '#ef4444',
                      borderRadius: '8px',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Pricing Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <GlassInput
                label="Buying Unit Price (₹) *"
                name="buyingPrice"
                type="number"
                step="0.01"
                placeholder="45.00"
                value={formData.buyingPrice}
                onChange={handleChange}
                required
              />

              <GlassInput
                label="Selling Price (₹) *"
                name="sellingPrice"
                type="number"
                step="0.01"
                placeholder="80.00"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
              />
            </div>

            {/* Quantity and Threshold */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <GlassInput
                label="Initial Quantity *"
                name="quantity"
                type="number"
                placeholder="50"
                value={formData.quantity}
                onChange={handleChange}
                required
              />

              <GlassInput
                label="Low Stock Alert Threshold *"
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
