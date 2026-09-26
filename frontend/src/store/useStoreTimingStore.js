import { create } from 'zustand';
import axios from 'axios';
import { useToastStore } from './useToastStore';
import { useAuthStore } from './useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  fetchSettings: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(`${API_URL}/store-settings`);
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
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Store Timings Updated',
          message: 'Campus operating schedule and operational status saved successfully.'
        });
        return { success: true };
      }
    } catch (err) {
      set({ loading: false });
      const msg = err.response?.data?.message || 'Failed to update store timings.';
      useToastStore.getState().addToast({
        type: 'danger',
        title: 'Update Error',
        message: msg
      });
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
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Store Status Changed',
          message: res.data.message
        });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      useToastStore.getState().addToast({
        type: 'danger',
        title: 'Status Update Error',
        message: msg
      });
      return { success: false, message: msg };
    }
  }
}));
