import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  createReview,
  getRestaurantReviews as fetchRestaurantReviews,
} from '../services/review.service.js';

// POST /api/v1/orders/:id/review
export const createOrderReview = asyncHandler(async (req, res) => {
  const review = await createReview(req.user._id, req.params.id, req.body ?? {});

  return sendSuccess(res, review, 'Review submitted successfully.', 201);
});

// GET /api/restaurants/:id/reviews
export const getRestaurantReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const data = await fetchRestaurantReviews(req.params.id, page, limit);

  return sendSuccess(res, data, 'Reviews retrieved successfully.');
});
