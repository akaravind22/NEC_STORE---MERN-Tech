import { create } from 'zustand';
import axios from 'axios';
import { useToastStore } from './useToastStore';
import { useAuthStore } from './useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Web Audio API synthesizer for clean, pleasant store chimes
 */
export const playStoreChime = (type = 'open') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    let frequencies = [523.25, 659.25, 783.99, 1046.50];
    if (type === 'close') {
      frequencies = [880.00, 739.99, 587.33, 523.25];
    } else if (type === 'test') {
      frequencies = [587.33, 880.00, 1174.66];
    }

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.13);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.13);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + idx * 0.13 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.13 + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.13);
      osc.stop(ctx.currentTime + idx * 0.13 + 0.45);
    });
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
};

/**
 * Browser Desktop Notification Dispatcher
 */
export const triggerDesktopNotification = (title, body, tag = 'nec-timing-alert') => {
  try {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag,
        silent: false
      });
      return true;
    }
  } catch (err) {
    console.warn('Desktop notification error:', err);
  }
  return false;
};

const getSavedLeadTime = () => {
  try {
    const val = localStorage.getItem('nec_alert_lead_time');
    return val ? parseInt(val, 10) : 15;
  } catch (e) {
    return 15;
  }
};

const getSavedSound = () => {
  try {
    return localStorage.getItem('nec_alert_sound') !== 'false';
  } catch (e) {
    return true;
  }
};

const getSavedDesktop = () => {
  try {
    return localStorage.getItem('nec_alert_desktop') !== 'false';
  } catch (e) {
    return true;
  }
};

export const useStoreTimingStore = create((set, get) => ({
  settings: {
    status: 'AUTO',
    statusMessage: '',
    openTime: '08:30',
    closeTime: '17:30',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    workingDays: 'Monday – Saturday',
    allowOrdersWhenClosed: true
  },
  liveStatus: {
    isOpen: true,
    effectiveStatus: 'OPEN',
    message: 'Store is Open (8:30 AM – 5:30 PM)',
    formattedOpen: '8:30 AM',
    formattedClose: '5:30 PM',
    formattedLunchStart: '1:00 PM',
    formattedLunchEnd: '2:00 PM',
    formattedLunchInterval: '1:00 PM – 2:00 PM',
    workingDays: 'Monday – Saturday',
    allowOrdersWhenClosed: true
  },
  loading: false,
  error: null,

  alertLeadTime: getSavedLeadTime(),
  alertSoundEnabled: getSavedSound(),
  alertDesktopEnabled: getSavedDesktop(),
  notificationPermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',

  setAlertLeadTime: (mins) => {
    try {
      localStorage.setItem('nec_alert_lead_time', String(mins));
    } catch (e) {}
    set({ alertLeadTime: mins });
    useToastStore.getState().addToast('Automatic alert lead time set to ' + mins + ' minutes before open & close.', 'info');
  },

  setAlertSoundEnabled: (enabled) => {
    try {
      localStorage.setItem('nec_alert_sound', String(enabled));
    } catch (e) {}
    set({ alertSoundEnabled: enabled });
    if (enabled) {
      playStoreChime('test');
    }
    useToastStore.getState().addToast('Audio chime reminder ' + (enabled ? 'enabled.' : 'muted.'), 'info');
  },

  setAlertDesktopEnabled: async (enabled) => {
    try {
      localStorage.setItem('nec_alert_desktop', String(enabled));
    } catch (e) {}
    set({ alertDesktopEnabled: enabled });
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        try {
          const perm = await Notification.requestPermission();
          set({ notificationPermission: perm });
          if (perm === 'granted') {
            useToastStore.getState().addToast('Desktop browser notifications granted!', 'success');
            triggerDesktopNotification('NEC Store Alerts Active', 'You will now receive desktop alerts before the store opens and closes.');
          } else {
            useToastStore.getState().addToast('Desktop notification permission was denied or dismissed.', 'warning');
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        useToastStore.getState().addToast('Desktop browser notifications active.', 'success');
      }
    } else {
      useToastStore.getState().addToast('Desktop notifications disabled.', 'info');
    }
  },

  requestDesktopPermission: async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    try {
      const perm = await Notification.requestPermission();
      set({ notificationPermission: perm });
      if (perm === 'granted') {
        try {
          localStorage.setItem('nec_alert_desktop', 'true');
        } catch (e) {}
        set({ alertDesktopEnabled: true });
        triggerDesktopNotification('NEC Store Notifications Active', 'You will receive alerts before store opening and closing.');
      }
      return perm;
    } catch (e) {
      console.error(e);
      return 'denied';
    }
  },

  testAlertChime: () => {
    playStoreChime('test');
    if (get().alertDesktopEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      triggerDesktopNotification('Test Store Timing Alert', 'This is a test notification for store opening/closing reminders.');
    }
    useToastStore.getState().addToast('Test alert chime played successfully!', 'success');
  },

  fetchSettings: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(API_URL + '/store-settings');
      if (res.data.success) {
        set({
          settings: res.data.settings,
          liveStatus: res.data.liveStatus,
          loading: false,
          error: null
        });
      }
    } catch (err) {
      console.error('Failed to fetch store timings:', err);
      set({ loading: false, error: err.message });
    }
  },

  updateSettings: async (updatedData) => {
    try {
      set({ loading: true });
      const authAxios = useAuthStore.getState().getAxios();
      const res = await authAxios.put('/store-settings', updatedData);
      if (res.data.success) {
        set({
          settings: res.data.settings,
          liveStatus: res.data.liveStatus,
          loading: false
        });
        useToastStore.getState().addToast('Campus operating schedule and operational status saved successfully.', 'success');
        return { success: true };
      }
    } catch (err) {
      set({ loading: false });
      const msg = err.response?.data?.message || 'Failed to update store timings.';
      useToastStore.getState().addToast(msg, 'error');
      return { success: false, message: msg };
    }
  },

  quickStatus: async (status, statusMessage = '') => {
    try {
      const authAxios = useAuthStore.getState().getAxios();
      const res = await authAxios.post('/store-settings/quick-status', {
        status,
        statusMessage
      });
      if (res.data.success) {
        set({
          settings: res.data.settings,
          liveStatus: res.data.liveStatus
        });
        useToastStore.getState().addToast(res.data.message || 'Store status changed.', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      useToastStore.getState().addToast(msg, 'error');
      return { success: false, message: msg };
    }
  }
}));
