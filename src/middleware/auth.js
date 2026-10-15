import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const auth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Not logged in');

  let payload;
  try {
    payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isActive) throw new ApiError(401, 'User no longer valid');

  req.user = user;
  next();
});

export default auth;