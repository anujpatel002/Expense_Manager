const { body, validationResult } = require('express-validator');
const Workflow = require('../models/Workflow');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const createWorkflowValidation = [
  body('name').notEmpty().withMessage('Workflow name is required'),
  body('rules.type').isIn(['sequential', 'percentage', 'specific_approver', 'hybrid']).withMessage('Invalid rule type'),
  body('steps').custom((steps, { req }) => {
    const ruleType = req.body.rules?.type;
    if (ruleType === 'sequential' && (!steps || steps.length === 0)) {
      throw new Error('Sequential workflow requires at least one approval step');
    }
    if ((ruleType === 'percentage' || ruleType === 'hybrid') && (!steps || steps.length === 0)) {
      throw new Error('Percentage and hybrid workflows require at least one approval step');
    }
    return true;
  })
];

const createWorkflow = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const { name, steps, rules } = req.body;

    // Validate approvers exist and belong to company
    for (const step of steps) {
      if (step.approver) {
        const approver = await User.findById(step.approver);
        if (!approver || approver.company.toString() !== req.user.company._id.toString()) {
          return next(new ApiError(400, 'Invalid approver in workflow steps'));
        }
      }
    }

    // Validate specific approver if provided
    if (rules?.specificApprover) {
      const specificApprover = await User.findById(rules.specificApprover);
      if (!specificApprover || specificApprover.company.toString() !== req.user.company._id.toString()) {
        return next(new ApiError(400, 'Invalid specific approver'));
      }
    }

    // Validate percentage rule
    if (rules?.type === 'percentage' || rules?.type === 'hybrid') {
      if (!rules.percentageApproval || rules.percentageApproval < 1 || rules.percentageApproval > 100) {
        return next(new ApiError(400, 'Percentage approval must be between 1 and 100'));
      }
    }

    // Validate specific approver rule
    if (rules?.type === 'specific_approver' || rules?.type === 'hybrid') {
      if (!rules.specificApprover) {
        return next(new ApiError(400, 'Specific approver is required for this rule type'));
      }
    }

    const workflow = await Workflow.create({
      name,
      company: req.user.company._id,
      steps: steps.map((step, index) => ({
        stepNumber: index + 1,
        approver: step.approver
      })),
      rules: rules || {}
    });

    const populatedWorkflow = await Workflow.findById(workflow._id)
      .populate('steps.approver', 'name email role')
      .populate('rules.specificApprover', 'name email role');

    res.status(201).json({
      success: true,
      data: { workflow: populatedWorkflow }
    });
  } catch (error) {
    next(error);
  }
};

const getWorkflows = async (req, res, next) => {
  try {
    const workflows = await Workflow.find({ company: req.user.company._id })
      .populate('steps.approver', 'name email role')
      .populate('rules.specificApprover', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { workflows }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkflow,
  getWorkflows,
  createWorkflowValidation
};