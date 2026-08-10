import "./setup.js";
import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  addOrderItem,
  createOrder,
  getProduct,
  orderStatus,
  reserveStock,
  resetDb,
} from "./setup.js";
import { pool } from "../src/infrastructure/db.js";
import { confirmPayment, markPaymentFailed } from "../src/services/paymentService.js";

beforeEach(resetDb);

test("confirmPayment marks a pending order paid when amounts match", async () => {
  const order = await createOrder({ totalCents: 100000 });
  await confirmPayment(order.reference, 100000);
  assert.equal(await orderStatus(order.id), "paid");
});

test("confirmPayment is idempotent — a paid order is untouched", async () => {
  const order = await createOrder({ status: "paid", totalCents: 100000 });
  await confirmPayment(order.reference, 100000);
  assert.equal(await orderStatus(order.id), "paid");
});

test("confirmPayment fails and restocks on amount mismatch", async () => {
  const order = await createOrder({ totalCents: 100000 });
  const product = await getProduct("test-phone");
  await addOrderItem(order.id, {
    productId: product.id,
    quantity: 2,
    unitPriceCents: 100000,
  });
  await reserveStock(product.id, 2); // what checkout reserved

  await confirmPayment(order.reference, 99999);

  assert.equal(await orderStatus(order.id), "failed");
  const { rows } = await pool.query("SELECT stock FROM products WHERE id = $1", [
    product.id,
  ]);
  assert.equal(rows[0].stock, 5, "stock restored to original");
});

test("confirmPayment tolerates unknown references", async () => {
  await assert.doesNotReject(confirmPayment("order_unknown-ref", 100));
});

test("markPaymentFailed fails a pending order and restocks once", async () => {
  const order = await createOrder({});
  const product = await getProduct("test-phone");
  await addOrderItem(order.id, {
    productId: product.id,
    quantity: 2,
    unitPriceCents: 100000,
  });
  await reserveStock(product.id, 2);

  await markPaymentFailed(order.reference);
  assert.equal(await orderStatus(order.id), "failed");

  // Second call must not restock again
  await markPaymentFailed(order.reference);
  const { rows } = await pool.query("SELECT stock FROM products WHERE id = $1", [
    product.id,
  ]);
  assert.equal(rows[0].stock, 5, "no double restock");
});

test("markPaymentFailed leaves a paid order alone", async () => {
  const order = await createOrder({ status: "paid" });
  await markPaymentFailed(order.reference);
  assert.equal(await orderStatus(order.id), "paid");
});
