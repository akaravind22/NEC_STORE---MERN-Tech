import React, { useState, useEffect } from 'react';
import { Clock, Coffee, Briefcase, CheckCircle2, XCircle, Settings, Save, AlertCircle } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';
import { useStoreTimingStore } from '../../store/useStoreTimingStore';

const StoreTimingManager = () => {
  const { settings, liveStatus, loading, fetchSettings, updateSettings, quickStatus } = useStoreTimingStore();

  const [formData, setFormData] = useState({
    openTime: '08:30',
    closeTime: '17:30',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    workingDays: 'Monday – Saturday',
    status: 'AUTO',
    statusMessage: '',
    allowOrdersWhenClosed: true
  });

  const [showConfig, setShowConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFormData({
        openTime: settings.openTime || '08:30',
        closeTime: settings.closeTime || '17:30',
        lunchStart: settings.lunchStart || '13:00',
        lunchEnd: settings.lunchEnd || '14:00',
        workingDays: settings.workingDays || 'Monday – Saturday',
        status: settings.status || 'AUTO',
        statusMessage: settings.statusMessage || '',
        allowOrdersWhenClosed: settings.allowOrdersWhenClosed !== false
      });
    }
  }, [settings]);

  const handleQuickStatus = async (status, customMsg = '') => {
    setSubmitting(true);
    await quickStatus(status, customMsg);
    setSubmitting(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await updateSettings(formData);
    setSubmitting(false);
  };

  const getStatusBadge = () => {
    const status = liveStatus?.effectiveStatus || 'OPEN';
    switch (status) {
      case 'OPEN':
        return {
          color: '#16a34a',
          bg: 'rgba(22, 163, 74, 0.12)',
          border: 'rgba(22, 163, 74, 0.25)',
          label: 'Store is Open',
          icon: CheckCircle2
        };
      case 'LUNCH_BREAK':
        return {
          color: '#d97706',
          bg: 'rgba(217, 119, 6, 0.12)',
          border: 'rgba(217, 119, 6, 0.25)',
          label: 'On Lunch Break',
          icon: Coffee
        };
      case 'TEMPORARILY_CLOSED':
        return {
          color: '#e11d48',
          bg: 'rgba(225, 29, 72, 0.12)',
          border: 'rgba(225, 29, 72, 0.25)',
          label: 'Away on Work',
          icon: Briefcase
        };
      case 'CLOSED':
      default:
        return {
          color: '#64748b',
          bg: 'rgba(100, 116, 139, 0.12)',
          border: 'rgba(100, 116, 139, 0.25)',
          label: 'Store Closed',
          icon: XCircle
        };
    }
  };

  const badge = getStatusBadge();
  const BadgeIcon = badge.icon;

  return (
    <GlassCard hover={false} style={{ padding: '24px', marginBottom: '28px', border: '1px solid var(--neu-border)' }}>
      {/* Top Header & Live Preview */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--neu-extruded-sm)' }}>
            <Clock size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Store Timings & Operational Controls
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Configure opening/closing hours and update your availability when stepping out for lunch or campus duties.
            </p>
          </div>
        </div>

        {/* Live Status Indicator Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            color: badge.color,
            fontWeight: 700,
            fontSize: '0.85rem'
          }}
        >
          <BadgeIcon size={16} />
          <span>{badge.label}</span>
          <span style={{ fontSize: '0.78rem', opacity: 0.85, marginLeft: '4px' }}>
            ({liveStatus?.message})
          </span>
        </div>
      </div>

      {/* Quick 1-Click Operational Status Actions */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          ⚡ Fast 1-Click Status Toggles (Visible Instantly to Students)
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleQuickStatus('OPEN', '')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--neu-border)',
              background: settings.status === 'OPEN' ? 'rgba(22, 163, 74, 0.18)' : 'var(--card-bg)',
              color: settings.status === 'OPEN' ? '#16a34a' : 'var(--text-main)',
              boxShadow: settings.status === 'OPEN' ? 'var(--neu-pressed-sm)' : 'var(--neu-extruded-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <CheckCircle2 size={16} color="#16a34a" />
            <span>Store Open (Counter Active)</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleQuickStatus('LUNCH_BREAK', `Retailer on Lunch Break (Returns at ${liveStatus.formattedLunchEnd})`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--neu-border)',
              background: settings.status === 'LUNCH_BREAK' ? 'rgba(217, 119, 6, 0.18)' : 'var(--card-bg)',
              color: settings.status === 'LUNCH_BREAK' ? '#d97706' : 'var(--text-main)',
              boxShadow: settings.status === 'LUNCH_BREAK' ? 'var(--neu-pressed-sm)' : 'var(--neu-extruded-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <Coffee size={16} color="#d97706" />
            <span>Go to Lunch Break ({liveStatus.formattedLunchInterval})</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleQuickStatus('TEMPORARILY_CLOSED', 'Retailer away on campus work / stock receiving')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--neu-border)',
              background: settings.status === 'TEMPORARILY_CLOSED' ? 'rgba(225, 29, 72, 0.18)' : 'var(--card-bg)',
              color: settings.status === 'TEMPORARILY_CLOSED' ? '#e11d48' : 'var(--text-main)',
              boxShadow: settings.status === 'TEMPORARILY_CLOSED' ? 'var(--neu-pressed-sm)' : 'var(--neu-extruded-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <Briefcase size={16} color="#e11d48" />
            <span>Away on Campus Duty</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleQuickStatus('AUTO', '')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--neu-border)',
              background: settings.status === 'AUTO' ? 'rgba(37, 99, 235, 0.18)' : 'var(--card-bg)',
              color: settings.status === 'AUTO' ? 'var(--primary-blue)' : 'var(--text-main)',
              boxShadow: settings.status === 'AUTO' ? 'var(--neu-pressed-sm)' : 'var(--neu-extruded-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <Clock size={16} color="var(--primary-blue)" />
            <span>Follow Timetable Schedule</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleQuickStatus('CLOSED', 'Store is closed for the day')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--neu-border)',
              background: settings.status === 'CLOSED' ? 'rgba(100, 116, 139, 0.18)' : 'var(--card-bg)',
              color: settings.status === 'CLOSED' ? '#64748b' : 'var(--text-main)',
              boxShadow: settings.status === 'CLOSED' ? 'var(--neu-pressed-sm)' : 'var(--neu-extruded-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <XCircle size={16} color="#64748b" />
            <span>Close Store</span>
          </button>
        </div>
      </div>

      {/* Toggle to Open Full Timings Editor */}
      <div style={{ borderTop: '1px solid var(--neu-border-subtle)', paddingTop: '16px' }}>
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--primary-blue)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 700,
            padding: 0
          }}
        >
          <Settings size={16} />
          <span>{showConfig ? 'Hide Timetable Configuration' : 'Edit Starting, Closing & Lunch Timings'}</span>
        </button>

        {showConfig && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Starting Time (Opening)
                </label>
                <input
                  type="time"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleFormChange}
                  className="neu-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Closing Time
                </label>
                <input
                  type="time"
                  name="closeTime"
                  value={formData.closeTime}
                  onChange={handleFormChange}
                  className="neu-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Lunch Break Start
                </label>
                <input
                  type="time"
                  name="lunchStart"
                  value={formData.lunchStart}
                  onChange={handleFormChange}
                  className="neu-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Lunch Break End
                </label>
                <input
                  type="time"
                  name="lunchEnd"
                  value={formData.lunchEnd}
                  onChange={handleFormChange}
                  className="neu-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Working Days Description
                </label>
                <input
                  type="text"
                  name="workingDays"
                  value={formData.workingDays}
                  onChange={handleFormChange}
                  placeholder="e.g. Monday – Saturday"
                  className="neu-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Custom Public Status / Away Message
                </label>
                <input
                  type="text"
                  name="statusMessage"
                  value={formData.statusMessage}
                  onChange={handleFormChange}
                  placeholder="e.g. Taking delivery of lab uniforms, back in 20 mins"
                  className="neu-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="allowOrders"
                name="allowOrdersWhenClosed"
                checked={formData.allowOrdersWhenClosed}
                onChange={handleFormChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-blue)', cursor: 'pointer' }}
              />
              <label htmlFor="allowOrders" style={{ fontSize: '0.88rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                Allow students to place online orders even when retailer is at lunch or store is closed (pickup upon return)
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--neu-border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <GlassButton
                type="submit"
                variant="primary"
                icon={Save}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Timing & Policy'}
              </GlassButton>
            </div>
          </form>
        )}
      </div>
    </GlassCard>
  );
};

export default StoreTimingManager;
