const { body, validationResult } = require('express-validator');
const Workflow = require('../models/Workflow');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const createWorkflowValidation = [
  body('name').notEmpty().withMessage('Workflow name is required'),
  body('steps').isArray({ min: 1 }).withMessage('At least one approval step is required')
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

    // Validate final approver if provided
    if (rules?.finalApprover) {
      const finalApprover = await User.findById(rules.finalApprover);
      if (!finalApprover || finalApprover.company.toString() !== req.user.company._id.toString()) {
        return next(new ApiError(400, 'Invalid final approver'));
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
      .populate('rules.finalApprover', 'name email role');

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
      .populate('rules.finalApprover', 'name email role')
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