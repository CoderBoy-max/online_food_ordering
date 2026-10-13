import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as addressService from '../services/address.service.js';

// Create an address
export const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);

  sendSuccess(res, address, 'Address created successfully', 201);
});

// Get all addresses belonging to the logged-in user
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddressesByUser(req.user.id);

  sendSuccess(res, addresses, 'Addresses retrieved successfully');
});

// Update an address
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(
    req.user.id,
    req.params.id,
    req.body
  );

  sendSuccess(res, address, 'Address updated successfully');
});

// Delete an address
export const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(req.user.id, req.params.id);

  sendSuccess(res, null, 'Address deleted successfully');
});