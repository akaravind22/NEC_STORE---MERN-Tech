import React, { useState, useEffect } from 'react';
import { History, FileSpreadsheet } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';

const StockHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAxios } = useAuthStore();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getAxios().get('/stock/history');
        if (res.data.success) {
          setHistory(res.data.history);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Incoming Stock Audit Log</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Historical record of every inventory batch added, unit prices, and weighted average calculations.
        </p>

        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Product</th>
                <th>Retailer</th>
                <th>Prev Qty</th>
                <th>Added Qty</th>
                <th>New Qty</th>
                <th>Prev Price</th>
                <th>New Price</th>
                <th>Weighted Avg Price</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px' }}>Loading stock audit trail...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No stock replenishment history recorded yet.</td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td>#{h.id}</td>
                    <td style={{ fontWeight: 700 }}>{h.Product?.name || 'N/A'}</td>
                    <td>{h.retailer?.name || 'Retailer'}</td>
                    <td>{h.previousQuantity}</td>
                    <td style={{ color: 'var(--status-success)', fontWeight: 800 }}>+{h.addedQuantity}</td>
                    <td style={{ fontWeight: 800 }}>{h.newQuantity}</td>
                    <td>₹{parseFloat(h.previousBuyingPrice).toFixed(2)}</td>
                    <td>₹{parseFloat(h.newBuyingPrice).toFixed(2)}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-purple)' }}>₹{parseFloat(h.averageBuyingPrice).toFixed(2)}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StockHistoryPage;
