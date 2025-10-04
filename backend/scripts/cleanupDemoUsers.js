const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const cleanupDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete manager and employee demo users
    const managerResult = await User.deleteOne({ email: 'anujvelani666@gmail.com' });
    const employeeResult = await User.deleteOne({ email: 'swaminarayan2181@gmail.com' });

    console.log(`Deleted manager user: ${managerResult.deletedCount > 0 ? 'Success' : 'Not found'}`);
    console.log(`Deleted employee user: ${employeeResult.deletedCount > 0 ? 'Success' : 'Not found'}`);

    console.log('Demo users cleanup completed');
  } catch (error) {
    console.error('Error cleaning up demo users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

cleanupDemoUsers();