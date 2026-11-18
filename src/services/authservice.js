
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
};

const signToken = (user, secret) =>
  jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const clean = (user) => {
  const { passwordHash, ...rest } = user.toObject();
  return rest;
};

export const register = async ({ name, email, password, phone, role }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required');
  }

  if (role && !['customer', 'owner'].includes(role)) {
    throw new ApiError(400, 'Role must be customer or owner');
  }

  const secret = getJwtSecret();

  if (await User.findOne({ email })) {
    throw new ApiError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, role, passwordHash });

  return { user: clean(user), token: signToken(user, secret) };
};

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  const secret = getJwtSecret();
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  return { user: clean(user), token: signToken(user, secret) };
};

export const updateProfile = async (user, { name, phone }) => {
  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();
  return clean(user);
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'currentPassword and newPassword are required');
  }

  const user = await User.findById(userId).select('+passwordHash');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is wrong');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
};
