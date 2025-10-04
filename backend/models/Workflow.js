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
    percentageApproval: {
      type: Number,
      min: 1,
      max: 100,
      default: null
    },
    finalApprover: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workflow', workflowSchema);