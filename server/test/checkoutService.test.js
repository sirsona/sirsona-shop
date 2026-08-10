import "./setup.js";
import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { getProduct, resetDb } from "./setup.js";
import { pool } from "../src/infrastructure/db.js";
import { createCheckout } from "../src/services/checkoutService.js";

const PAYSTACK_OK = {
  ok: true,
  status: 200,
  json: async () => ({
    status: true,
    data: { authorization_url: "https://checkout.paystack.com/test", reference: "x" },
  }),
};

const PAYSTACK_ERROR = {
  ok: false,
  status: 400,
  json: async () => ({ status: false, message: "Paystack down" }),
};

const customer = {
  name: "Test Customer",
  email: "tester@example.com",
  phone: "+254700000000",
  address: "Mombasa",
};

beforeEach(resetDb);
afterEach(() => {
  delete globalThis.fetch;
});

test("creates an order, items and stock reservation", async () => {
  const product = await getProduct("test-phone");
  globalThis.fetch = async () => PAYSTACK_OK;

  const result = await createCheckout({
    items: [{ productId: product.id, quantity: 2 }],
    customer,
    paymentChannel: "mobile_money",
  });

  assert.ok(result.reference.startsWith("order_"));
  assert.equal(result.authorizationUrl, "https://checkout.paystack.com/test");

  const { rows: orders } = await pool.query(
    "SELECT status, total_cents FROM orders WHERE paystack_reference = $1",
    [result.reference],
  );
  assert.equal(orders.length, 1);
  assert.equal(orders[0].status, "pending");
  assert.equal(orders[0].total_cents, 200000);

  const { rows: items } = await pool.query(
    "SELECT quantity FROM order_items WHERE order_id = (SELECT id FROM orders WHERE paystack_reference = $1)",
    [result.reference],
  );
  assert.equal(items[0].quantity, 2);

  const { rows: stock } = await pool.query(
    "SELECT stock FROM products WHERE id = $1",
    [product.id],
  );
  assert.equal(stock[0].stock, 3, "stock decremented by 2");
});

test("rejects when stock is insufficient and writes nothing", async () => {
  const product = await getProduct("test-phone"); // stock 5
  globalThis.fetch = async () => PAYSTACK_OK;

  const result = await createCheckout({
    items: [{ productId: product.id, quantity: 6 }],
    customer,
    paymentChannel: "mobile_money",
  });

  assert.equal(result.httpStatus, 409);
  assert.match(result.error, /Not enough stock/);
  const { rows } = await pool.query("SELECT count(*)::int AS n FROM orders");
  assert.equal(rows[0].n, 0, "no order created");
});

test("marks the order failed and restocks when Paystack initialization fails", async () => {
  const product = await getProduct("test-phone");
  globalThis.fetch = async () => PAYSTACK_ERROR;

  await assert.rejects(
    createCheckout({
      items: [{ productId: product.id, quantity: 1 }],
      customer,
      paymentChannel: "mobile_money",
    }),
  );

  const { rows: orders } = await pool.query(
    "SELECT status FROM orders ORDER BY created_at DESC LIMIT 1",
  );
  assert.equal(orders[0].status, "failed");
  const { rows: stock } = await pool.query(
    "SELECT stock FROM products WHERE id = $1",
    [product.id],
  );
  assert.equal(stock[0].stock, 5, "stock restored");
});
