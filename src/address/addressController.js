
import Address from '../models/Address.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

// Create a new address
export const createAddress = asyncHandler(async (req, res) => {
  const { label, street, city, notes } = req.body;

  if (!label || !street || !city) {
    throw new ApiError(
      400,
      'Label, street, and city are required.'
    );
  }

  const address = await Address.create({
    user: req.user._id,
    label,
    street,
    city,
    notes,
  });

  return sendSuccess(
    res,
    address,
    'Address created successfully.',
    201
  );
});

// List the logged-in user's addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({
    user: req.user._id,
  });

  return sendSuccess(
    res,
    addresses,
    'Addresses retrieved successfully.'
  );
});

// Update an address owned by the logged-in user
export const updateAddress = asyncHandler(async (req, res) => {
  const { label, street, city, notes } = req.body;

  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  if (label !== undefined) address.label = label;
  if (street !== undefined) address.street = street;
  if (city !== undefined) address.city = city;
  if (notes !== undefined) address.notes = notes;

  await address.save();

  return sendSuccess(
    res,
    address,
    'Address updated successfully.'
  );
});

// Delete an address owned by the logged-in user
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  return sendSuccess(
    res,
    null,
    'Address deleted successfully.'
  );
});
