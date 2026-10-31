import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isSafeInteger,
    },
    currency: {
      type: String,
      enum: ['NGN'],
      default: 'NGN',
      required: true,
    },
    method: {
      type: String,
      enum: ['paystack'],
      default: 'paystack',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    authorizationUrl: {
      type: String,
      default: '',
    },
    providerStatus: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

paymentSchema.index(
  { order: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
