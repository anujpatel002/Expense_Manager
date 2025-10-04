const express = require('express');
const {
  uploadReceipt,
  createExpense,
  getMyExpenses,
  getTeamExpenses,
  getPendingApprovals,
  updateExpenseStatus,
  getCompanyExpenses,
  createExpenseValidation
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();

router.post('/upload-receipt', authMiddleware, uploadReceipt);
router.post('/', authMiddleware, createExpenseValidation, createExpense);
router.get('/my-expenses', authMiddleware, getMyExpenses);
router.get('/team-expenses', authMiddleware, getTeamExpenses);
router.get('/company-expenses', authMiddleware, adminMiddleware, getCompanyExpenses);
router.get('/pending-approval', authMiddleware, getPendingApprovals);
router.put('/:id/status', authMiddleware, updateExpenseStatus);

// Admin seed routes
router.post('/admin/seed-users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Import and run seeding logic directly
    const mongoose = require('mongoose');
    const User = require('../models/User');
    const Company = require('../models/Company');
    
    const company = await Company.findOne();
    if (!company) {
      return res.status(400).json({ success: false, error: 'No company found' });
    }

    // Clear existing users except admin
    await User.deleteMany({ company: company._id, role: { $ne: 'Admin' } });
    
    const departments = ['Finance', 'HR', 'IT', 'Marketing', 'Sales', 'Operations', 'Legal', 'R&D'];
    const indianNames = {
      Finance: {
        manager: { name: 'Rajesh Kumar', email: 'rajesh.kumar@company.com' },
        employees: [
          { name: 'Priya Sharma', email: 'priya.sharma@company.com' },
          { name: 'Amit Patel', email: 'amit.patel@company.com' }
        ]
      },
      HR: {
        manager: { name: 'Sunita Agarwal', email: 'sunita.agarwal@company.com' },
        employees: [
          { name: 'Arjun Mehta', email: 'arjun.mehta@company.com' },
          { name: 'Deepika Nair', email: 'deepika.nair@company.com' }
        ]
      },
      IT: {
        manager: { name: 'Suresh Krishnan', email: 'suresh.krishnan@company.com' },
        employees: [
          { name: 'Rahul Verma', email: 'rahul.verma@company.com' },
          { name: 'Pooja Bansal', email: 'pooja.bansal@company.com' }
        ]
      },
      Marketing: {
        manager: { name: 'Neha Kapoor', email: 'neha.kapoor@company.com' },
        employees: [
          { name: 'Varun Sinha', email: 'varun.sinha@company.com' },
          { name: 'Ishita Joshi', email: 'ishita.joshi@company.com' }
        ]
      },
      Sales: {
        manager: { name: 'Anil Thakur', email: 'anil.thakur@company.com' },
        employees: [
          { name: 'Ravi Dubey', email: 'ravi.dubey@company.com' },
          { name: 'Swati Goyal', email: 'swati.goyal@company.com' }
        ]
      },
      Operations: {
        manager: { name: 'Manoj Desai', email: 'manoj.desai@company.com' },
        employees: [
          { name: 'Sanjay Bhardwaj', email: 'sanjay.bhardwaj@company.com' },
          { name: 'Rekha Sood', email: 'rekha.sood@company.com' }
        ]
      },
      Legal: {
        manager: { name: 'Vinod Chandra', email: 'vinod.chandra@company.com' },
        employees: [
          { name: 'Kavita Sethi', email: 'kavita.sethi@company.com' },
          { name: 'Rajat Goel', email: 'rajat.goel@company.com' }
        ]
      },
      'R&D': {
        manager: { name: 'Dr. Ramesh Subramanian', email: 'ramesh.subramanian@company.com' },
        employees: [
          { name: 'Ankit Shukla', email: 'ankit.shukla@company.com' },
          { name: 'Tanvi Raghavan', email: 'tanvi.raghavan@company.com' }
        ]
      }
    };

    let totalCreated = 0;
    
    for (const department of departments) {
      const deptData = indianNames[department];
      
      // Create manager
      const manager = await User.create({
        name: deptData.manager.name,
        email: deptData.manager.email,
        password: 'password123',
        role: 'Manager',
        department: department,
        company: company._id,
        isEmailVerified: true
      });
      totalCreated++;

      // Create employees
      for (const empData of deptData.employees) {
        await User.create({
          name: empData.name,
          email: empData.email,
          password: 'password123',
          role: 'Employee',
          department: department,
          company: company._id,
          manager: manager._id,
          isEmailVerified: true
        });
        totalCreated++;
      }
    }
    
    res.json({ success: true, message: `Created ${totalCreated} users successfully` });
  } catch (error) {
    console.error('Seed users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/admin/seed-expenses', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const path = require('path');
    const scriptPath = path.join(__dirname, '..', 'scripts', 'seedExpenses.js');
    
    // Execute the seed script
    const { spawn } = require('child_process');
    const child = spawn('node', [scriptPath], {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        res.json({ success: true, message: 'Expenses seeded successfully' });
      } else {
        console.error('Seed expenses error:', errorOutput);
        res.status(500).json({ success: false, error: 'Failed to seed expenses' });
      }
    });
    
  } catch (error) {
    console.error('Seed expenses error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;