const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const { generateToken } = require('../utils/jwtUtils');
const ApiError = require('../utils/apiError');
const axios = require('axios');

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
      company: company._id
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
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('company');
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

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

module.exports = {
  register,
  login,
  logout,
  registerValidation,
  loginValidation
};