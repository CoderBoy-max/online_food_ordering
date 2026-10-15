import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as menuService from '../services/menu.service.js';

// Express 5 leaves req.body undefined when no body was sent.
const bodyOf = (req) => req.body ?? {};

export const getMenu = asyncHandler(async (req, res) => {
  const data = await menuService.getPublicMenu(req.params.id);
  sendSuccess(res, data);
});

export const createCategory = asyncHandler(async (req, res) => {
  const data = await menuService.createCategory(req.params.id, req.user, bodyOf(req));
  sendSuccess(res, data, 'Category created', 201);
});

export const renameCategory = asyncHandler(async (req, res) => {
  const data = await menuService.renameCategory(req.params.id, req.user, bodyOf(req));
  sendSuccess(res, data, 'Category renamed');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await menuService.deleteCategory(req.params.id, req.user);
  sendSuccess(res, null, 'Category deleted');
});

export const createMenuItem = asyncHandler(async (req, res) => {
  const data = await menuService.createMenuItem(req.params.id, req.user, bodyOf(req));
  sendSuccess(res, data, 'Menu item created', 201);
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const data = await menuService.updateMenuItem(req.params.id, req.user, bodyOf(req));
  sendSuccess(res, data, 'Menu item updated');
});

export const setAvailability = asyncHandler(async (req, res) => {
  const data = await menuService.setAvailability(req.params.id, req.user, bodyOf(req));
  sendSuccess(res, data, 'Availability updated');
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  await menuService.deleteMenuItem(req.params.id, req.user);
  sendSuccess(res, null, 'Menu item deleted');
});
