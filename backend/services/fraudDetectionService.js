const Expense = require('../models/Expense');

const detectAnomalies = async (expense, userId, companyId) => {
  const flags = [];
  let riskScore = 0;

  // Get user's historical expenses
  const userExpenses = await Expense.find({
    submittedBy: userId,
    company: companyId,
    status: 'Approved',
    createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
  });

  // 1. Amount Anomaly Detection
  if (userExpenses.length > 0) {
    const amounts = userExpenses.map(e => e.amountInDefaultCurrency);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const maxAmount = Math.max(...amounts);
    
    // Flag if expense is 3x higher than average or 2x higher than previous max
    if (expense.amountInDefaultCurrency > avgAmount * 3) {
      flags.push('AMOUNT_ANOMALY_HIGH');
      riskScore += 30;
    }
    if (expense.amountInDefaultCurrency > maxAmount * 2) {
      flags.push('AMOUNT_SPIKE');
      riskScore += 25;
    }
  }

  // 2. Frequency Anomaly Detection
  const todayExpenses = await Expense.countDocuments({
    submittedBy: userId,
    company: companyId,
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
  });
  
  if (todayExpenses > 5) {
    flags.push('HIGH_FREQUENCY');
    riskScore += 20;
  }

  // 3. Weekend/Holiday Submission
  const expenseDate = new Date(expense.expenseDate);
  const dayOfWeek = expenseDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    flags.push('WEEKEND_EXPENSE');
    riskScore += 10;
  }

  // 4. Round Number Detection (potential fabrication)
  if (expense.amount % 10 === 0 && expense.amount >= 100) {
    flags.push('ROUND_AMOUNT');
    riskScore += 15;
  }

  // 5. Category Pattern Analysis
  const categoryExpenses = await Expense.find({
    submittedBy: userId,
    company: companyId,
    category: expense.category,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  if (categoryExpenses.length > 10) {
    flags.push('CATEGORY_OVERUSE');
    riskScore += 15;
  }

  return {
    riskScore: Math.min(riskScore, 100),
    flags,
    requiresReview: riskScore > 50
  };
};

const checkDuplicateExpenses = async (expense, companyId) => {
  const duplicates = await Expense.find({
    company: companyId,
    amount: { $gte: expense.amount - 1, $lte: expense.amount + 1 },
    category: expense.category,
    expenseDate: {
      $gte: new Date(expense.expenseDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      $lte: new Date(expense.expenseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    },
    _id: { $ne: expense._id }
  });

  return duplicates.length > 0 ? duplicates : null;
};

const analyzeUserBehavior = async (userId, companyId) => {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const userStats = await Expense.aggregate([
    {
      $match: {
        submittedBy: userId,
        company: companyId,
        createdAt: { $gte: last30Days }
      }
    },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: 1 },
        totalAmount: { $sum: '$amountInDefaultCurrency' },
        avgAmount: { $avg: '$amountInDefaultCurrency' },
        categories: { $addToSet: '$category' },
        weekendExpenses: {
          $sum: {
            $cond: [
              { $in: [{ $dayOfWeek: '$expenseDate' }, [1, 7]] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return userStats[0] || {};
};

module.exports = {
  detectAnomalies,
  checkDuplicateExpenses,
  analyzeUserBehavior
};