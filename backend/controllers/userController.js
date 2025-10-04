const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const createUserValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Employee', 'Manager']).withMessage('Role must be Employee or Manager')
];

const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        company: req.user.company,
        manager: req.user.manager
      }
    }
  });
};

const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const { name, email, password, role, manager } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, 'User already exists'));
    }

    // Validate manager if provided
    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser || managerUser.role !== 'Manager') {
        return next(new ApiError(400, 'Invalid manager'));
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      company: req.user.company._id,
      manager: manager || null
    });

    const populatedUser = await User.findById(user._id).populate('manager', 'name email');

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: populatedUser._id,
          name: populatedUser.name,
          email: populatedUser.email,
          role: populatedUser.role,
          manager: populatedUser.manager
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ company: req.user.company._id })
      .populate('manager', 'name email')
      .select('-password');

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  createUser,
  getUsers,
  createUserValidation
};