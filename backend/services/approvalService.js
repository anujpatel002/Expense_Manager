const Expense = require('../models/Expense');
const Workflow = require('../models/Workflow');

class ApprovalService {
  /**
   * Check if expense should be approved based on workflow rules
   */
  static async checkApprovalStatus(expenseId) {
    const expense = await Expense.findById(expenseId)
      .populate('workflow')
      .populate('approvalHistory.approver', 'name email role');

    if (!expense || !expense.workflow) {
      return { shouldApprove: false, reason: 'No workflow found' };
    }

    const workflow = expense.workflow;
    const approvalHistory = expense.approvalHistory.filter(h => h.status === 'Approved');

    switch (workflow.rules.type) {
      case 'percentage':
        return this.checkPercentageRule(workflow, approvalHistory);
      
      case 'specific_approver':
        return this.checkSpecificApproverRule(workflow, approvalHistory);
      
      case 'hybrid':
        return this.checkHybridRule(workflow, approvalHistory);
      
      case 'sequential':
      default:
        return this.checkSequentialRule(workflow, approvalHistory, expense.currentApproverIndex);
    }
  }

  /**
   * Percentage rule: If X% of approvers approve → Expense approved
   */
  static checkPercentageRule(workflow, approvalHistory) {
    const totalApprovers = workflow.steps.length;
    const approvedCount = approvalHistory.length;
    const requiredPercentage = workflow.rules.percentageApproval;
    
    if (!requiredPercentage || totalApprovers === 0) {
      return { shouldApprove: false, reason: 'Invalid percentage rule configuration' };
    }

    const currentPercentage = (approvedCount / totalApprovers) * 100;
    const shouldApprove = currentPercentage >= requiredPercentage;

    return {
      shouldApprove,
      reason: shouldApprove 
        ? `${currentPercentage.toFixed(1)}% approval reached (required: ${requiredPercentage}%)`
        : `${currentPercentage.toFixed(1)}% approval (required: ${requiredPercentage}%)`
    };
  }

  /**
   * Specific approver rule: If specific user approves → Expense auto-approved
   */
  static checkSpecificApproverRule(workflow, approvalHistory) {
    const specificApproverId = workflow.rules.specificApprover;
    
    if (!specificApproverId) {
      return { shouldApprove: false, reason: 'No specific approver configured' };
    }

    const specificApproverApproved = approvalHistory.some(
      h => h.approver._id.toString() === specificApproverId.toString()
    );

    return {
      shouldApprove: specificApproverApproved,
      reason: specificApproverApproved 
        ? 'Approved by specific approver'
        : 'Waiting for specific approver'
    };
  }

  /**
   * Hybrid rule: Combine percentage AND/OR specific approver
   */
  static checkHybridRule(workflow, approvalHistory) {
    const percentageResult = this.checkPercentageRule(workflow, approvalHistory);
    const specificResult = this.checkSpecificApproverRule(workflow, approvalHistory);
    const operator = workflow.rules.hybridOperator || 'OR';

    let shouldApprove;
    let reason;

    if (operator === 'OR') {
      shouldApprove = percentageResult.shouldApprove || specificResult.shouldApprove;
      reason = shouldApprove 
        ? (specificResult.shouldApprove ? specificResult.reason : percentageResult.reason)
        : `${percentageResult.reason} OR ${specificResult.reason}`;
    } else { // AND
      shouldApprove = percentageResult.shouldApprove && specificResult.shouldApprove;
      reason = shouldApprove 
        ? 'Both percentage and specific approver conditions met'
        : `${percentageResult.reason} AND ${specificResult.reason}`;
    }

    return { shouldApprove, reason };
  }

  /**
   * Sequential rule: Traditional step-by-step approval
   */
  static checkSequentialRule(workflow, approvalHistory, currentApproverIndex) {
    const totalSteps = workflow.steps.length;
    const approvedSteps = approvalHistory.length;
    
    const shouldApprove = approvedSteps >= totalSteps;
    
    return {
      shouldApprove,
      reason: shouldApprove 
        ? 'All sequential approvals completed'
        : `${approvedSteps}/${totalSteps} sequential approvals completed`
    };
  }

  /**
   * Process approval and update expense status
   */
  static async processApproval(expenseId, approverId, status, comment = '') {
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
      // Check if workflow exists and has steps
      if (expense.workflow && expense.workflow.steps && expense.workflow.steps.length > 0) {
        // Move to next step in sequential workflow
        expense.currentApproverIndex += 1;
        
        // Check if all steps are completed
        if (expense.currentApproverIndex >= expense.workflow.steps.length) {
          expense.status = 'Approved';
        }
      } else {
        // No workflow, approve directly
        expense.status = 'Approved';
      }
    }

    await expense.save();
    return expense;
  }
}

module.exports = ApprovalService;