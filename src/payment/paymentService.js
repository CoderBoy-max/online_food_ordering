import { randomUUID } from 'node:crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import Payment from './paymentModel.js';

const PAYSTACK_API_URL = 'https://api.paystack.co';

const getPaystackSecret = () => {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) {
    throw new ApiError(503, 'Payment provider is not configured.');
  }
  return secret;
};

const requestPaystack = async (path, options = {}) => {
  const secret = getPaystackSecret();
  let response;
  try {
    response = await fetch(`${PAYSTACK_API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError(502, 'Unable to contact the payment provider.');
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(502, 'Payment provider returned an invalid response.');
  }

  if (!response.ok || body.status !== true) {
    throw new ApiError(502, body.message || 'Payment provider request failed.');
  }

  return body.data;
};

export const initializePayment = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  if (['cancelled', 'rejected'].includes(order.status)) {
    throw new ApiError(400, 'This order cannot be paid.');
  }

  const existingPaidPayment = await Payment.findOne({
    order: order._id,
    user: userId,
    status: 'paid',
  });
  if (existingPaidPayment) {
    throw new ApiError(409, 'This order has already been paid.');
  }

  const pendingPayment = await Payment.findOne({
    order: order._id,
    user: userId,
    status: 'pending',
  });
  if (pendingPayment) {
    if (pendingPayment.authorizationUrl) {
      return {
        payment: pendingPayment,
        authorizationUrl: pendingPayment.authorizationUrl,
      };
    }
    throw new ApiError(409, 'Payment checkout is already being initialized.');
  }

  if (!Number.isSafeInteger(order.total) || order.total <= 0) {
    throw new ApiError(400, 'Order total must be a positive whole number of naira.');
  }

  const amount = order.total * 100;
  if (!Number.isSafeInteger(amount)) {
    throw new ApiError(400, 'Order total is too large to process.');
  }

  const user = await User.findById(userId).select('email');
  if (!user?.email) {
    throw new ApiError(404, 'Customer account not found.');
  }

  const reference = `food_${randomUUID()}`;
  let payment;
  try {
    payment = await Payment.create({
      order: order._id,
      user: userId,
      amount,
      currency: 'NGN',
      method: 'paystack',
      reference,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'Payment checkout is already being initialized.');
    }
    throw error;
  }

  try {
    const data = await requestPaystack('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        amount,
        currency: 'NGN',
        reference,
        ...(process.env.PAYSTACK_CALLBACK_URL
          ? { callback_url: process.env.PAYSTACK_CALLBACK_URL }
          : {}),
        metadata: { orderId: order._id.toString() },
      }),
    });
    if (
      typeof data?.authorization_url !== 'string' ||
      data.reference !== reference
    ) {
      throw new ApiError(502, 'Payment provider returned incomplete checkout details.');
    }
    payment.authorizationUrl = data.authorization_url;
    await payment.save();
    return { payment, authorizationUrl: data.authorization_url };
  } catch (error) {
    await Payment.updateOne(
      { _id: payment._id, status: 'pending' },
      { $set: { status: 'failed', providerStatus: 'initialization_failed' } }
    );
    throw error;
  }
};

export const verifyPayment = async (reference, userId) => {
  const payment = await Payment.findOne({ reference, user: userId });
  if (!payment) {
    throw new ApiError(404, 'Payment not found.');
  }
  if (payment.status === 'paid') {
    return payment;
  }

  const data = await requestPaystack(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );

  if (
    data.reference !== payment.reference ||
    data.amount !== payment.amount ||
    data.currency !== payment.currency
  ) {
    throw new ApiError(502, 'Payment details did not match the provider verification.');
  }

  const status = data.status === 'success'
    ? 'paid'
    : ['failed', 'abandoned'].includes(data.status)
      ? 'failed'
      : 'pending';

  return Payment.findOneAndUpdate(
    { _id: payment._id },
    {
      $set: {
        status,
        providerStatus: data.status,
        paidAt: status === 'paid' ? new Date() : null,
      },
    },
    { new: true, runValidators: true }
  );
};
