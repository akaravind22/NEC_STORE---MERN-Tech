import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Clock, Calendar } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuthStore } from '../../store/useAuthStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAxios } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
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
    fetchOrders();
  }, []);

  return (
    <div className="page-fade-enter">
      <Navbar />

      <main className="app-container">
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>My Orders</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
          Track the progress and history of your store purchases.
        </p>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            message="You haven't placed any store orders yet."
            actionText="Start Shopping"
            onAction={() => window.location.href = '/customer/products'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <GlassCard key={order.id} hover={true} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Order #{order.id}</span>
                      <StatusBadge status={order.orderStatus} />
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span>{order.items?.length || 0} item(s)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                        ₹{parseFloat(order.totalAmount).toFixed(2)}
                      </div>
                    </div>

                    <Link
                      to={`/customer/orders/${order.id}`}
                      className="glass-btn btn-secondary btn-sm"
                      style={{ borderRadius: '9999px' }}
                    >
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrdersPage;
