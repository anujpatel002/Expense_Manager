const Workflow = require('../models/Workflow');

/**
 * Get default workflow for a company
 */
const getDefaultWorkflow = async (companyId) => {
  try {
    // Try to find an existing workflow for the company
    let workflow = await Workflow.findOne({ company: companyId });
    
    if (!workflow) {
      // Create a default sequential workflow if none exists
      workflow = await Workflow.create({
        name: 'Default Approval Workflow',
        company: companyId,
        steps: [], // Will be populated when managers are assigned
        rules: {
          type: 'sequential',
          percentageApproval: null,
          specificApprover: null,
          hybridOperator: 'OR'
        }
      });
    }
    
    return workflow;
  } catch (error) {
    console.error('Error getting default workflow:', error);
    return null;
  }
};

module.exports = {
  getDefaultWorkflow
};