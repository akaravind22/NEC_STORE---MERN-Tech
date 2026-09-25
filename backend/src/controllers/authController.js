const jwt = require('jsonwebtoken');
const { User, OTPVerification, Notification } = require('../models');
const { sendOTPEmail } = require('../utils/mailer');
const { Op } = require('sequelize');

// Register user (Customer, Retailer, or Admin)
const register = async (req, res, next) => {
  try {
    const { name, email, rollNumber, department, phone, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required.' });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Validate role: Allow CUSTOMER, RETAILER, or ADMIN (default to CUSTOMER)
    const validRoles = ['CUSTOMER', 'RETAILER', 'ADMIN'];
    const assignedRole = validRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : 'CUSTOMER';

    // Check duplicate roll number / staff ID if provided
    if (rollNumber) {
      const existingRoll = await User.findOne({ where: { rollNumber } });
      if (existingRoll) {
        return res.status(409).json({
          success: false,
          message: `An account with this ${assignedRole === 'CUSTOMER' ? 'Roll Number' : 'Staff ID'} already exists.`
        });
      }
    }

    const user = await User.create({
      name,
      email,
      rollNumber: rollNumber || null,
      department: department || null,
      phone: phone || null,
      role: assignedRole,
      status: 'ACTIVE'
    });

    // Notify Admin of new registration
    await Notification.create({
      userId: null, // Broadcast to admins
      title: `New ${assignedRole === 'RETAILER' ? 'Retailer' : assignedRole === 'ADMIN' ? 'Admin' : 'Customer'} Registered`,
      message: `New ${assignedRole.toLowerCase()} account created for ${user.name} (${user.email}).`,
      type: 'USER_REGISTERED'
    });

    return res.status(201).json({
      success: true,
      message: `Registration successful! You can now log in to your ${assignedRole.toLowerCase()} account with your email OTP.`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Send OTP
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Account suspended. Please contact store administrator.' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate old OTPs for this email
    await OTPVerification.update({ isUsed: true }, { where: { email, isUsed: false } });

    await OTPVerification.create({
      email,
      otp,
      expiresAt,
      isUsed: false
    });

    await sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${email}. Valid for 5 minutes.`,
      // For instant testing in demo mode, output OTP in response
      demoOtp: process.env.DEMO_MODE === 'true' ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Account is suspended.' });
    }

    const record = await OTPVerification.findOne({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP verification code.' });
    }

    // Mark OTP as used
    record.isUsed = true;
    await record.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'nec_store_super_secret_jwt_key_2026_college_app',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login verification successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        department: user.department,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Update current user profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, rollNumber } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (rollNumber !== undefined) user.rollNumber = rollNumber;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        department: user.department,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile
};
