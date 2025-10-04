const express = require('express');
const { createWorkflow, getWorkflows, createWorkflowValidation } = require('../controllers/workflowController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createWorkflowValidation, createWorkflow);
router.get('/', authMiddleware, adminMiddleware, getWorkflows);

module.exports = router;