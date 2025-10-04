const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const verifyExistingUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all existing users to be email verified
    const result = await User.updateMany(
      { isEmailVerified: { $ne: true } },
      { $set: { isEmailVerified: true } }
    );

    console.log(`Updated ${result.modifiedCount} users to be email verified`);
    
  } catch (error) {
    console.error('Error verifying users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

verifyExistingUsers();