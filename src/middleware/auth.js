
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization ?? '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    throw new ApiError(401, 'Authorization token is required');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid or expired token');
    }
    throw error;
  }

  if (typeof payload !== 'object' || !payload.id) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.id);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid or inactive account');
  }

  req.user = user;
  next();
});

export { protect };
export default protect;
