const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const { convertCurrency } = require('../services/currencyService');
const { extractReceiptData } = require('../services/ocrService');
const ApprovalService = require('../services/approvalService');
const { getDefaultWorkflow } = require('../services/workflowService');
const { detectAnomalies, checkDuplicateExpenses } = require('../services/fraudDetectionService');
const ApiError = require('../utils/apiError');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/receipts';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const createExpenseValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('expenseDate').isISO8601().withMessage('Valid date is required')
];

const uploadReceipt = async (req, res, next) => {
  upload.single('receipt')(req, res, async (err) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }

    if (!req.file) {
      return next(new ApiError(400, 'No file uploaded'));
    }

    try {
      // Generate file hash to check for duplicates
      const fileBuffer = fs.readFileSync(req.file.path);
      const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      
      // Check if this receipt hash already exists for this company
      const existingExpense = await Expense.findOne({
        company: req.user.company._id,
        receiptHash: fileHash
      });
      
      if (existingExpense) {
        // Delete the uploaded file since it's a duplicate
        fs.unlinkSync(req.file.path);
        return next(new ApiError(400, 'This receipt has already been uploaded. Please use a different receipt.'));
      }
      
      const extractedData = await extractReceiptData(req.file.path);
      
      // Log OCR results for debugging
      console.log('OCR Results:', extractedData);
      
      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          fileHash,
          extractedData
        }
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  });
};

const createExpense = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg));
    }

    const { amount, currency, category, description, expenseDate, receiptImageUrl, receiptHash, location } = req.body;

    // Convert currency if needed
    const defaultCurrency = req.user.company.defaultCurrency;
    let amountInDefaultCurrency = amount;
    
    if (currency !== defaultCurrency) {
      amountInDefaultCurrency = await convertCurrency(amount, currency, defaultCurrency);
    }

    // Create hierarchical workflow: Employee -> Manager -> Admin
    let workflow = null;
    let currentApproverIndex = 0;
    
    if (req.user.role === 'Employee' && req.user.manager) {
      // Employee with manager: Manager -> Admin
      const admin = await User.findOne({ company: req.user.company._id, role: 'Admin' });
      
      if (admin) {
        workflow = await Workflow.create({
          name: 'Hierarchical Approval',
          company: req.user.company._id,
          steps: [
            { stepNumber: 1, approver: req.user.manager },
            { stepNumber: 2, approver: admin._id }
          ],
          rules: { type: 'sequential' }
        });
      }
    } else if (req.user.role === 'Manager') {
      // Manager: Direct to Admin
      const admin = await User.findOne({ company: req.user.company._id, role: 'Admin' });
      
      if (admin) {
        workflow = await Workflow.create({
          name: 'Manager to Admin',
          company: req.user.company._id,
          steps: [
            { stepNumber: 1, approver: admin._id }
          ],
          rules: { type: 'sequential' }
        });
      }
    }

    const expenseData = {
      submittedBy: req.user._id,
      company: req.user.company._id,
      amount,
      currency,
      amountInDefaultCurrency,
      category,
      description,
      expenseDate: new Date(expenseDate),
      receiptImageUrl,
      receiptHash,
      location,
      workflow: workflow?._id,
      currentApproverIndex
    };

    const expense = await Expense.create(expenseData);

    // Run fraud detection
    const fraudAnalysis = await detectAnomalies(expense, req.user._id, req.user.company._id);
    const duplicates = await checkDuplicateExpenses(expense, req.user.company._id);

    // Update expense with fraud analysis
    expense.riskScore = fraudAnalysis.riskScore;
    expense.fraudFlags = fraudAnalysis.flags;
    expense.requiresReview = fraudAnalysis.requiresReview || duplicates !== null;
    
    if (duplicates) {
      expense.fraudFlags.push('POTENTIAL_DUPLICATE');
      expense.riskScore += 20;
    }

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('submittedBy', 'name email')
      .populate('workflow');

    res.status(201).json({
      success: true,
      data: { expense: populatedExpense }
    });
  } catch (error) {
    next(error);
  }
};

const getMyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ submittedBy: req.user._id })
      .populate('workflow', 'name')
      .populate('approvalHistory.approver', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { expenses }
    });
  } catch (error) {
    next(error);
  }
};

const getTeamExpenses = async (req, res, next) => {
  try {
    let employeeQuery = { company: req.user.company._id };
    
    // Managers can only see their department employees
    if (req.user.role === 'Manager') {
      employeeQuery.department = req.user.department;
      // Also exclude the manager themselves from the employee list
      employeeQuery._id = { $ne: req.user._id };
    } else if (req.user.role === 'Admin') {
      // Admin can see all employees and managers (but not other admins)
      employeeQuery.role = { $in: ['Employee', 'Manager'] };
    } else {
      // Regular employees shouldn't access this endpoint
      return next(new ApiError(403, 'Access denied'));
    }

    // Get team members
    const employees = await User.find(employeeQuery)
      .select('name email role department')
      .sort({ name: 1 });

    const employeeIds = employees.map(emp => emp._id);

    // Get expenses for team members
    const expenses = await Expense.find({ 
      submittedBy: { $in: employeeIds },
      company: req.user.company._id 
    })
    .populate('submittedBy', 'name email role department')
    .populate('workflow', 'name')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { 
        expenses,
        employees 
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPendingApprovals = async (req, res, next) => {
  try {
    let pendingExpenses = [];

    if (req.user.role === 'Admin') {
      // Admin sees expenses where they are the current approver
      const expenses = await Expense.find({
        company: req.user.company._id,
        status: 'Pending'
      })
      .populate('submittedBy', 'name email role')
      .populate('workflow')
      .populate('approvalHistory.approver', 'name email')
      .sort({ createdAt: -1 });
      
      // Filter expenses where admin is the current approver
      pendingExpenses = expenses.filter(expense => {
        if (!expense.workflow || !expense.workflow.steps) return false;
        const currentStep = expense.workflow.steps[expense.currentApproverIndex];
        return currentStep && currentStep.approver.toString() === req.user._id.toString();
      });
    } else if (req.user.role === 'Manager') {
      // Manager sees expenses from their direct reports (step 1)
      const directReports = await User.find({ manager: req.user._id }).distinct('_id');
      
      pendingExpenses = await Expense.find({
        company: req.user.company._id,
        status: 'Pending',
        submittedBy: { $in: directReports },
        currentApproverIndex: 0
      })
      .populate('submittedBy', 'name email role')
      .populate('workflow')
      .populate('approvalHistory.approver', 'name email')
      .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: { expenses: pendingExpenses }
    });
  } catch (error) {
    next(error);
  }
};

const updateExpenseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return next(new ApiError(400, 'Invalid status'));
    }

    if (status === 'Rejected' && !comment) {
      return next(new ApiError(400, 'Comment is required for rejection'));
    }

    const expense = await ApprovalService.processApproval(id, req.user._id, status, comment);
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('submittedBy', 'name email')
      .populate('workflow')
      .populate('approvalHistory.approver', 'name email');

    res.json({
      success: true,
      data: { expense: populatedExpense }
    });
  } catch (error) {
    next(error);
  }
};

const getCompanyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      company: req.user.company._id,
      status: 'Approved'
    })
    .populate('submittedBy', 'name email role')
    .populate('workflow', 'name')
    .populate('approvalHistory.approver', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { expenses }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadReceipt,
  createExpense,
  getMyExpenses,
  getTeamExpenses,
  getPendingApprovals,
  updateExpenseStatus,
  getCompanyExpenses,
  createExpenseValidation
};