
import {
  getCustomerOrders,
  getCustomerOrderById,
} from '../services/orderQuery.service.js';

import { cancelCustomerOrder } from '../services/order.service.js';

import { checkout } from '../services/order.service.js';

export const checkoutOrder = async (req, res, next) => {
  try {
    const order = await checkout(req.user._id, req.body);

    return res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully.',
    });
  } catch (error) {
    next(error);
  }
};


export const listCustomerOrders = async (req, res, next) => {
  try {
    const orders = await getCustomerOrders(req.user._id);

    return res.status(200).json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrder = async (req, res, next) => {
  try {
    const order = await getCustomerOrderById(
      req.user._id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Order retrieved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await cancelCustomerOrder(
      req.user._id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Order cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
};
