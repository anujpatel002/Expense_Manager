const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  rules: {
    type: {
      type: String,
      enum: ['sequential', 'percentage', 'specific_approver', 'hybrid'],
      default: 'sequential'
    },
    percentageApproval: {
      type: Number,
      min: 1,
      max: 100,
      default: null
    },
    specificApprover: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // For hybrid: percentage OR specific approver
    hybridOperator: {
      type: String,
      enum: ['OR', 'AND'],
      default: 'OR'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workflow', workflowSchema);