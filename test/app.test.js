import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import app from "../src/app.js";

test("unknown routes return a JSON 404 response", async (t) => {
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");

    t.after(() => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    }));

    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/missing`);

    assert.equal(response.status, 404);
    assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
    assert.deepEqual(await response.json(), {
        success: false,
        message: "Route not found: GET /missing",
        errors: [],
    });
});

test("cart routes require authentication", async (t) => {
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");

    t.after(() => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    }));

    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/cart`);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
        success: false,
        message: "Authorization token is required",
        errors: [],
    });
});

test("address and restaurant owner routes require authentication", async (t) => {
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");

    t.after(() => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    }));

    const address = server.address();
    const requests = [
        ["GET", "/api/addresses"],
        ["GET", "/api/restaurants/mine"],
        ["POST", "/api/restaurants"],
        ["PUT", "/api/restaurants/restaurant-id"],
    ];

    for (const [method, path] of requests) {
        const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
            method,
        });

        assert.equal(response.status, 401, `${method} ${path}`);
        assert.equal((await response.json()).message, "Authorization token is required");
    }
});
