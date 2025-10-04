const {
  generateBudgetForecast,
  getSeasonalTrends,
  getDepartmentTrends,
  getCostOptimizationRecommendations,
  getExpenseHeatmap
} = require('../services/analyticsService');
const ApiError = require('../utils/apiError');

const getBudgetForecast = async (req, res, next) => {
  try {
    const { months = 3 } = req.query;
    const forecast = await generateBudgetForecast(req.user.company._id, parseInt(months));
    
    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    next(error);
  }
};

const getSeasonalAnalysis = async (req, res, next) => {
  try {
    const trends = await getSeasonalTrends(req.user.company._id);
    
    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentAnalysis = async (req, res, next) => {
  try {
    const departments = await getDepartmentTrends(req.user.company._id);
    
    res.json({
      success: true,
      data: { departments }
    });
  } catch (error) {
    next(error);
  }
};

const getOptimizationRecommendations = async (req, res, next) => {
  try {
    const recommendations = await getCostOptimizationRecommendations(req.user.company._id);
    
    res.json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
};

const getHeatmapData = async (req, res, next) => {
  try {
    const heatmap = await getExpenseHeatmap(req.user.company._id);
    
    res.json({
      success: true,
      data: { heatmap }
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardSummary = async (req, res, next) => {
  try {
    const [forecast, trends, departments, recommendations, heatmap] = await Promise.all([
      generateBudgetForecast(req.user.company._id, 3),
      getSeasonalTrends(req.user.company._id),
      getDepartmentTrends(req.user.company._id),
      getCostOptimizationRecommendations(req.user.company._id),
      getExpenseHeatmap(req.user.company._id)
    ]);

    res.json({
      success: true,
      data: {
        forecast: forecast.forecast.slice(0, 1), // Next month only
        trends: trends.slice(-3), // Last 3 months
        topDepartments: departments.slice(0, 5),
        urgentRecommendations: recommendations.filter(r => r.priority === 'HIGH').slice(0, 3),
        heatmap: heatmap.slice(0, 20)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgetForecast,
  getSeasonalAnalysis,
  getDepartmentAnalysis,
  getOptimizationRecommendations,
  getHeatmapData,
  getDashboardSummary
};