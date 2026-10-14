import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const protect = async (req, res, next) => {
  const authorization = req.headers.authorization ?? '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) return next(new ApiError(401, 'Authorization token is required'));
  if (!process.env.JWT_SECRET) {
    return next(new Error('JWT_SECRET is not configured'));
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    return next(error);
  }

  if (typeof payload !== 'object' || !payload.id) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isActive) {
    return next(new ApiError(401, 'Invalid or inactive account'));
  }

  req.user = user;
  return next();
};

export { protect };
export default protect;
