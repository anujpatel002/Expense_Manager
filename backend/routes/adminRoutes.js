const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Workflow = require('../models/Workflow');

const departments = ['Finance', 'HR', 'IT', 'Marketing', 'Sales', 'Operations', 'Legal', 'R&D'];

const indianNames = {
  Finance: {
    manager: { name: 'Rajesh Kumar', email: 'rajesh.kumar@company.com' },
    employees: [
      { name: 'Priya Sharma', email: 'priya.sharma@company.com' },
      { name: 'Amit Patel', email: 'amit.patel@company.com' },
      { name: 'Sneha Gupta', email: 'sneha.gupta@company.com' },
      { name: 'Vikram Singh', email: 'vikram.singh@company.com' },
      { name: 'Kavya Reddy', email: 'kavya.reddy@company.com' },
      { name: 'Rohit Jain', email: 'rohit.jain@company.com' }
    ]
  },
  HR: {
    manager: { name: 'Sunita Agarwal', email: 'sunita.agarwal@company.com' },
    employees: [
      { name: 'Arjun Mehta', email: 'arjun.mehta@company.com' },
      { name: 'Deepika Nair', email: 'deepika.nair@company.com' },
      { name: 'Karan Malhotra', email: 'karan.malhotra@company.com' },
      { name: 'Ananya Iyer', email: 'ananya.iyer@company.com' },
      { name: 'Siddharth Rao', email: 'siddharth.rao@company.com' }
    ]
  },
  IT: {
    manager: { name: 'Suresh Krishnan', email: 'suresh.krishnan@company.com' },
    employees: [
      { name: 'Rahul Verma', email: 'rahul.verma@company.com' },
      { name: 'Pooja Bansal', email: 'pooja.bansal@company.com' },
      { name: 'Nikhil Chopra', email: 'nikhil.chopra@company.com' },
      { name: 'Ritu Saxena', email: 'ritu.saxena@company.com' },
      { name: 'Abhishek Tiwari', email: 'abhishek.tiwari@company.com' },
      { name: 'Meera Pillai', email: 'meera.pillai@company.com' },
      { name: 'Gaurav Bhatt', email: 'gaurav.bhatt@company.com' }
    ]
  },
  Marketing: {
    manager: { name: 'Neha Kapoor', email: 'neha.kapoor@company.com' },
    employees: [
      { name: 'Varun Sinha', email: 'varun.sinha@company.com' },
      { name: 'Ishita Joshi', email: 'ishita.joshi@company.com' },
      { name: 'Akash Pandey', email: 'akash.pandey@company.com' },
      { name: 'Shreya Mishra', email: 'shreya.mishra@company.com' },
      { name: 'Manish Agrawal', email: 'manish.agrawal@company.com' },
      { name: 'Divya Kulkarni', email: 'divya.kulkarni@company.com' }
    ]
  },
  Sales: {
    manager: { name: 'Anil Thakur', email: 'anil.thakur@company.com' },
    employees: [
      { name: 'Ravi Dubey', email: 'ravi.dubey@company.com' },
      { name: 'Swati Goyal', email: 'swati.goyal@company.com' },
      { name: 'Harsh Bhatia', email: 'harsh.bhatia@company.com' },
      { name: 'Nisha Arora', email: 'nisha.arora@company.com' },
      { name: 'Vishal Yadav', email: 'vishal.yadav@company.com' }
    ]
  },
  Operations: {
    manager: { name: 'Manoj Desai', email: 'manoj.desai@company.com' },
    employees: [
      { name: 'Sanjay Bhardwaj', email: 'sanjay.bhardwaj@company.com' },
      { name: 'Rekha Sood', email: 'rekha.sood@company.com' },
      { name: 'Ajay Khanna', email: 'ajay.khanna@company.com' },
      { name: 'Pallavi Dutta', email: 'pallavi.dutta@company.com' },
      { name: 'Deepak Mittal', email: 'deepak.mittal@company.com' },
      { name: 'Shilpa Bajaj', email: 'shilpa.bajaj@company.com' }
    ]
  },
  Legal: {
    manager: { name: 'Vinod Chandra', email: 'vinod.chandra@company.com' },
    employees: [
      { name: 'Kavita Sethi', email: 'kavita.sethi@company.com' },
      { name: 'Rajat Goel', email: 'rajat.goel@company.com' },
      { name: 'Smita Ghosh', email: 'smita.ghosh@company.com' },
      { name: 'Ashwin Menon', email: 'ashwin.menon@company.com' },
      { name: 'Preeti Kohli', email: 'preeti.kohli@company.com' }
    ]
  },
  'R&D': {
    manager: { name: 'Dr. Ramesh Subramanian', email: 'ramesh.subramanian@company.com' },
    employees: [
      { name: 'Ankit Shukla', email: 'ankit.shukla@company.com' },
      { name: 'Tanvi Raghavan', email: 'tanvi.raghavan@company.com' },
      { name: 'Sameer Bose', email: 'sameer.bose@company.com' },
      { name: 'Aditi Mukherjee', email: 'aditi.mukherjee@company.com' },
      { name: 'Karthik Venkatesh', email: 'karthik.venkatesh@company.com' },
      { name: 'Ritika Choudhary', email: 'ritika.choudhary@company.com' }
    ]
  }
};

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

// Seed Users
router.post('/seed-users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const company = req.user.company;
    
    await User.deleteMany({ company: company._id, role: { $ne: 'Admin' } });
    
    let totalCreated = 0;
    
    for (const department of departments) {
      const deptData = indianNames[department];
      
      const manager = await User.create({
        name: deptData.manager.name,
        email: deptData.manager.email,
        password: 'password123',
        role: 'Manager',
        department: department,
        company: company._id
      });
      
      totalCreated++;
      
      for (const empData of deptData.employees) {
        await User.create({
          name: empData.name,
          email: empData.email,
          password: 'password123',
          role: 'Employee',
          department: department,
          company: company._id,
          manager: manager._id
        });
        totalCreated++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully created ${totalCreated} users across ${departments.length} departments`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Seed Workflows
router.post('/seed-workflows', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const company = req.user.company;
    
    const cfo = await User.findOne({ company: company._id, email: 'rajesh.kumar@company.com' });
    const managers = await User.find({ company: company._id, role: 'Manager' });
    
    if (!cfo || managers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No managers found. Please seed users first.'
      });
    }
    
    await Workflow.deleteMany({ company: company._id });
    
    const workflows = [
      {
        name: 'Sequential Approval Workflow',
        steps: [managers[0], managers[1], cfo].map((user, index) => ({
          stepNumber: index + 1,
          approver: user._id
        })),
        rules: { type: 'sequential' }
      },
      {
        name: '60% Approval Workflow',
        steps: managers.slice(0, 5).map((manager, index) => ({
          stepNumber: index + 1,
          approver: manager._id
        })),
        rules: { type: 'percentage', percentageApproval: 60 }
      },
      {
        name: 'CFO Auto-Approval Workflow',
        steps: managers.slice(0, 3).map((manager, index) => ({
          stepNumber: index + 1,
          approver: manager._id
        })),
        rules: { type: 'specific_approver', specificApprover: cfo._id }
      },
      {
        name: 'Hybrid: 60% OR CFO Approval',
        steps: managers.slice(0, 4).map((manager, index) => ({
          stepNumber: index + 1,
          approver: manager._id
        })),
        rules: {
          type: 'hybrid',
          percentageApproval: 60,
          specificApprover: cfo._id,
          hybridOperator: 'OR'
        }
      }
    ];
    
    for (const workflowData of workflows) {
      await Workflow.create({
        ...workflowData,
        company: company._id
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully created ${workflows.length} workflows`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Seed Expenses
router.post('/seed-expenses', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const company = req.user.company;
    
    const users = await User.find({ company: company._id, role: { $ne: 'Admin' } });
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No users found. Please seed users first.'
      });
    }
    
    await Expense.deleteMany({ company: company._id });
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const now = new Date();
    
    let totalExpenses = 0;
    
    for (const user of users) {
      const templates = expenseTemplates[user.department] || expenseTemplates['Operations'];
      const expenseCount = user.role === 'Manager' ? Math.floor(Math.random() * 15) + 20 : Math.floor(Math.random() * 10) + 15;
      
      for (let i = 0; i < expenseCount; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const amount = Math.floor(Math.random() * (template.amount[1] - template.amount[0] + 1)) + template.amount[0];
        const expenseDate = new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
        
        await Expense.create({
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
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully created ${totalExpenses} expenses for ${users.length} users`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;