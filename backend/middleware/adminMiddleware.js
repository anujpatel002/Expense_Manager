const ApiError = require('../utils/apiError');

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return next(new ApiError(403, 'Access denied. Admin privileges required.'));
  }
  next();
};

module.exports = adminMiddleware;