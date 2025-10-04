const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return next(new ApiError(401, 'Access denied. No token provided.'));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).populate('company');
    
    if (!user) {
      return next(new ApiError(401, 'Invalid token.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid token.'));
  }
};

module.exports = authMiddleware;