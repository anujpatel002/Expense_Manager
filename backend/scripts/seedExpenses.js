const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Expense = require('../models/Expense');
require('dotenv').config();

const categories = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Training', 'Marketing', 'Equipment', 'Utilities', 'Maintenance'];

const expenseTemplates = {
  Finance: [
    { category: 'Software', description: 'Accounting software license', amount: [500, 2000] },
    { category: 'Training', description: 'Financial compliance training', amount: [300, 800] },
    { category: 'Office Supplies', description: 'Stationery and forms', amount: [50, 200] },
    { category: 'Travel', description: 'Client meeting travel', amount: [800, 3000] }
  ],
  HR: [
    { category: 'Training', description: 'HR certification course', amount: [400, 1200] },
    { category: 'Meals', description: 'Team lunch meeting', amount: [200, 600] },
    { category: 'Office Supplies', description: 'HR forms and materials', amount: [100, 300] },
    { category: 'Travel', description: 'Recruitment travel', amount: [500, 1500] }
  ],
  IT: [
    { category: 'Software', description: 'Development tools license', amount: [300, 1500] },
    { category: 'Equipment', description: 'Hardware components', amount: [1000, 5000] },
    { category: 'Training', description: 'Technical certification', amount: [500, 2000] },
    { category: 'Utilities', description: 'Cloud services', amount: [200, 800] }
  ],
  Marketing: [
    { category: 'Marketing', description: 'Digital advertising campaign', amount: [1000, 5000] },
    { category: 'Travel', description: 'Conference attendance', amount: [1500, 4000] },
    { category: 'Meals', description: 'Client entertainment', amount: [300, 1000] },
    { category: 'Equipment', description: 'Camera and recording equipment', amount: [800, 3000] }
  ],
  Sales: [
    { category: 'Travel', description: 'Client visit expenses', amount: [600, 2500] },
    { category: 'Meals', description: 'Business dinner with client', amount: [250, 800] },
    { category: 'Marketing', description: 'Sales materials printing', amount: [200, 600] },
    { category: 'Training', description: 'Sales skills workshop', amount: [400, 1000] }
  ],
  Operations: [
    { category: 'Maintenance', description: 'Equipment maintenance', amount: [500, 2000] },
    { category: 'Utilities', description: 'Facility utilities', amount: [300, 1200] },
    { category: 'Equipment', description: 'Operational tools', amount: [400, 1500] },
    { category: 'Office Supplies', description: 'General supplies', amount: [100, 400] }
  ],
  Legal: [
    { category: 'Training', description: 'Legal compliance seminar', amount: [600, 1500] },
    { category: 'Office Supplies', description: 'Legal documents and filing', amount: [150, 500] },
    { category: 'Travel', description: 'Court appearance travel', amount: [400, 1200] },
    { category: 'Software', description: 'Legal research database', amount: [800, 2500] }
  ],
  'R&D': [
    { category: 'Equipment', description: 'Research equipment', amount: [2000, 8000] },
    { category: 'Software', description: 'Research software license', amount: [1000, 3000] },
    { category: 'Training', description: 'Technical conference', amount: [800, 2500] },
    { category: 'Office Supplies', description: 'Lab supplies', amount: [300, 1000] }
  ]
};

const getRandomAmount = (range) => {
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
};

const getRandomDate = (startDate, endDate) => {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
};

const seedExpenses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const company = await Company.findOne();
    if (!company) {
      console.error('No company found.');
      return;
    }

    const users = await User.find({ company: company._id, role: { $ne: 'Admin' } });
    if (users.length === 0) {
      console.error('No users found. Please seed users first.');
      return;
    }

    await Expense.deleteMany({ company: company._id });
    console.log('Cleared existing expenses');

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const now = new Date();

    let totalExpenses = 0;

    for (const user of users) {
      const templates = expenseTemplates[user.department] || expenseTemplates['Operations'];
      const expenseCount = user.role === 'Manager' ? Math.floor(Math.random() * 15) + 20 : Math.floor(Math.random() * 10) + 15;

      for (let i = 0; i < expenseCount; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const amount = getRandomAmount(template.amount);
        const expenseDate = getRandomDate(oneYearAgo, now);
        
        const expense = await Expense.create({
          submittedBy: user._id,
          company: company._id,
          amount: amount,
          currency: company.defaultCurrency,
          amountInDefaultCurrency: amount,
          category: template.category,
          description: template.description,
          expenseDate: expenseDate,
          status: Math.random() > 0.1 ? 'Approved' : 'Pending',
          riskScore: Math.floor(Math.random() * 30),
          fraudFlags: [],
          requiresReview: false,
          createdAt: expenseDate
        });

        totalExpenses++;
      }

      console.log(`Created expenses for ${user.name} (${user.department})`);
    }

    console.log(`\nSeeding completed! Created ${totalExpenses} expenses for ${users.length} users.`);
    
  } catch (error) {
    console.error('Error seeding expenses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedExpenses();