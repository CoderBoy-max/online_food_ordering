import orderModel from '../models/order.js';
import Payment from '../models/paymentMethod.js';

const payForOrder = async (orderId, userId, options) => {
    // check if the order exists and belongs to the user
    const order = await orderModel.findOne({ _id: orderId, user: userId });
    if (!order) {
        throw new Error('Order not found or does not belong to the user');
    }
    if (['cancelled', 'rejected'].includes(order.status)) {
    throw new ApiError(400, 'This order cannot be paid');
    }
}