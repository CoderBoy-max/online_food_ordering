
import Restaurant from '../models/Restaurant.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

// Create a restaurant
export const createRestaurant = asyncHandler(async (req, res) => {
  const { name, description, cuisine, phone, address, openHours } = req.body;

  if (!name || !cuisine || !phone || !address) {
    throw new ApiError(
      400,
      'Name, cuisine, phone, and address are required.'
    );
  }

  const restaurant = await Restaurant.create({
    owner: req.user._id,
    name,
    description,
    cuisine,
    phone,
    address,
    openHours,
  });

  return sendSuccess(
    res,
    restaurant,
    'Restaurant created successfully and is pending approval.',
    201
  );
});

// Get restaurants belonging to the logged-in owner
export const getMyRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({
    owner: req.user._id,
  });

  return sendSuccess(
    res,
    restaurants,
    'Your restaurants retrieved successfully.'
  );
});

/**
 * List approved restaurants for the public
 * Supports search, cuisine filtering, and pagination.
 */
export const getRestaurants = asyncHandler(async (req, res) => {
  const { q, cuisine } = req.query;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );

  const filter = { status: 'approved' };

  if (q) {
    filter.name = { $regex: q, $options: 'i' };
  }

  if (cuisine) {
    filter.cuisine = { $regex: cuisine, $options: 'i' };
  }

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .skip((page - 1) * limit)
      .limit(limit),
    Restaurant.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    restaurants,
    total,
    page,
    limit,
  }, 'Restaurants retrieved successfully.');
});

/**
 * Get details of one approved restaurant.
 */
export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({
    _id: req.params.id,
    status: 'approved',
  });

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }

  return sendSuccess(
    res,
    restaurant,
    'Restaurant retrieved successfully.'
  );
});

/**
 * Update a restaurant owned by the logged-in owner.
 */
export const updateRestaurant = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'description',
    'cuisine',
    'phone',
    'address',
    'openHours',
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update.');
  }

  const restaurant = await Restaurant.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user._id,
    },
    { $set: updates },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }

  return sendSuccess(
    res,
    restaurant,
    'Restaurant updated successfully.'
  );
});

/**
 * Open or close a restaurant.
 */
export const setRestaurantOpenStatus = asyncHandler(async (req, res) => {
  const { isOpen } = req.body;

  if (typeof isOpen !== 'boolean') {
    throw new ApiError(400, 'isOpen must be true or false.');
  }

  const restaurant = await Restaurant.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }

  if (isOpen && restaurant.status !== 'approved') {
    throw new ApiError(
      400,
      'Only approved restaurants can be opened.'
    );
  }

  restaurant.isOpen = isOpen;
  await restaurant.save();

  return sendSuccess(
    res,
    restaurant,
    `Restaurant ${isOpen ? 'opened' : 'closed'} successfully.`
  );
});
