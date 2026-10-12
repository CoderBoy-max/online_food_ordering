import assert from "node:assert/strict";
import { test } from "node:test";
import Admin from "../src/admin/adminModel.js";
import { loginAdmin } from "../src/admin/adminController.js";

test("loginAdmin signs in a valid admin and returns a token", async (t) => {
  const originalFindOne = Admin.findOne;
  const originalJwtSecret = process.env.ADMIN_JWT_SECRET;
  const fakeAdmin = {
    _id: { toString: () => "admin-123" },
    email: "admin@example.com",
    role: "admin",
    isFounder: false,
    password: "hashed-password",
    comparePassword: async () => true,
  };

  Admin.findOne = async () => fakeAdmin;
  t.after(() => {
    Admin.findOne = originalFindOne;
    if (originalJwtSecret === undefined) {
      delete process.env.ADMIN_JWT_SECRET;
    } else {
      process.env.ADMIN_JWT_SECRET = originalJwtSecret;
    }
  });
  process.env.ADMIN_JWT_SECRET = "test-only-admin-jwt-secret";

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  await loginAdmin(
    {
      body: {
        email: "admin@example.com",
        password: "secret-password",
      },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.admin.email, "admin@example.com");
  assert.equal(res.body.admin.role, "admin");
  assert.equal(res.body.admin.password, undefined);
});
