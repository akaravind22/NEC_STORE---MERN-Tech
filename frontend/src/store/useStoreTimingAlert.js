import { useEffect, useRef } from 'react';
import { useStoreTimingStore, playStoreChime, triggerDesktopNotification } from './useStoreTimingStore';
import { useToastStore } from './useToastStore';
import { useAuthStore } from './useAuthStore';

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const str = String(timeStr).trim().toUpperCase();
  const isPM = str.includes('PM');
  const isAM = str.includes('AM');
  const digits = str.replace(/[^0-9:]/g, '');
  const parts = digits.split(':').map(Number);
  let h = parts[0] || 0;
  const m = parts[1] || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
};

const formatMinutesTo12H = (totalMins) => {
  let h = Math.floor(totalMins / 60);
  const m = String(totalMins % 60).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return h + ':' + m + ' ' + ampm;
};

/**
 * Automated Store Opening and Closing Alert System for Retailers
 */
export const useStoreTimingAlert = () => {
  const {
    fetchSettings
  } = useStoreTimingStore();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const intervalRef = useRef(null);

  const isRetailer = user?.role === 'RETAILER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!isRetailer) return;

    fetchSettings();

    const checkTiming = () => {
      const state = useStoreTimingStore.getState();
      const currentSettings = state.settings;
      const leadTime = state.alertLeadTime || 15;
      const soundOn = state.alertSoundEnabled;
      const desktopOn = state.alertDesktopEnabled;

      const { openTime, closeTime } = currentSettings;
      if (!openTime || !closeTime) return;

      const openMins = parseTimeToMinutes(openTime);
      const closeMins = parseTimeToMinutes(closeTime);
      if (openMins === null || closeMins === null) return;

      const now = new Date();
      if (now.getDay() === 0) return;

      const currentMins = now.getHours() * 60 + now.getMinutes();
      const todayKey = now.toLocaleDateString('en-CA');

      // 1. NEAR OPENING ALERT
      const diffToOpen = openMins - currentMins;
      const openAlertKey = 'nec_open_alert_' + todayKey + '_' + leadTime;
      if (diffToOpen > 0 && diffToOpen <= leadTime && !sessionStorage.getItem(openAlertKey)) {
        sessionStorage.setItem(openAlertKey, '1');
        const formattedOpen = formatMinutesTo12H(openMins);
        const title = '🔔 Store Opens in ' + diffToOpen + ' Minute' + (diffToOpen === 1 ? '' : 's') + '!';
        const body = 'Store is scheduled to open at ' + formattedOpen + '. Get ready to open the counter and fulfill student pickups!';
        if (soundOn) playStoreChime('open');
        if (desktopOn) triggerDesktopNotification(title, body, 'nec-open-alert');
        addToast(title + ' (' + formattedOpen + ') - Prepare counter & check student orders.', 'info');
      }

      // 2. STORE EXACT OPEN TIME ALERT
      const exactOpenKey = 'nec_exact_open_' + todayKey;
      if (currentMins >= openMins && currentMins <= openMins + 2 && !sessionStorage.getItem(exactOpenKey)) {
        sessionStorage.setItem(exactOpenKey, '1');
        const title = '🏬 Store is Now Open!';
        const body = 'Store hours have officially started. Live ordering and counter pickups are active.';
        if (soundOn) playStoreChime('open');
        if (desktopOn) triggerDesktopNotification(title, body, 'nec-exact-open');
        addToast('🏬 Store is now officially open for business!', 'success');
      }

      // 3. NEAR CLOSING ALERT
      const diffToClose = closeMins - currentMins;
      const closeAlertKey = 'nec_close_alert_' + todayKey + '_' + leadTime;
      if (diffToClose > 0 && diffToClose <= leadTime && !sessionStorage.getItem(closeAlertKey)) {
        sessionStorage.setItem(closeAlertKey, '1');
        const formattedClose = formatMinutesTo12H(closeMins);
        const title = '⏰ Store Closes in ' + diffToClose + ' Minute' + (diffToClose === 1 ? '' : 's') + '!';
        const body = 'Store closing time is ' + formattedClose + '. Please wrap up pending order disbursements and reconcile registers.';
        if (soundOn) playStoreChime('close');
        if (desktopOn) triggerDesktopNotification(title, body, 'nec-close-alert');
        addToast(title + ' (' + formattedClose + ') - Wrap up pending disbursements & daily audit.', 'warning');
      }

      // 4. STORE EXACT CLOSE TIME ALERT
      const exactCloseKey = 'nec_exact_close_' + todayKey;
      if (currentMins >= closeMins && currentMins <= closeMins + 2 && !sessionStorage.getItem(exactCloseKey)) {
        sessionStorage.setItem(exactCloseKey, '1');
        const title = '🔒 Store Closing Time Reached';
        const body = 'Store hours have ended for today. Have a great evening!';
        if (soundOn) playStoreChime('close');
        if (desktopOn) triggerDesktopNotification(title, body, 'nec-exact-close');
        addToast('🔒 Store closing time reached. Counter closed for today.', 'info');
      }
    };

    checkTiming();
    intervalRef.current = setInterval(checkTiming, 15 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRetailer]);
};
