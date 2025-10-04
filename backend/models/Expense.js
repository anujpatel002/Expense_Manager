const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    minlength: 3,
    maxlength: 3
  },
  amountInDefaultCurrency: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  expenseDate: {
    type: Date,
    required: true
  },
  receiptImageUrl: {
    type: String,
    default: null
  },
  receiptHash: {
    type: String,
    default: null
  },
  riskScore: {
    type: Number,
    default: 0
  },
  fraudFlags: [{
    type: String
  }],
  requiresReview: {
    type: Boolean,
    default: false
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow'
  },
  approvalHistory: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Approved', 'Rejected']
    },
    comment: {
      type: String
    },
    approvedAt: {
      type: Date,
      default: Date.now
    }
  }],
  currentApproverIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);