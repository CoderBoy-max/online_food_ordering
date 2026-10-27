import assert from 'node:assert/strict';
import { test, mock, afterEach } from 'node:test';
import Order from '../src/models/Order.js';
import Review from '../src/models/Review.js';
import Restaurant from '../src/models/Restaurant.js';
import { createReview, getRestaurantReviews, getRatings } from '../src/services/review.service.js';

afterEach(() => mock.restoreAll());

const ORDER_ID = '64b7f0c2a1b2c3d4e5f60718';
const USER_ID = 'user1';
const deliveredOrder = { _id: ORDER_ID, user: USER_ID, restaurant: 'rest1', status: 'delivered' };

test('rating must be a whole number from 1 to 5', async () => {
  for (const rating of [0, 6, 3.5, '4', undefined]) {
    await assert.rejects(createReview(USER_ID, ORDER_ID, { rating }), { statusCode: 400 });
  }
});

test('order must exist, belong to the user, and be delivered', async () => {
  mock.method(Order, 'findById', async () => null);
  await assert.rejects(createReview(USER_ID, ORDER_ID, { rating: 5 }), { statusCode: 404 });

  mock.method(Order, 'findById', async () => ({ ...deliveredOrder, user: 'someone-else' }));
  await assert.rejects(createReview(USER_ID, ORDER_ID, { rating: 5 }), { statusCode: 403 });

  mock.method(Order, 'findById', async () => ({ ...deliveredOrder, status: 'pending' }));
  await assert.rejects(createReview(USER_ID, ORDER_ID, { rating: 5 }), { statusCode: 400 });
});

test('a second review for the same order is rejected', async () => {
  mock.method(Order, 'findById', async () => deliveredOrder);
  mock.method(Review, 'findOne', async () => ({ _id: 'existing' }));
  await assert.rejects(createReview(USER_ID, ORDER_ID, { rating: 5 }), { statusCode: 409 });
});

test('the restaurant is taken from the order', async () => {
  mock.method(Order, 'findById', async () => deliveredOrder);
  mock.method(Review, 'findOne', async () => null);
  mock.method(Review, 'create', async (data) => data);

  const review = await createReview(USER_ID, ORDER_ID, { rating: 4, comment: 'Nice' });
  assert.equal(review.restaurant, 'rest1');
});

test('reviews of a missing or unapproved restaurant return 404', async () => {
  mock.method(Restaurant, 'findOne', async () => null);
  await assert.rejects(getRestaurantReviews(ORDER_ID, 1, 10), { statusCode: 404 });
});

test('average rating is rounded to one decimal', async () => {
  mock.method(Review, 'aggregate', async () => [{ _id: 'r1', average: 4.3333, count: 3 }]);
  const ratings = await getRatings(['r1']);
  assert.deepEqual(ratings.r1, { averageRating: 4.3, reviewCount: 3 });
});
