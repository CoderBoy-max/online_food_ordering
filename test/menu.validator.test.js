import assert from 'node:assert/strict';
import { test } from 'node:test';
import ApiError from '../src/utils/ApiError.js';
import {
  validateIdParam,
  validateCategory,
  validateCreateMenuItem,
  validateUpdateMenuItem,
  validateAvailability,
} from '../src/validators/menu.validator.js';

const ID = '507f1f77bcf86cd799439011';

// Runs a validator and returns the error it passed on (or undefined).
function run(validator, { body, params = {} } = {}) {
  const req = { body, params };
  let error;
  validator(req, {}, (err) => { error = err; });
  return { error, req };
}

test('id param: accepts a real id, rejects junk', () => {
  assert.equal(run(validateIdParam, { params: { id: ID } }).error, undefined);
  const { error } = run(validateIdParam, { params: { id: 'abc' } });
  assert.ok(error instanceof ApiError);
  assert.equal(error.statusCode, 400);
});

test('category: name required, trimmed, max 60', () => {
  assert.equal(run(validateCategory, { body: { name: 'Drinks' } }).error, undefined);
  assert.equal(run(validateCategory, { body: { name: '  Grills  ' } }).req.body.name, 'Grills');
  assert.equal(run(validateCategory, { body: { name: '   ' } }).error.statusCode, 400);
  assert.equal(run(validateCategory, { body: {} }).error.statusCode, 400);
  assert.equal(run(validateCategory, { body: { name: 'x'.repeat(61) } }).error.statusCode, 400);
});

test('missing body (Express 5 gives undefined) is a 400, not a crash', () => {
  assert.equal(run(validateCategory, { body: undefined }).error.statusCode, 400);
  assert.equal(run(validateCreateMenuItem, { body: undefined }).error.statusCode, 400);
  assert.equal(run(validateAvailability, { body: undefined }).error.statusCode, 400);
});

test('create item: valid body passes', () => {
  const body = { category: ID, name: 'Jollof Rice', price: 2500, description: 'Smoky', imageUrl: 'https://img.test/a.jpg' };
  assert.equal(run(validateCreateMenuItem, { body }).error, undefined);
});

test('create item: bad prices are rejected', () => {
  for (const price of [-1, 10.5, '2500', null, undefined, NaN]) {
    const { error } = run(validateCreateMenuItem, { body: { category: ID, name: 'Rice', price } });
    assert.equal(error?.statusCode, 400, `price ${String(price)} should be rejected`);
  }
  assert.equal(run(validateCreateMenuItem, { body: { category: ID, name: 'Free', price: 0 } }).error, undefined);
});

test('create item: bad category id, bad url and missing name are all reported together', () => {
  const { error } = run(validateCreateMenuItem, { body: { category: 'x', price: 100, imageUrl: 'ftp://nope' } });
  assert.equal(error.statusCode, 400);
  assert.equal(error.errors.length, 3);
});

test('update item: needs at least one field and checks the ones given', () => {
  assert.equal(run(validateUpdateMenuItem, { body: {} }).error.statusCode, 400);
  assert.equal(run(validateUpdateMenuItem, { body: { price: 3000 } }).error, undefined);
  assert.equal(run(validateUpdateMenuItem, { body: { price: 'free' } }).error.statusCode, 400);
  assert.equal(run(validateUpdateMenuItem, { body: { category: 'x' } }).error.statusCode, 400);
  assert.equal(run(validateUpdateMenuItem, { body: { name: '' } }).error.statusCode, 400);
});

test('availability: only true or false', () => {
  assert.equal(run(validateAvailability, { body: { isAvailable: false } }).error, undefined);
  for (const v of ['yes', 'true', 1, null, undefined]) {
    assert.equal(run(validateAvailability, { body: { isAvailable: v } }).error?.statusCode, 400);
  }
});
