const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Expense = require('../models/Expense');
const Workflow = require('../models/Workflow');
require('dotenv').config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all data from all collections
    await User.deleteMany({});
    console.log('Cleared all users');

    await Company.deleteMany({});
    console.log('Cleared all companies');

    await Expense.deleteMany({});
    console.log('Cleared all expenses');

    await Workflow.deleteMany({});
    console.log('Cleared all workflows');

    console.log('Database completely cleared!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

clearDatabase();