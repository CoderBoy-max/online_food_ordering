import ApiError from '../utils/ApiError.js';

const isEmail = (v) => typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v);
const isPassword = (v) => typeof v === 'string' && v.length >= 6;

const check = (rules) => (req, res, next) => {
  const errors = rules(req.body);
  if (errors.length) return next(new ApiError(400, 'Validation failed', errors));
  next();
};

export const validateRegister = check(({ name, email, password, role }) => {
  const e = [];
  if (!name?.trim()) e.push('name is required');
  if (!isEmail(email)) e.push('a valid email is required');
  if (!isPassword(password)) e.push('password must be at least 6 characters');
  if (role && !['customer', 'owner'].includes(role)) e.push('role must be customer or owner');
  return e;
});

export const validateLogin = check(({ email, password }) => {
  const e = [];
  if (!isEmail(email)) e.push('a valid email is required');
  if (!password) e.push('password is required');
  return e;
});

export const validateUpdateMe = check(({ name, phone }) => {
  const e = [];
  if (name !== undefined && !String(name).trim()) e.push('name cannot be empty');
  if (phone !== undefined && !/^\+?\d{7,15}$/.test(phone)) e.push('phone must be 7 to 15 digits');
  return e;
});

export const validatePasswordChange = check(({ currentPassword, newPassword }) => {
  const e = [];
  if (!currentPassword) e.push('currentPassword is required');
  if (!isPassword(newPassword)) e.push('newPassword must be at least 6 characters');
  return e;
});