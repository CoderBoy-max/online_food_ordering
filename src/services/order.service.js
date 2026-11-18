
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Payment from '../models/paymentMethod.js';
import Cart from '../models/cartModel.js';
import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import Address from '../models/Address.js';
import ApiError from '../utils/ApiError.js';
import { clearCart } from './cartService.js';
import { validateOrderStatusTransition } from './orderStatus.service.js';

export const checkout = async (
  userId,
  { addressId, notes = '', paymentMethod }
) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw new ApiError(400, 'A valid delivery address is required.');
  }

  if (typeof paymentMethod !== 'string' || !paymentMethod.trim()) {
    throw new ApiError(400, 'A payment method is required.');
  }

  const address = await Address.findOne({ _id: addressId, user: userId });

  if (!address) {
    throw new ApiError(404, 'Delivery address not found.');
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your cart is empty.');
  }

  const restaurant = await Restaurant.findById(cart.restaurant);

  if (!restaurant || restaurant.status !== 'approved') {
    throw new ApiError(400, 'This restaurant is not approved.');
  }

  if (!restaurant.isOpen) {
    throw new ApiError(400, 'This restaurant is currently closed.');
  }

  const orderItems = [];
  let total = 0;

  for (const cartItem of cart.items) {
    const menuItem = await MenuItem.findOne({
      _id: cartItem.menuItem,
      restaurant: restaurant._id,
    });

    if (!menuItem || !menuItem.isAvailable) {
      throw new ApiError(
        400,
        'One or more cart items are no longer available.'
      );
    }

    const price = menuItem.price;
    const quantity = cartItem.quantity;

    orderItems.push({
      name: menuItem.name,
      price,
      quantity,
    });

    total += price * quantity;
  }

  const order = await Order.create({
    user: userId,
    restaurant: restaurant._id,
    address: address._id,
    items: orderItems,
    total,
    status: 'pending',
    notes,
  });

  try {
    await Payment.create({
      order: order._id,
      amount: total,
      method: paymentMethod.trim(),
      status: 'pending',
    });
  } catch (error) {
    await Order.deleteOne({ _id: order._id });
    throw error;
  }

  await clearCart(userId);

  return order;
};

export const cancelCustomerOrder = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  validateOrderStatusTransition(order.status, 'cancelled', 'customer');

  order.status = 'cancelled';
  await order.save();

  return order;
};

export default checkout;
