import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import GlassInput from '../../components/common/GlassInput';
import GlassModal from '../../components/common/GlassModal';
import StatusBadge from '../../components/common/StatusBadge';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedQty, setAddedQty] = useState('');
  const [newBuyingPrice, setNewBuyingPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchProducts = async () => {
    try {
      const res = await getAxios().get('/products');
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
  }, []);

  const handleOpenAddStock = (product) => {
    setSelectedProduct(product);
    setAddedQty('');
    setNewBuyingPrice(product.buyingPrice);
  };

  // Weighted Average Calculation Preview:
  // (Old Quantity * Old Buying Price + New Quantity * New Buying Price) / (Old Quantity + New Quantity)
  const calculatePreview = () => {
    if (!selectedProduct || !addedQty || !newBuyingPrice) return null;
    const oldQty = selectedProduct.quantity;
    const oldPrice = parseFloat(selectedProduct.buyingPrice);
    const addQty = parseInt(addedQty || 0);
    const unitPrice = parseFloat(newBuyingPrice || 0);

    const totalQty = oldQty + addQty;
    if (totalQty === 0) return 0;
    const newAvg = ((oldQty * oldPrice) + (addQty * unitPrice)) / totalQty;
    return {
      totalQty,
      newAvg: newAvg.toFixed(2)
    };
  };

  const preview = calculatePreview();

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !addedQty || !newBuyingPrice) return;

    setSubmitting(true);
    try {
      const res = await getAxios().post('/stock/add', {
        productId: selectedProduct.id,
        addedQuantity: parseInt(addedQty),
        newBuyingPrice: parseFloat(newBuyingPrice)
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to replenish stock.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Inventory Stock & Replenishment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Add fresh batch stock with automatic weighted average cost recalculation.
        </p>

        {/* Stock Status Table */}
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Low Threshold</th>
                <th>Current Avg Cost</th>
                <th>Selling Price</th>
                <th>Stock Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>Loading inventory records...</td>
                </tr>
              ) : products.map((p) => {
                const isLow = p.quantity <= p.lowStockThreshold;
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.name}</td>
                    <td style={{ fontSize: '1.1rem', fontWeight: 800 }}>{p.quantity}</td>
                    <td>{p.lowStockThreshold}</td>
                    <td>₹{parseFloat(p.buyingPrice).toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>₹{parseFloat(p.sellingPrice).toFixed(2)}</td>
                    <td>
                      <StatusBadge status={isLow ? 'LOW STOCK' : 'HEALTHY'} />
                    </td>
                    <td>
                      <GlassButton
                        variant="primary"
                        size="sm"
                        icon={PlusCircle}
                        onClick={() => handleOpenAddStock(p)}
                      >
                        Replenish Stock
                      </GlassButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Stock Addition Glass Modal */}
      <GlassModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={`Add Stock Batch: ${selectedProduct?.name}`}
        maxWidth="500px"
      >
        <form onSubmit={handleStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Stock:</span>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{selectedProduct?.quantity} units</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Avg Buying Price:</span>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-purple)' }}>
                ₹{parseFloat(selectedProduct?.buyingPrice || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <GlassInput
            label="Quantity to Add"
            name="addedQty"
            type="number"
            placeholder="e.g. 25"
            value={addedQty}
            onChange={(e) => setAddedQty(e.target.value)}
            required
          />

          <GlassInput
            label="New Batch Unit Buying Price (₹)"
            name="newBuyingPrice"
            type="number"
            step="0.01"
            placeholder="e.g. 50.00"
            value={newBuyingPrice}
            onChange={(e) => setNewBuyingPrice(e.target.value)}
            required
          />

          {/* Weighted Average Formula Preview */}
          {preview && (
            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase' }}>
                FORMULA PREVIEW (WEIGHTED AVERAGE COST)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.9rem' }}>
                <span>New Total Quantity: <strong>{preview.totalQty}</strong></span>
                <span>Recalculated Avg Price: <strong style={{ color: 'var(--primary-blue)', fontSize: '1.1rem' }}>₹{preview.newAvg}</strong></span>
              </div>
            </div>
          )}

          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {submitting ? 'Updating Stock...' : 'Confirm Stock Addition'}
          </GlassButton>
        </form>
      </GlassModal>
    </div>
  );
};

export default InventoryPage;
