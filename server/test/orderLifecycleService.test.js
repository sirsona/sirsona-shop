import "./setup.js";
import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  addOrderItem,
  createOrder,
  getProduct,
  reserveStock,
  resetDb,
} from "./setup.js";
import { pool } from "../src/infrastructure/db.js";
import { updateOrderStatus } from "../src/services/orderLifecycleService.js";

beforeEach(resetDb);

test("valid transition: paid → shipped → delivered", async () => {
  const order = await createOrder({ status: "paid" });
  assert.deepEqual(await updateOrderStatus(order.id, "shipped"), {
    status: "shipped",
  });
  assert.deepEqual(await updateOrderStatus(order.id, "delivered"), {
    status: "delivered",
  });
});

test("invalid transition is rejected with 409", async () => {
  const order = await createOrder({ status: "paid" });
  const result = await updateOrderStatus(order.id, "delivered");
  assert.equal(result.httpStatus, 409);
  assert.match(result.error, /Cannot move an order/);
});

test("cancelling a paid order restocks its items", async () => {
  const order = await createOrder({ status: "paid" });
  const product = await getProduct("test-phone");
  await addOrderItem(order.id, {
    productId: product.id,
    quantity: 2,
    unitPriceCents: 100000,
  });
  await reserveStock(product.id, 2);

  assert.deepEqual(await updateOrderStatus(order.id, "cancelled"), {
    status: "cancelled",
  });

  const { rows } = await pool.query("SELECT stock FROM products WHERE id = $1", [
    product.id,
  ]);
  assert.equal(rows[0].stock, 5, "stock restored on cancel");
});

test("unknown order returns 404", async () => {
  const result = await updateOrderStatus(
    "00000000-0000-0000-0000-000000000000",
    "shipped",
  );
  assert.equal(result.httpStatus, 404);
  assert.match(result.error, /Order not found/);
});

test("cancelling restores stock only once", async () => {
  const order = await createOrder({ status: "paid" });
  const product = await getProduct("test-phone");
  await addOrderItem(order.id, {
    productId: product.id,
    quantity: 2,
    unitPriceCents: 100000,
  });
  await reserveStock(product.id, 2);

  await updateOrderStatus(order.id, "cancelled");
  // cancelled → no further transitions allowed
  const second = await updateOrderStatus(order.id, "cancelled");
  assert.equal(second.httpStatus, 409);
  const { rows } = await pool.query("SELECT stock FROM products WHERE id = $1", [
    product.id,
  ]);
  assert.equal(rows[0].stock, 5, "stock restored exactly once");
});
