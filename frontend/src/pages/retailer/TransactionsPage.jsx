import React, { useState, useEffect } from 'react';
import { CreditCard, FileSpreadsheet } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';

const TransactionsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAxios } = useAuthStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await getAxios().get('/orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Transaction History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Payment transaction verification records and Razorpay Gateway signatures.
        </p>

        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Txn Ref ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Razorpay Payment ID</th>
                <th>Payment Status</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>Loading transaction records...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No payment transactions recorded yet.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>#TXN-{o.id * 1024}</td>
                    <td style={{ fontWeight: 800 }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{o.User?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.User?.email}</div>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>₹{parseFloat(o.totalAmount).toFixed(2)}</td>
                    <td>RAZORPAY</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-purple)' }}>
                      {o.razorpayPaymentId || 'pay_demo_verified'}
                    </td>
                    <td><StatusBadge status={o.paymentStatus} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString()}</td>
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

export default TransactionsPage;
