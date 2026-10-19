import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import * as paymentService from './paymentService.js';

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export const initializePayment = asyncHandler(async (req, res) => {
  const orderId = req.body?.orderId;
  if (typeof orderId !== 'string' || !OBJECT_ID.test(orderId)) {
    throw new ApiError(400, 'A valid orderId is required.');
  }

  const { payment, authorizationUrl } = await paymentService.initializePayment(
    orderId,
    req.user._id
  );

  return sendSuccess(
    res,
    {
      reference: payment.reference,
      authorizationUrl,
      amount: payment.amount,
      currency: payment.currency,
    },
    'Payment initialized successfully.',
    201
  );
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyPayment(
    req.params.reference,
    req.user._id
  );
  return sendSuccess(res, payment, 'Payment status retrieved successfully.');
});
