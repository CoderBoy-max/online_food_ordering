import ApiError from '../utils/ApiError.js';

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication is required'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You are not allowed to access this resource'));
  }
  return next();
};
