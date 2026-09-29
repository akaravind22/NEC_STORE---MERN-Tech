import { useEffect, useRef } from 'react';
import { useStoreTimingStore } from './useStoreTimingStore';
import { useToastStore } from './useToastStore';
import { useAuthStore } from './useAuthStore';

/**
 * Fires a toast notification to the retailer when:
 *  - Store is 15 minutes away from OPENING
 *  - Store is 15 minutes away from CLOSING
 * 
 * Runs a check every 60 seconds.
 * Each alert fires only ONCE per day (tracked in sessionStorage).
 */
export const useStoreTimingAlert = () => {
  const { settings, fetchSettings } = useStoreTimingStore();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const intervalRef = useRef(null);

  // Only run for retailers
  const isRetailer = user?.role === 'RETAILER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!isRetailer) return;

    // Fetch latest settings on mount
    fetchSettings();

    const checkTiming = () => {
      const { openTime, closeTime, status } = useStoreTimingStore.getState().settings;
      if (!openTime || !closeTime) return;
      if (status === 'FORCE_CLOSED' || status === 'FORCE_OPEN') return; // manual override, skip alerts

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      const [openH, openM] = openTime.split(':').map(Number);
      const [closeH, closeM] = closeTime.split(':').map(Number);
      const openMins = openH * 60 + openM;
      const closeMins = closeH * 60 + closeM;

      const ALERT_BEFORE = 15; // minutes before open/close to alert

      const todayKey = now.toLocaleDateString('en-CA'); // YYYY-MM-DD

      // ── Near Opening Alert ──
      const openAlertKey = `nec_open_alert_${todayKey}`;
      const diffToOpen = openMins - currentMins;
      if (diffToOpen > 0 && diffToOpen <= ALERT_BEFORE && !sessionStorage.getItem(openAlertKey)) {
        sessionStorage.setItem(openAlertKey, '1');
        const openFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
        addToast(
          `🔔 Store opens in ${diffToOpen} minute${diffToOpen === 1 ? '' : 's'} (at ${openTime.replace(':', ':')}). Get ready to open!`,
          'info'
        );
      }

      // ── Near Closing Alert ──
      const closeAlertKey = `nec_close_alert_${todayKey}`;
      const diffToClose = closeMins - currentMins;
      if (diffToClose > 0 && diffToClose <= ALERT_BEFORE && !sessionStorage.getItem(closeAlertKey)) {
        sessionStorage.setItem(closeAlertKey, '1');
        addToast(
          `⏰ Store closes in ${diffToClose} minute${diffToClose === 1 ? '' : 's'} (at ${closeTime.replace(':', ':')}). Wrap up pending orders!`,
          'warning'
        );
      }
    };

    // Run immediately on mount
    checkTiming();

    // Then check every 60 seconds
    intervalRef.current = setInterval(checkTiming, 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRetailer]);
};
