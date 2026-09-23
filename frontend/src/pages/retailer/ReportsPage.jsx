import React, { useState } from 'react';
import { FileSpreadsheet, Download, Layers, TrendingUp, CreditCard, RefreshCw } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const ReportsPage = () => {
  const [downloading, setDownloading] = useState(null);
  const { getAxios } = useAuthStore();
  const { addToast } = useToastStore();

  const handleDownload = async (endpoint, filename) => {
    setDownloading(endpoint);
    try {
      const response = await getAxios().get(`/reports/${endpoint}`, {
        responseType: 'blob'
      });

      // Create a blob URL and trigger file download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addToast(`Downloaded ${filename} successfully!`, 'success');
    } catch (err) {
      addToast('Failed to generate Excel report.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Excel Report Generation</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Generate and download structured Excel (.xlsx) workbooks for official store accounting and audits.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Sales Report Card */}
          <GlassCard style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Sales Revenue Report</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Comprehensive export containing order IDs, customer names, payment statuses, total amounts, and delivery timestamps.
            </p>
            <GlassButton
              variant="primary"
              size="md"
              disabled={downloading === 'sales'}
              icon={downloading === 'sales' ? RefreshCw : Download}
              onClick={() => handleDownload('sales', 'NEC_Store_Sales_Report')}
              style={{ width: '100%' }}
            >
              {downloading === 'sales' ? 'Generating...' : 'Download Sales (.xlsx)'}
            </GlassButton>
          </GlassCard>

          {/* Stock Report Card */}
          <GlassCard style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Inventory Stock Report</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Includes product names, categories, current stock quantities, low stock thresholds, and unit buying/selling prices.
            </p>
            <GlassButton
              variant="accent"
              size="md"
              disabled={downloading === 'stock'}
              icon={downloading === 'stock' ? RefreshCw : Download}
              onClick={() => handleDownload('stock', 'NEC_Store_Stock_Report')}
              style={{ width: '100%' }}
            >
              {downloading === 'stock' ? 'Generating...' : 'Download Stock (.xlsx)'}
            </GlassButton>
          </GlassCard>

          {/* Stock Audit History Card */}
          <GlassCard style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(124, 58, 237, 0.15)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <FileSpreadsheet size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Incoming Stock History</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Audit log of every stock batch added, retailer ID, previous prices, new prices, and calculated weighted average costs.
            </p>
            <GlassButton
              variant="secondary"
              size="md"
              disabled={downloading === 'stock-history'}
              icon={downloading === 'stock-history' ? RefreshCw : Download}
              onClick={() => handleDownload('stock-history', 'NEC_Store_Stock_History')}
              style={{ width: '100%' }}
            >
              {downloading === 'stock-history' ? 'Generating...' : 'Download Incoming Stock (.xlsx)'}
            </GlassButton>
          </GlassCard>

          {/* Transactions Report Card */}
          <GlassCard style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <CreditCard size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Transactions Audit Report</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Full report of Razorpay payment IDs, order IDs, customer details, transaction status, and timestamps.
            </p>
            <GlassButton
              variant="primary"
              size="md"
              disabled={downloading === 'transactions'}
              icon={downloading === 'transactions' ? RefreshCw : Download}
              onClick={() => handleDownload('transactions', 'NEC_Store_Transactions')}
              style={{ width: '100%' }}
            >
              {downloading === 'transactions' ? 'Generating...' : 'Download Transactions (.xlsx)'}
            </GlassButton>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
