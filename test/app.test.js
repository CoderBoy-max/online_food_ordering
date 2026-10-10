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
    assert.deepEqual(await response.json(), { message: "Not found" });
});
