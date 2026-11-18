import assert from 'node:assert/strict';
import { test } from 'node:test';
import { register } from '../src/services/authservice.js';

test('registration fails clearly before writing a user without JWT_SECRET', async () => {
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  try {
    await assert.rejects(
      register({ name: 'Test User', email: 'test@example.com', password: 'password' }),
      /JWT_SECRET is not configured/
    );
  } finally {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }
});
