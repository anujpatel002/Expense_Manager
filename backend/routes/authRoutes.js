const express = require('express');
const { 
  register, 
  login, 
  logout, 
  sendOTP, 
  verifyOTP, 
  resetPassword,
  registerValidation, 
  loginValidation 
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;