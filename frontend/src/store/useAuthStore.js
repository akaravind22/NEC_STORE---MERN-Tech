import { create } from 'zustand';
import axios from 'axios';
import { useToastStore } from './useToastStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('nec_user')) || null,
  token: localStorage.getItem('nec_token') || null,
  isAuthenticated: !!localStorage.getItem('nec_token'),
  loading: false,
  theme: localStorage.getItem('nec_theme') || 'light',

  setTheme: (theme) => {
    localStorage.setItem('nec_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  // Axios instance helper
  getAxios: () => {
    const token = get().token;
    return axios.create({
      baseURL: API_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await get().getAxios().get('/auth/me');
      if (res.data.success) {
        set({ user: res.data.user, isAuthenticated: true });
        localStorage.setItem('nec_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      get().logout();
    }
  },

  sendOtp: async (email) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/auth/send-otp`, { email });
      set({ loading: false });
      useToastStore.getState().addToast(res.data.message, 'success');
      return { success: true, demoOtp: res.data.demoOtp };
    } catch (err) {
      set({ loading: false });
      const msg = err.response?.data?.message || 'Failed to send OTP code.';
      useToastStore.getState().addToast(msg, 'error');
      return { success: false, message: msg };
    }
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      const { token, user, message } = res.data;
      localStorage.setItem('nec_token', token);
      localStorage.setItem('nec_user', JSON.stringify(user));

      set({ token, user, isAuthenticated: true, loading: false });
      useToastStore.getState().addToast(message || 'Logged in successfully!', 'success');
      return { success: true, user };
    } catch (err) {
      set({ loading: false });
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      useToastStore.getState().addToast(msg, 'error');
      return { success: false, message: msg };
    }
  },

  register: async (formData) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      set({ loading: false });
      useToastStore.getState().addToast(res.data.message, 'success');
      return { success: true };
    } catch (err) {
      set({ loading: false });
      const msg = err.response?.data?.message || 'Registration failed.';
      useToastStore.getState().addToast(msg, 'error');
      return { success: false, message: msg };
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true });
    try {
      const res = await get().getAxios().put('/auth/profile', profileData);
      const updatedUser = res.data.user;
      localStorage.setItem('nec_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
      useToastStore.getState().addToast(res.data.message || 'Profile updated successfully!', 'success');
      return { success: true, user: updatedUser };
    } catch (err) {
      set({ loading: false });
      const msg = err.response?.data?.message || 'Failed to update profile.';
      useToastStore.getState().addToast(msg, 'error');
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('nec_token');
    localStorage.removeItem('nec_user');
    set({ token: null, user: null, isAuthenticated: false });
    useToastStore.getState().addToast('Logged out successfully.', 'info');
  }
}));
