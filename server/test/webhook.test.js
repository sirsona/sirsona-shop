import "./setup.js";
import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createOrder, orderStatus, resetDb } from "./setup.js";
import { isValidWebhookSignature } from "../src/services/paystackService.js";

const SECRET = "sk_test_dummy_for_tests";
function sign(body) {
  return crypto
    .createHmac("sha512", SECRET)
    .update(body)
    .digest("hex");
}

// ── Signature unit tests ────────────────────────────────────────────────────

test("isValidWebhookSignature accepts a correctly signed body", () => {
  const body = JSON.stringify({ event: "charge.success" });
  assert.equal(isValidWebhookSignature(body, sign(body)), true);
});

test("isValidWebhookSignature rejects a tampered body", () => {
  const body = JSON.stringify({ event: "charge.success" });
  assert.equal(
    isValidWebhookSignature(
      JSON.stringify({ event: "charge.failed" }),
      sign(body),
    ),
    false,
  );
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

test("signed charge.success webhook settles the order", async () => {
  const order = await createOrder({ totalCents: 250000 });
  const body = JSON.stringify({
    event: "charge.success",
    data: { reference: order.reference, amount: 250000 },
  });

  const res = await fetch(`${base}/api/paystack/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": sign(body),
    },
    body,
  });

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { received: true });
  assert.equal(await orderStatus(order.id), "paid");
});

test("webhook with a bad signature is rejected with 401", async () => {
  const body = JSON.stringify({ event: "charge.success" });
  const res = await fetch(`${base}/api/paystack/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": "deadbeef",
    },
    body,
  });

  assert.equal(res.status, 401);
});

test("webhook with an unknown reference does not crash", async () => {
  const body = JSON.stringify({
    event: "charge.success",
    data: { reference: "order_unknown", amount: 100 },
  });

  const res = await fetch(`${base}/api/paystack/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": sign(body),
    },
    body,
  });

  assert.equal(res.status, 200);
});
