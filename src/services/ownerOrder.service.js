
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import ApiError from '../utils/ApiError.js';
import {
  validateOrderStatusTransition,
} from './orderStatus.service.js';

export const getOwnerOrders = async (ownerId) => {
  const restaurants = await Restaurant.find({ owner: ownerId }).select('_id');
  const restaurantIds = restaurants.map((restaurant) => restaurant._id);

  return Order.find({ restaurant: { $in: restaurantIds } })
    .populate('user', 'name email')
    .populate('restaurant', 'name')
    .populate('address')
    .sort({ createdAt: -1 });
};

export const updateOwnerOrderStatus = async (
  ownerId,
  orderId,
  nextStatus
) => {
  const restaurants = await Restaurant.find({ owner: ownerId }).select('_id');
  const restaurantIds = restaurants.map((restaurant) => restaurant._id);

  const order = await Order.findOne({
    _id: orderId,
    restaurant: { $in: restaurantIds },
  });

  if (!order) {
    throw new ApiError(404, 'Order not found for your restaurant.');
  }

  validateOrderStatusTransition(order.status, nextStatus, 'owner');

  order.status = nextStatus;
  await order.save();

  return order;
};
