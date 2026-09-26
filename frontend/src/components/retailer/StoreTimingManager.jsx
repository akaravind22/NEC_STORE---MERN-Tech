import React, { useState, useEffect } from 'react';
import {
  Clock,
  Coffee,
  Briefcase,
  CheckCircle2,
  XCircle,
  Save,
  AlertCircle,
  PlusCircle,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';
import { useStoreTimingStore } from '../../store/useStoreTimingStore';

const StoreTimingManager = () => {
  const { settings, liveStatus, loading, fetchSettings, updateSettings, quickStatus } = useStoreTimingStore();

  // Daily Schedule Form State (Manual Entry)
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

  // Manual Quick Departure State
  const [lunchReturnTime, setLunchReturnTime] = useState('');
  const [lunchNote, setLunchNote] = useState('');
  const [awayReason, setAwayReason] = useState('Campus errand & stock delivery');
  const [awayReturnTime, setAwayReturnTime] = useState('');
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

    // Initialize default departure return times based on current clock
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 60000);
    const in45 = new Date(now.getTime() + 45 * 60000);
    const formatTimeHelper = (d) => {
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      return `${h}:${m} ${ampm}`;
    };

    setLunchReturnTime(formatTimeHelper(in45));
    setLunchNote(`Retailer on lunch break, returns at ${formatTimeHelper(in45)}`);
    setAwayReturnTime(formatTimeHelper(in30));
  }, [settings]);

  // Helper to add minutes to current time
  const setQuickMinutes = (mins, type = 'lunch') => {
    const target = new Date(Date.now() + mins * 60000);
    let h = target.getHours();
    const m = String(target.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const formatted = `${h}:${m} ${ampm}`;

    if (type === 'lunch') {
      setLunchReturnTime(formatted);
      setLunchNote(`Retailer on lunch break, returns at ${formatted}`);
    } else {
      setAwayReturnTime(formatted);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveDailySchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await updateSettings(formData);
    setSubmitting(false);
  };

  const handleTriggerLunch = async () => {
    setSubmitting(true);
    const returnMsg = lunchNote || `Retailer on lunch break, returns at ${lunchReturnTime || 'shortly'}`;
    await quickStatus('LUNCH_BREAK', returnMsg);
    setSubmitting(false);
  };

  const handleTriggerAway = async () => {
    setSubmitting(true);
    const note = awayReason
      ? `${awayReason} (Back at ${awayReturnTime || 'soon'})`
      : `Away on campus work, back at ${awayReturnTime || 'soon'}`;
    await quickStatus('TEMPORARILY_CLOSED', note);
    setSubmitting(false);
  };

  const handleSetOpen = async () => {
    setSubmitting(true);
    await quickStatus('OPEN', 'Store is Open');
    setSubmitting(false);
  };

  const handleSetClosed = async () => {
    setSubmitting(true);
    await quickStatus('CLOSED', 'Store is closed for the day');
    setSubmitting(false);
  };

  const handleSetAuto = async () => {
    setSubmitting(true);
    await quickStatus('AUTO', '');
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
          label: 'Store is Open (Active Counter)',
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
          label: 'Away on Campus Duty',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
      {/* 1. TOP LIVE STATUS HERO CARD */}
      <GlassCard hover={false} style={{ padding: '24px', border: '1px solid var(--neu-border)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'rgba(37, 99, 235, 0.15)',
                color: 'var(--primary-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--neu-extruded-sm)'
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Store Operating Hours & Live Availability
                </h3>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Manually control when the counter is open, step out for lunch/duties with custom return times, and set daily operating hours.
              </p>
            </div>
          </div>

          {/* Current Live Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '9999px',
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              color: badge.color,
              fontWeight: 800,
              fontSize: '0.88rem',
              boxShadow: 'var(--neu-extruded-sm)'
            }}
          >
            <BadgeIcon size={18} />
            <span>{badge.label}</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.85, marginLeft: '4px' }}>
              • {liveStatus?.message}
            </span>
          </div>
        </div>

        {/* Global Quick Actions Bar */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--neu-border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '6px' }}>
            QUICK STATUS TOGGLES:
          </span>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSetOpen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--neu-border)',
              background: settings.status === 'OPEN' ? 'rgba(22, 163, 74, 0.2)' : 'var(--card-bg)',
              color: settings.status === 'OPEN' ? '#16a34a' : 'var(--text-main)',
              boxShadow: settings.status === 'OPEN' ? 'var(--neu-pressed-sm)' : 'var(--neu-extruded-sm)'
            }}
          >
            <CheckCircle2 size={15} color="#16a34a" />
            <span>I'm at Counter (Store Open)</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSetAuto}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--neu-border)',
              background: settings.status === 'AUTO' ? 'rgba(37, 99, 235, 0.2)' : 'var(--card-bg)',
              color: settings.status === 'AUTO' ? 'var(--primary-blue)' : 'var(--text-main)',
              boxShadow: settings.status === 'AUTO' ? 'var(--neu-pressed-sm)' : 'var(--neu-extruded-sm)'
            }}
          >
            <Clock size={15} color="var(--primary-blue)" />
            <span>Follow Timetable Schedule</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSetClosed}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--neu-border)',
              background: settings.status === 'CLOSED' ? 'rgba(100, 116, 139, 0.2)' : 'var(--card-bg)',
              color: settings.status === 'CLOSED' ? '#64748b' : 'var(--text-main)',
              boxShadow: settings.status === 'CLOSED' ? 'var(--neu-pressed-sm)' : 'var(--neu-extruded-sm)'
            }}
          >
            <XCircle size={15} color="#64748b" />
            <span>Close Store</span>
          </button>
        </div>
      </GlassCard>

      {/* 2. MANUAL STEP-OUT CONTROLS (LUNCH BREAK & CAMPUS WORK) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* CARD A: STEP OUT FOR LUNCH (MANUAL RETURN TIME) */}
        <GlassCard hover={false} style={{ padding: '22px', border: '1px solid var(--neu-border)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coffee size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Step Out for Lunch Break
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Manually enter the time you will return to the counter
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Quick Return Durations:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setQuickMinutes(30, 'lunch')}
                style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--neu-border)', background: 'var(--app-bg)', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                +30 Mins
              </button>
              <button
                type="button"
                onClick={() => setQuickMinutes(45, 'lunch')}
                style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--neu-border)', background: 'var(--app-bg)', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                +45 Mins
              </button>
              <button
                type="button"
                onClick={() => setQuickMinutes(60, 'lunch')}
                style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--neu-border)', background: 'var(--app-bg)', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => setQuickMinutes(90, 'lunch')}
                style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--neu-border)', background: 'var(--app-bg)', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                +1.5 Hours
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Manual Return Time
              </label>
              <input
                type="text"
                value={lunchReturnTime}
                onChange={(e) => {
                  setLunchReturnTime(e.target.value);
                  setLunchNote(`Retailer on lunch break, returns at ${e.target.value}`);
                }}
                placeholder="e.g. 02:15 PM or 14:15"
                className="neu-input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Broadcast Message to Students
              </label>
              <input
                type="text"
                value={lunchNote}
                onChange={(e) => setLunchNote(e.target.value)}
                placeholder="e.g. Retailer on lunch break, counter reopens at 2:15 PM"
                className="neu-input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleTriggerLunch}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: '#d97706',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
            }}
          >
            <Coffee size={16} />
            <span>Go to Lunch Break ({lunchReturnTime || 'Manual Time'})</span>
          </button>
        </GlassCard>

        {/* CARD B: STEP OUT FOR CAMPUS WORK / ERRANDS */}
        <GlassCard hover={false} style={{ padding: '22px', border: '1px solid var(--neu-border)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.15)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Step Out on Campus Work
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                For lab deliveries, inventory audits, bank runs, or meetings
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Quick Return Durations:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setQuickMinutes(15, 'work')}
                style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--neu-border)', background: 'var(--app-bg)', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                +15 Mins
              </button>
              <button
                type="button"
                onClick={() => setQuickMinutes(30, 'work')}
                style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--neu-border)', background: 'var(--app-bg)', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                +30 Mins
              </button>
              <button
                type="button"
                onClick={() => setQuickMinutes(45, 'work')}
                style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--neu-border)', background: 'var(--app-bg)', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                +45 Mins
              </button>
              <button
                type="button"
                onClick={() => setQuickMinutes(60, 'work')}
                style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--neu-border)', background: 'var(--app-bg)', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                +1 Hour
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Reason / Department Duty
              </label>
              <input
                type="text"
                value={awayReason}
                onChange={(e) => setAwayReason(e.target.value)}
                placeholder="e.g. Lab uniforms distribution in Block B"
                className="neu-input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Manual Return Time
              </label>
              <input
                type="text"
                value={awayReturnTime}
                onChange={(e) => setAwayReturnTime(e.target.value)}
                placeholder="e.g. 03:45 PM"
                className="neu-input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleTriggerAway}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)'
            }}
          >
            <Briefcase size={16} />
            <span>Step Out on Work (Back at {awayReturnTime || 'Manual Time'})</span>
          </button>
        </GlassCard>
      </div>

      {/* 3. MANUAL DAILY OPERATING HOURS CONFIGURATION (ALWAYS VISIBLE & DIRECTLY EDITABLE) */}
      <GlassCard hover={false} style={{ padding: '24px', border: '1px solid var(--neu-border)', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Manual Operating Schedule & Hours
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Enter any custom starting time, closing time, and lunch break intervals. Timings are fully manual and not restricted.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveDailySchedule}>
          {/* Row 1: Starting Time & Closing Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                🕒 Store Starting Time (Opening)
              </label>
              <input
                type="text"
                name="openTime"
                value={formData.openTime}
                onChange={handleFormChange}
                placeholder="e.g. 08:30 or 8:30 AM"
                className="neu-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.92rem', fontWeight: 600 }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Current live display: <strong>{liveStatus?.formattedOpen}</strong>
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                🕒 Store Closing Time
              </label>
              <input
                type="text"
                name="closeTime"
                value={formData.closeTime}
                onChange={handleFormChange}
                placeholder="e.g. 17:30 or 5:30 PM"
                className="neu-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.92rem', fontWeight: 600 }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Current live display: <strong>{liveStatus?.formattedClose}</strong>
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                ☕ Daily Lunch Break Start
              </label>
              <input
                type="text"
                name="lunchStart"
                value={formData.lunchStart}
                onChange={handleFormChange}
                placeholder="e.g. 13:00 or 1:00 PM"
                className="neu-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.92rem', fontWeight: 600 }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                From: <strong>{liveStatus?.formattedLunchStart}</strong>
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                ☕ Daily Lunch Break End
              </label>
              <input
                type="text"
                name="lunchEnd"
                value={formData.lunchEnd}
                onChange={handleFormChange}
                placeholder="e.g. 14:00 or 2:00 PM"
                className="neu-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.92rem', fontWeight: 600 }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Until: <strong>{liveStatus?.formattedLunchEnd}</strong>
              </span>
            </div>
          </div>

          {/* Row 2: Working Days & Custom Announcement */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                📅 Working Days Description
              </label>
              <input
                type="text"
                name="workingDays"
                value={formData.workingDays}
                onChange={handleFormChange}
                placeholder="e.g. Monday – Saturday, Mon – Fri (Exam Weeks)"
                className="neu-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                📢 Special Public Note / Announcement (Optional)
              </label>
              <input
                type="text"
                name="statusMessage"
                value={formData.statusMessage}
                onChange={handleFormChange}
                placeholder="e.g. Store closing at 4:30 PM today for faculty meeting"
                className="neu-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--app-bg)', border: '1px solid var(--neu-border)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <input
              type="checkbox"
              id="allowOrdersCheckbox"
              name="allowOrdersWhenClosed"
              checked={formData.allowOrdersWhenClosed}
              onChange={handleFormChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary-blue)', cursor: 'pointer' }}
            />
            <label htmlFor="allowOrdersCheckbox" style={{ fontSize: '0.88rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              Allow students to place online orders even when retailer is at lunch or counter is away (pickup upon return)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              disabled={submitting}
            >
              {submitting ? 'Saving Manual Timings...' : 'Save All Manual Timings'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default StoreTimingManager;
