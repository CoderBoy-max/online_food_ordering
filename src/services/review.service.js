import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import Review from '../models/Review.js';
import ApiError from '../utils/ApiError.js';

// Used when a restaurant has no reviews yet
export const noRating = { averageRating: null, reviewCount: 0 };

// A customer reviews one of their own delivered orders
export const createReview = async (userId, orderId, { rating, comment = '' }) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be a whole number from 1 to 5.');
  }

  if (typeof comment !== 'string' || comment.length > 500) {
    throw new ApiError(400, 'Comment must be text of 500 characters or less.');
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  if (String(order.user) !== String(userId)) {
    throw new ApiError(403, 'You can only review your own orders.');
  }

  if (order.status !== 'delivered') {
    throw new ApiError(400, 'Only delivered orders can be reviewed.');
  }

  const alreadyReviewed = await Review.findOne({ order: order._id });

  if (alreadyReviewed) {
    throw new ApiError(409, 'You have already reviewed this order.');
  }

  // The restaurant comes from the order, not from the request
  return Review.create({
    order: order._id,
    user: userId,
    restaurant: order.restaurant,
    rating,
    comment,
  });
};

// Reviews of one approved restaurant, newest first
export const getRestaurantReviews = async (restaurantId, page, limit) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    status: 'approved',
  });

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }

  const reviews = await Review.find({ restaurant: restaurant._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name'); // name only, never email or password

  const total = await Review.countDocuments({ restaurant: restaurant._id });
  const ratings = await getRatings([restaurant._id]);
  const rating = ratings[String(restaurant._id)] || noRating;

  return { reviews, total, page, limit, ...rating };
};

// Average rating and review count for a list of restaurants.
// Returns an object like { "<restaurantId>": { averageRating, reviewCount } }
export const getRatings = async (restaurantIds) => {
  const rows = await Review.aggregate([
    { $match: { restaurant: { $in: restaurantIds } } },
    {
      $group: {
        _id: '$restaurant',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const ratings = {};

  for (const row of rows) {
    ratings[String(row._id)] = {
      averageRating: Math.round(row.average * 10) / 10,
      reviewCount: row.count,
    };
  }

  return ratings;
};
