
import {
  getOwnerOrders,
  updateOwnerOrderStatus,
} from '../services/ownerOrder.service.js';

export const listOwnerOrders = async (req, res, next) => {
  try {
    const orders = await getOwnerOrders(req.user._id);

    return res.status(200).json({
      success: true,
      data: orders,
      message: 'Restaurant orders retrieved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const changeOwnerOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await updateOwnerOrderStatus(
      req.user._id,
      req.params.id,
      status
    );

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Order status updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
