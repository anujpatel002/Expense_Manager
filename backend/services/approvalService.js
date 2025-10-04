const Expense = require('../models/Expense');
const Workflow = require('../models/Workflow');

const processApproval = async (expenseId, approverId, status, comment = '') => {
  const expense = await Expense.findById(expenseId).populate('workflow');
  
  if (!expense) {
    throw new Error('Expense not found');
  }

  // Add to approval history
  expense.approvalHistory.push({
    approver: approverId,
    status,
    comment,
    approvedAt: new Date()
  });

  if (status === 'Rejected') {
    expense.status = 'Rejected';
  } else if (status === 'Approved') {
    const workflow = expense.workflow;
    
    // If no workflow or no rules, approve directly
    if (!workflow || !workflow.rules) {
      expense.status = 'Approved';
    } else {
      // Check if this meets final approval conditions
      if (workflow.rules.finalApprover && 
          approverId.toString() === workflow.rules.finalApprover.toString()) {
        expense.status = 'Approved';
      } else if (workflow.rules.percentageApproval) {
        const approvalCount = expense.approvalHistory.filter(h => h.status === 'Approved').length;
        const totalSteps = workflow.steps ? workflow.steps.length : 1;
        const approvalPercentage = (approvalCount / totalSteps) * 100;
        
        if (approvalPercentage >= workflow.rules.percentageApproval) {
          expense.status = 'Approved';
        }
      } else {
        // Move to next approver
        expense.currentApproverIndex += 1;
        
        // If no more approvers, approve the expense
        if (!workflow.steps || expense.currentApproverIndex >= workflow.steps.length) {
          expense.status = 'Approved';
        }
      }
    }
  }

  await expense.save();
  return expense;
};

const getDefaultWorkflow = async (companyId) => {
  return await Workflow.findOne({ company: companyId }).populate('steps.approver');
};

module.exports = {
  processApproval,
  getDefaultWorkflow
};