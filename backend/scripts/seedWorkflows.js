const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Workflow = require('../models/Workflow');
require('dotenv').config();

const seedWorkflows = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const company = await Company.findOne();
    if (!company) {
      console.error('No company found. Please create a company first.');
      return;
    }

    // Get users for workflow creation
    const cfo = await User.findOne({ company: company._id, email: 'rajesh.kumar@company.com' }); // Finance Manager as CFO
    const managers = await User.find({ company: company._id, role: 'Manager' });
    
    if (!cfo || managers.length === 0) {
      console.error('No managers found. Please seed users first.');
      return;
    }

    // Clear existing workflows
    await Workflow.deleteMany({ company: company._id });
    console.log('Cleared existing workflows');

    // 1. Sequential Workflow (Traditional)
    const sequentialWorkflow = await Workflow.create({
      name: 'Sequential Approval Workflow',
      company: company._id,
      steps: [
        { stepNumber: 1, approver: managers[0]._id }, // First manager
        { stepNumber: 2, approver: managers[1]._id }, // Second manager
        { stepNumber: 3, approver: cfo._id }          // CFO as final step
      ],
      rules: {
        type: 'sequential'
      }
    });
    console.log('Created Sequential Workflow');

    // 2. Percentage Rule Workflow (60% approval)
    const percentageWorkflow = await Workflow.create({
      name: '60% Approval Workflow',
      company: company._id,
      steps: managers.slice(0, 5).map((manager, index) => ({
        stepNumber: index + 1,
        approver: manager._id
      })),
      rules: {
        type: 'percentage',
        percentageApproval: 60
      }
    });
    console.log('Created 60% Percentage Workflow');

    // 3. Specific Approver Workflow (CFO auto-approval)
    const specificApproverWorkflow = await Workflow.create({
      name: 'CFO Auto-Approval Workflow',
      company: company._id,
      steps: managers.slice(0, 3).map((manager, index) => ({
        stepNumber: index + 1,
        approver: manager._id
      })),
      rules: {
        type: 'specific_approver',
        specificApprover: cfo._id
      }
    });
    console.log('Created CFO Auto-Approval Workflow');

    // 4. Hybrid Workflow (60% OR CFO approval)
    const hybridWorkflow = await Workflow.create({
      name: 'Hybrid: 60% OR CFO Approval',
      company: company._id,
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
    });
    console.log('Created Hybrid (60% OR CFO) Workflow');

    // 5. High Security Workflow (80% AND CFO approval)
    const highSecurityWorkflow = await Workflow.create({
      name: 'High Security: 80% AND CFO Approval',
      company: company._id,
      steps: managers.map((manager, index) => ({
        stepNumber: index + 1,
        approver: manager._id
      })),
      rules: {
        type: 'hybrid',
        percentageApproval: 80,
        specificApprover: cfo._id,
        hybridOperator: 'AND'
      }
    });
    console.log('Created High Security (80% AND CFO) Workflow');

    console.log(`\nWorkflow seeding completed! Created 5 different workflow types:`);
    console.log('1. Sequential Approval Workflow');
    console.log('2. 60% Approval Workflow');
    console.log('3. CFO Auto-Approval Workflow');
    console.log('4. Hybrid: 60% OR CFO Approval');
    console.log('5. High Security: 80% AND CFO Approval');
    
  } catch (error) {
    console.error('Error seeding workflows:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedWorkflows();