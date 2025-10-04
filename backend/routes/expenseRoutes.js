const express = require('express');
const {
  uploadReceipt,
  createExpense,
  getMyExpenses,
  getPendingApprovals,
  updateExpenseStatus,
  getCompanyExpenses,
  createExpenseValidation
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/upload-receipt', authMiddleware, uploadReceipt);
router.post('/', authMiddleware, createExpenseValidation, createExpense);
router.get('/my-expenses', authMiddleware, getMyExpenses);
router.get('/company-expenses', authMiddleware, getCompanyExpenses);
router.get('/pending-approval', authMiddleware, getPendingApprovals);
router.put('/:id/status', authMiddleware, updateExpenseStatus);

module.exports = router;