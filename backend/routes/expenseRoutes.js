const express = require('express');
const {
  uploadReceipt,
  createExpense,
  getMyExpenses,
  getTeamExpenses,
  getPendingApprovals,
  updateExpenseStatus,
  getCompanyExpenses,
  createExpenseValidation
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/upload-receipt', authMiddleware, uploadReceipt);
router.post('/', authMiddleware, createExpenseValidation, createExpense);
router.get('/my-expenses', authMiddleware, getMyExpenses);
router.get('/team-expenses', authMiddleware, getTeamExpenses);
router.get('/company-expenses', authMiddleware, adminMiddleware, getCompanyExpenses);
router.get('/pending-approval', authMiddleware, getPendingApprovals);
router.put('/:id/status', authMiddleware, updateExpenseStatus);

module.exports = router;