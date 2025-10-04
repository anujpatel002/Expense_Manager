const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
require('dotenv').config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'rahul.verma@company.com' }).populate('company');
    
    if (user) {
      console.log('User found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Department:', user.department);
      console.log('Email Verified:', user.isEmailVerified);
      console.log('Company:', user.company?.name);
      
      // Test password
      const isPasswordValid = await user.comparePassword('password123');
      console.log('Password valid:', isPasswordValid);
    } else {
      console.log('User not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUser();