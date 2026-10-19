
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

export const getCustomerOrders = async (userId) => {
  return Order.find({ user: userId })
    .populate('restaurant', 'name')
    .populate('address')
    .sort({ createdAt: -1 });
};

export const getCustomerOrderById = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })
    .populate('restaurant', 'name')
    .populate('address');

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  return order;
};
