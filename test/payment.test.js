import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import app from '../src/app.js';
import { initializePayment, verifyPayment } from '../src/payment/paymentService.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Payment from '../src/payment/paymentModel.js';

test('payment initialization sends the order amount to Paystack in kobo', async (t) => {
  const originalOrderFindOne = Order.findOne;
  const originalUserFindById = User.findById;
  const originalPaymentFindOne = Payment.findOne;
  const originalPaymentCreate = Payment.create;
  const originalPaymentUpdateOne = Payment.updateOne;
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;
  let createData;

  t.after(() => {
    Order.findOne = originalOrderFindOne;
    User.findById = originalUserFindById;
    Payment.findOne = originalPaymentFindOne;
    Payment.create = originalPaymentCreate;
    Payment.updateOne = originalPaymentUpdateOne;
    globalThis.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalSecret;
  });

  process.env.PAYSTACK_SECRET_KEY = 'test-paystack-secret';
  Order.findOne = async () => ({
    _id: 'order-123',
    status: 'pending',
    total: 2599,
  });
  User.findById = () => ({
    select: async () => ({ email: 'customer@example.com' }),
  });
  Payment.findOne = async () => null;
  Payment.create = async (data) => {
    createData = data;
    return {
      ...data,
      _id: 'payment-123',
      save: async () => {},
    };
  };
  Payment.updateOne = async () => {};
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.paystack.co/transaction/initialize');
    assert.equal(options.headers.Authorization, 'Bearer test-paystack-secret');
    const payload = JSON.parse(options.body);
    assert.equal(payload.email, 'customer@example.com');
    assert.equal(payload.amount, 259900);
    assert.equal(payload.currency, 'NGN');
    assert.equal(payload.metadata.orderId, 'order-123');
    return {
      ok: true,
      json: async () => ({
        status: true,
        data: {
          authorization_url: 'https://checkout.paystack.com/test',
          reference: payload.reference,
        },
      }),
    };
  };

  const result = await initializePayment('order-123', 'user-123');

  assert.equal(createData.amount, 259900);
  assert.equal(createData.currency, 'NGN');
  assert.equal(result.payment.authorizationUrl, 'https://checkout.paystack.com/test');
  assert.equal(result.authorizationUrl, 'https://checkout.paystack.com/test');
});

test('payment verification marks a matching successful transaction as paid', async (t) => {
  const originalPaymentFindOne = Payment.findOne;
  const originalPaymentFindOneAndUpdate = Payment.findOneAndUpdate;
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;
  let update;

  t.after(() => {
    Payment.findOne = originalPaymentFindOne;
    Payment.findOneAndUpdate = originalPaymentFindOneAndUpdate;
    globalThis.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalSecret;
  });

  process.env.PAYSTACK_SECRET_KEY = 'test-paystack-secret';
  Payment.findOne = async () => ({
    _id: 'payment-123',
    reference: 'food_test-reference',
    amount: 259900,
    currency: 'NGN',
    status: 'pending',
  });
  Payment.findOneAndUpdate = async (filter, changes, options) => {
    update = { filter, changes, options };
    return { status: changes.$set.status, amount: 259900 };
  };
  globalThis.fetch = async (url) => {
    assert.equal(
      url,
      'https://api.paystack.co/transaction/verify/food_test-reference'
    );
    return {
      ok: true,
      json: async () => ({
        status: true,
        data: {
          reference: 'food_test-reference',
          amount: 259900,
          currency: 'NGN',
          status: 'success',
        },
      }),
    };
  };

  const result = await verifyPayment('food_test-reference', 'user-123');

  assert.equal(result.status, 'paid');
  assert.equal(update.changes.$set.providerStatus, 'success');
  assert.equal(update.options.new, true);
});

test('payment initialization reuses an existing pending checkout', async (t) => {
  const originalOrderFindOne = Order.findOne;
  const originalPaymentFindOne = Payment.findOne;
  const originalFetch = globalThis.fetch;

  t.after(() => {
    Order.findOne = originalOrderFindOne;
    Payment.findOne = originalPaymentFindOne;
    globalThis.fetch = originalFetch;
  });

  Order.findOne = async () => ({
    _id: 'order-123',
    status: 'pending',
    total: 2599,
  });
  const pendingPayment = {
    reference: 'food_existing-reference',
    authorizationUrl: 'https://checkout.paystack.com/existing',
  };
  Payment.findOne = async ({ status }) => (
    status === 'paid' ? null : pendingPayment
  );
  globalThis.fetch = async () => {
    assert.fail('Existing checkouts must not initialize a second transaction');
  };

  const result = await initializePayment('order-123', 'user-123');

  assert.equal(result.payment, pendingPayment);
  assert.equal(result.authorizationUrl, pendingPayment.authorizationUrl);
});

test('payment routes require a customer authentication token', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const address = server.address();
  const response = await fetch(
    `http://127.0.0.1:${address.port}/api/payments/initialize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: '0123456789abcdef01234567' }),
    }
  );

  assert.equal(response.status, 401);
  assert.equal((await response.json()).message, 'Authorization token is required');
});
