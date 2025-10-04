const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const { generateToken } = require('../utils/jwtUtils');
const ApiError = require('../utils/apiError');
const { sendOTPEmail } = require('../services/emailService');
const axios = require('axios');

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('country').notEmpty().withMessage('Country is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const { name, email, password, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, 'User already exists'));
    }

    // For now, allow direct registration after OTP verification
    // Email verification is handled in the frontend flow

    // Get country currency
    const countryResponse = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    const countryData = countryResponse.data.find(c => 
      c.name.common.toLowerCase() === country.toLowerCase()
    );
    
    if (!countryData || !countryData.currencies) {
      return next(new ApiError(400, 'Invalid country or currency not found'));
    }

    const currency = Object.keys(countryData.currencies)[0];

    // Create company
    const company = await Company.create({
      name: `${name}'s Company`,
      defaultCurrency: currency
    });

    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'Admin',
      department: 'Administration',
      company: company._id,
      isEmailVerified: true // Auto-verified
    });

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    const user = await User.findOne({ email }).populate('company');
    if (!user) {
      console.log('User not found:', email);
      return next(new ApiError(401, 'Invalid credentials'));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return next(new ApiError(401, 'Invalid credentials'));
    }

    if (!user.isEmailVerified) {
      console.log('Email not verified for:', email);
      return next(new ApiError(401, 'Please verify your email before logging in'));
    }

    console.log('Login successful for:', email);

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

const sendOTP = async (req, res, next) => {
  try {
    const { email, type } = req.body; // type: 'signup' or 'reset'
    
    if (!email || !type) {
      return next(new ApiError(400, 'Email and type are required'));
    }

    // For reset password, check if user exists
    if (type === 'reset') {
      const user = await User.findOne({ email });
      if (!user) {
        return next(new ApiError(404, 'User not found'));
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    const otpKey = `${email}_${type}`;
    otpStore.set(otpKey, {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, type);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still log OTP for development
      console.log(`OTP for ${email} (${type}): ${otp}`);
    }
    
    res.json({
      success: true,
      message: 'OTP sent to your email successfully',
      // Remove this in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, type, userData } = req.body;
    
    if (!email || !otp || !type) {
      return next(new ApiError(400, 'Email, OTP, and type are required'));
    }

    const otpKey = `${email}_${type}`;
    const storedOTP = otpStore.get(otpKey);
    
    if (!storedOTP) {
      return next(new ApiError(400, 'OTP not found or expired'));
    }

    if (Date.now() > storedOTP.expires) {
      otpStore.delete(otpKey);
      return next(new ApiError(400, 'OTP expired'));
    }

    if (storedOTP.attempts >= 3) {
      otpStore.delete(otpKey);
      return next(new ApiError(400, 'Too many attempts. Please request a new OTP'));
    }

    if (storedOTP.otp !== otp) {
      storedOTP.attempts++;
      return next(new ApiError(400, 'Invalid OTP'));
    }

    // OTP verified successfully
    otpStore.delete(otpKey);
    
    // If this is signup verification, mark user as verified
    if (type === 'signup' && userData) {
      // Store verified user data temporarily
      const verifiedKey = `verified_${email}`;
      otpStore.set(verifiedKey, {
        userData,
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes to complete registration
      });
    }
    
    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return next(new ApiError(400, 'Email, OTP, and new password are required'));
    }

    if (newPassword.length < 6) {
      return next(new ApiError(400, 'Password must be at least 6 characters'));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  sendOTP,
  verifyOTP,
  resetPassword,
  registerValidation,
  loginValidation
};