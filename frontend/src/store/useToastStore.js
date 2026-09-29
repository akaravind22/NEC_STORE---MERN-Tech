import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (messageOrObj, type = 'success', duration) => {
    const id = Date.now() + Math.random();
    
    // Safely handle both addToast(msg, type) and addToast({ message, type, title })
    let messageText = '';
    let toastType = type;

    if (typeof messageOrObj === 'object' && messageOrObj !== null) {
      messageText = messageOrObj.message || messageOrObj.title || 'Notification';
      toastType = messageOrObj.type || type || 'success';
    } else {
      messageText = String(messageOrObj || '');
      toastType = type;
    }

    // Normalize 'danger' to 'error'
    if (toastType === 'danger') toastType = 'error';

    set((state) => ({
      toasts: [...state.toasts, { id, message: String(messageText), type: toastType }]
    }));

    const displayDuration = duration || (toastType === 'info' || toastType === 'warning' ? 12000 : 4000);
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, displayDuration);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
