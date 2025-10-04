const Expense = require('../models/Expense');
const User = require('../models/User');

const generateBudgetForecast = async (companyId, months = 3) => {
  const last12Months = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  
  const monthlyData = await Expense.aggregate([
    {
      $match: {
        company: companyId,
        status: 'Approved',
        createdAt: { $gte: last12Months }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalAmount: { $sum: '$amountInDefaultCurrency' },
        expenseCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Simple linear regression for forecasting
  const amounts = monthlyData.map(d => d.totalAmount);
  const avgGrowth = amounts.length > 1 ? 
    (amounts[amounts.length - 1] - amounts[0]) / amounts.length : 0;
  
  const forecast = [];
  const lastAmount = amounts[amounts.length - 1] || 0;
  
  for (let i = 1; i <= months; i++) {
    forecast.push({
      month: i,
      predictedAmount: Math.max(0, lastAmount + (avgGrowth * i)),
      confidence: Math.max(0.5, 1 - (i * 0.1)) // Decreasing confidence
    });
  }

  return { historical: monthlyData, forecast };
};

const getSeasonalTrends = async (companyId) => {
  const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  
  const seasonalData = await Expense.aggregate([
    {
      $match: {
        company: companyId,
        status: 'Approved',
        createdAt: { $gte: lastYear }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalAmount: { $sum: '$amountInDefaultCurrency' },
        expenseCount: { $sum: 1 },
        avgAmount: { $avg: '$amountInDefaultCurrency' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return seasonalData.map(data => ({
    month: monthNames[data._id - 1],
    totalAmount: data.totalAmount,
    expenseCount: data.expenseCount,
    avgAmount: data.avgAmount
  }));
};

const getDepartmentTrends = async (companyId) => {
  const last6Months = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  
  const departmentData = await Expense.aggregate([
    {
      $match: {
        company: companyId,
        status: 'Approved',
        createdAt: { $gte: last6Months }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'submittedBy',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: '$user.department',
        totalAmount: { $sum: '$amountInDefaultCurrency' },
        expenseCount: { $sum: 1 },
        avgAmount: { $avg: '$amountInDefaultCurrency' },
        categories: { $addToSet: '$category' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  return departmentData;
};

const getCostOptimizationRecommendations = async (companyId) => {
  const recommendations = [];
  const last3Months = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // 1. High-frequency vendor analysis
  const vendorAnalysis = await Expense.aggregate([
    {
      $match: {
        company: companyId,
        status: 'Approved',
        createdAt: { $gte: last3Months }
      }
    },
    {
      $group: {
        _id: '$description',
        totalAmount: { $sum: '$amountInDefaultCurrency' },
        frequency: { $sum: 1 }
      }
    },
    { $match: { frequency: { $gte: 5 } } },
    { $sort: { totalAmount: -1 } },
    { $limit: 5 }
  ]);

  vendorAnalysis.forEach(vendor => {
    if (vendor.totalAmount > 1000) {
      recommendations.push({
        type: 'VENDOR_NEGOTIATION',
        priority: 'HIGH',
        description: `Consider negotiating bulk rates with ${vendor._id}`,
        potentialSavings: vendor.totalAmount * 0.1,
        data: vendor
      });
    }
  });

  // 2. Category overspending
  const categorySpending = await Expense.aggregate([
    {
      $match: {
        company: companyId,
        status: 'Approved',
        createdAt: { $gte: last3Months }
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amountInDefaultCurrency' },
        avgAmount: { $avg: '$amountInDefaultCurrency' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  const totalSpending = categorySpending.reduce((sum, cat) => sum + cat.totalAmount, 0);
  
  categorySpending.forEach(category => {
    const percentage = (category.totalAmount / totalSpending) * 100;
    if (percentage > 30) {
      recommendations.push({
        type: 'CATEGORY_REVIEW',
        priority: 'MEDIUM',
        description: `${category._id} represents ${percentage.toFixed(1)}% of total spending`,
        potentialSavings: category.totalAmount * 0.05,
        data: category
      });
    }
  });

  return recommendations;
};

const getExpenseHeatmap = async (companyId) => {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const heatmapData = await Expense.aggregate([
    {
      $match: {
        company: companyId,
        status: 'Approved',
        createdAt: { $gte: last30Days }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'submittedBy',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: {
          department: '$user.department',
          category: '$category'
        },
        totalAmount: { $sum: '$amountInDefaultCurrency' },
        count: { $sum: 1 }
      }
    }
  ]);

  return heatmapData.map(item => ({
    department: item._id.department || 'Unknown',
    category: item._id.category,
    amount: item.totalAmount,
    count: item.count,
    intensity: Math.min(item.totalAmount / 1000, 10) // Scale for visualization
  }));
};

module.exports = {
  generateBudgetForecast,
  getSeasonalTrends,
  getDepartmentTrends,
  getCostOptimizationRecommendations,
  getExpenseHeatmap
};