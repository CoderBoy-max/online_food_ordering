import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as authService from '../services/authservice.js';

export const register = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.register(req.body), 'Account created', 201);
});

export const login = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.login(req.body), 'Login successful');
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user);
});

export const updateMe = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.updateProfile(req.user, req.body), 'Profile updated');
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  sendSuccess(res, null, 'Password changed');
});
