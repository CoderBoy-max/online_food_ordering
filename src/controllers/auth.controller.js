import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.register(req.body), 'Account created', 201);
});

export const login = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.login(req.body), 'Login successful');
});