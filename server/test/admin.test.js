import "./setup.js";
import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  addOrderItem,
  createOrder,
  getProduct,
  orderStatus,
  reserveStock,
  resetDb,
} from "./setup.js";
import { requireAdmin } from "../src/middleware/requireAdmin.js";

// ── requireAdmin unit tests ─────────────────────────────────────────────────

function mockRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

test("requireAdmin rejects without a token", () => {
  const res = mockRes();
  let nextCalled = false;
  requireAdmin({ headers: {} }, res, () => (nextCalled = true));
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("requireAdmin rejects a wrong token", () => {
  const res = mockRes();
  requireAdmin(
    { headers: { authorization: "Bearer wrong-token" } },
    res,
    () => {},
  );
  assert.equal(res.statusCode, 401);
});

test("requireAdmin accepts the right token from the header", () => {
  const res = mockRes();
  let nextCalled = false;
  requireAdmin(
    { headers: { authorization: "Bearer test-admin-token" } },
    res,
    () => (nextCalled = true),
  );
  assert.equal(nextCalled, true);
});

test("requireAdmin accepts the right token from a cookie", () => {
  const res = mockRes();
  let nextCalled = false;
  requireAdmin(
    { headers: { cookie: "admin_token=test-admin-token" } },
    res,
    () => (nextCalled = true),
  );
  assert.equal(nextCalled, true);
});

// ── Endpoint tests (full app on an ephemeral port) ─────────────────────────

let server;
let base;

before(async () => {
  const { app } = await import("../src/index.js");
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://localhost:${server.address().port}`;
});

after(() => server?.close());

beforeEach(resetDb);

test("admin orders endpoint requires auth", async () => {
  const res = await fetch(`${base}/api/admin/orders`);
  assert.equal(res.status, 401);
});

test("admin orders endpoint works with the token", async () => {
  const res = await fetch(`${base}/api/admin/orders`, {
    headers: { Authorization: "Bearer test-admin-token" },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.orders));
});

test("PATCH status: valid transition through the endpoint", async () => {
  const order = await createOrder({ status: "paid" });
  const res = await fetch(`${base}/api/admin/orders/${order.reference}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer test-admin-token",
    },
    body: JSON.stringify({ status: "shipped" }),
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "shipped" });
  assert.equal(await orderStatus(order.id), "shipped");
});

test("PATCH status: invalid transition returns 409", async () => {
  const order = await createOrder({ status: "paid" });
  const res = await fetch(`${base}/api/admin/orders/${order.reference}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer test-admin-token",
    },
    body: JSON.stringify({ status: "delivered" }),
  });
  assert.equal(res.status, 409);
});

test("PATCH status: cancelling restocks through the endpoint", async () => {
  const order = await createOrder({ status: "paid" });
  const product = await getProduct("test-phone");
  await addOrderItem(order.id, {
    productId: product.id,
    quantity: 2,
    unitPriceCents: 100000,
  });
  await reserveStock(product.id, 2);

  const res = await fetch(`${base}/api/admin/orders/${order.reference}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer test-admin-token",
    },
    body: JSON.stringify({ status: "cancelled" }),
  });
  assert.equal(res.status, 200);

  const { rows } = await import("../src/infrastructure/db.js").then((m) =>
    m.pool.query("SELECT stock FROM products WHERE id = $1", [product.id]),
  );
  assert.equal(rows[0].stock, 5);
});
