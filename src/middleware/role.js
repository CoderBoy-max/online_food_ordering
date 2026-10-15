import ApiError from '../utils/ApiError.js';

export const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'Not allowed'));
  next();
};