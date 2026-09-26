const { StoreSetting, User } = require('../models');

// Helper to format "13:00" to "1:00 PM"
const format12Hour = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
};

// Convert "HH:mm" to minutes from midnight
const toMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Calculate dynamic live status
const calculateLiveStatus = (setting) => {
  const now = new Date();
  // Get local IST or machine time
  const currentDay = now.getDay(); // 0 is Sunday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openMins = toMinutes(setting.openTime || '08:30');
  const closeMins = toMinutes(setting.closeTime || '17:30');
  const lunchStartMins = toMinutes(setting.lunchStart || '13:00');
  const lunchEndMins = toMinutes(setting.lunchEnd || '14:00');

  const formattedOpen = format12Hour(setting.openTime || '08:30');
  const formattedClose = format12Hour(setting.closeTime || '17:30');
  const formattedLunchStart = format12Hour(setting.lunchStart || '13:00');
  const formattedLunchEnd = format12Hour(setting.lunchEnd || '14:00');

  let effectiveStatus = setting.status || 'AUTO';
  let isOpen = true;
  let message = '';

  if (effectiveStatus === 'OPEN') {
    isOpen = true;
    message = setting.statusMessage || `Store is Open (${formattedOpen} – ${formattedClose})`;
  } else if (effectiveStatus === 'LUNCH_BREAK') {
    isOpen = false;
    message = setting.statusMessage || `Retailer is on Lunch Break (Returns at ${formattedLunchEnd})`;
  } else if (effectiveStatus === 'TEMPORARILY_CLOSED') {
    isOpen = false;
    message = setting.statusMessage || 'Retailer is temporarily away on campus work (Counter reopens shortly)';
  } else if (effectiveStatus === 'CLOSED') {
    isOpen = false;
    message = setting.statusMessage || `Store is currently Closed (Opens at ${formattedOpen})`;
  } else {
    // AUTO MODE
    if (currentDay === 0) {
      effectiveStatus = 'CLOSED';
      isOpen = false;
      message = 'Store is Closed on Sundays';
    } else if (currentMinutes >= lunchStartMins && currentMinutes < lunchEndMins) {
      effectiveStatus = 'LUNCH_BREAK';
      isOpen = false;
      message = `Retailer is on Lunch Break (Returns at ${formattedLunchEnd})`;
    } else if (currentMinutes >= openMins && currentMinutes < closeMins) {
      effectiveStatus = 'OPEN';
      isOpen = true;
      message = `Store is Open (${formattedOpen} – ${formattedClose})`;
    } else {
      effectiveStatus = 'CLOSED';
      isOpen = false;
      message = `Store is Closed (Opens at ${formattedOpen})`;
    }
  }

  return {
    isOpen,
    effectiveStatus,
    message,
    formattedOpen,
    formattedClose,
    formattedLunchStart,
    formattedLunchEnd,
    formattedLunchInterval: `${formattedLunchStart} – ${formattedLunchEnd}`,
    workingDays: setting.workingDays || 'Monday – Saturday',
    allowOrdersWhenClosed: setting.allowOrdersWhenClosed !== false
  };
};

// GET /api/store-settings (Public)
exports.getStoreSettings = async (req, res) => {
  try {
    let [setting] = await StoreSetting.findOrCreate({
      where: { id: 1 },
      defaults: {
        status: 'AUTO',
        statusMessage: '',
        openTime: '08:30',
        closeTime: '17:30',
        lunchStart: '13:00',
        lunchEnd: '14:00',
        workingDays: 'Monday – Saturday',
        allowOrdersWhenClosed: true
      },
      include: [{ model: User, as: 'updater', attributes: ['id', 'name', 'role'] }]
    });

    const liveStatus = calculateLiveStatus(setting);

    res.json({
      success: true,
      settings: setting,
      liveStatus
    });
  } catch (err) {
    console.error('Error fetching store settings:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve store settings.' });
  }
};

// PUT /api/store-settings (Retailer & Admin)
exports.updateStoreSettings = async (req, res) => {
  try {
    const {
      status,
      statusMessage,
      openTime,
      closeTime,
      lunchStart,
      lunchEnd,
      workingDays,
      allowOrdersWhenClosed
    } = req.body;

    let [setting] = await StoreSetting.findOrCreate({
      where: { id: 1 },
      defaults: {
        status: 'AUTO',
        statusMessage: '',
        openTime: '08:30',
        closeTime: '17:30',
        lunchStart: '13:00',
        lunchEnd: '14:00',
        workingDays: 'Monday – Saturday',
        allowOrdersWhenClosed: true
      }
    });

    if (status !== undefined) setting.status = status;
    if (statusMessage !== undefined) setting.statusMessage = statusMessage;
    if (openTime !== undefined) setting.openTime = openTime;
    if (closeTime !== undefined) setting.closeTime = closeTime;
    if (lunchStart !== undefined) setting.lunchStart = lunchStart;
    if (lunchEnd !== undefined) setting.lunchEnd = lunchEnd;
    if (workingDays !== undefined) setting.workingDays = workingDays;
    if (allowOrdersWhenClosed !== undefined) setting.allowOrdersWhenClosed = allowOrdersWhenClosed;

    setting.updatedBy = req.user.id;
    await setting.save();

    const updatedWithUser = await StoreSetting.findByPk(1, {
      include: [{ model: User, as: 'updater', attributes: ['id', 'name', 'role'] }]
    });

    const liveStatus = calculateLiveStatus(updatedWithUser);

    res.json({
      success: true,
      message: 'Store timings and operational status updated successfully.',
      settings: updatedWithUser,
      liveStatus
    });
  } catch (err) {
    console.error('Error updating store settings:', err);
    res.status(500).json({ success: false, message: 'Failed to update store settings.' });
  }
};

// POST /api/store-settings/quick-status (Retailer & Admin)
exports.quickStatusUpdate = async (req, res) => {
  try {
    const { status, statusMessage } = req.body;

    if (!['AUTO', 'OPEN', 'LUNCH_BREAK', 'TEMPORARILY_CLOSED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid store status provided.' });
    }

    let [setting] = await StoreSetting.findOrCreate({
      where: { id: 1 },
      defaults: {
        status: 'AUTO',
        statusMessage: '',
        openTime: '08:30',
        closeTime: '17:30',
        lunchStart: '13:00',
        lunchEnd: '14:00',
        workingDays: 'Monday – Saturday',
        allowOrdersWhenClosed: true
      }
    });

    setting.status = status;
    if (statusMessage !== undefined) {
      setting.statusMessage = statusMessage;
    }
    setting.updatedBy = req.user.id;
    await setting.save();

    const updatedWithUser = await StoreSetting.findByPk(1, {
      include: [{ model: User, as: 'updater', attributes: ['id', 'name', 'role'] }]
    });

    const liveStatus = calculateLiveStatus(updatedWithUser);

    res.json({
      success: true,
      message: `Store status changed to ${status}.`,
      settings: updatedWithUser,
      liveStatus
    });
  } catch (err) {
    console.error('Error in quick status update:', err);
    res.status(500).json({ success: false, message: 'Failed to update store status.' });
  }
};
