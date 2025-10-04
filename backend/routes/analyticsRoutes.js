const express = require('express');
const {
  getBudgetForecast,
  getSeasonalAnalysis,
  getDepartmentAnalysis,
  getOptimizationRecommendations,
  getHeatmapData,
  getDashboardSummary
} = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// All analytics routes require authentication
router.use(authMiddleware);

// Dashboard summary for all users
router.get('/dashboard', getDashboardSummary);

// Detailed analytics - Admin and Manager only
router.get('/forecast', requireRole(['Admin', 'Manager']), getBudgetForecast);
router.get('/seasonal', requireRole(['Admin', 'Manager']), getSeasonalAnalysis);
router.get('/departments', requireRole(['Admin']), getDepartmentAnalysis);
router.get('/recommendations', requireRole(['Admin', 'Manager']), getOptimizationRecommendations);
router.get('/heatmap', requireRole(['Admin', 'Manager']), getHeatmapData);

module.exports = router;