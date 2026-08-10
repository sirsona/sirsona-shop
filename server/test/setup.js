// MUST be the first import — sets env before db.js evaluates (no imports of
// its own, so nothing hoists ahead of it).
import "./env.js";

import { randomUUID } from "node:crypto";
import { after } from "node:test";
import { pool, query } from "../src/infrastructure/db.js";

// Hard guarantee: refuse to run anywhere but the test database. The test
// runner spawns a child process per file, so setup must be imported at the
// top of every test file — never rely on --import propagation alone.
const { rows: dbCheck } = await pool.query("SELECT current_database() AS db");
if (dbCheck[0].db !== "mctaba_shop_test") {
  throw new Error(
    `Refusing to run tests against "${dbCheck[0].db}" — expected mctaba_shop_test`,
  );
}

// ── DB helpers ─────────────────────────────────────────────────────────────

// Wipes all tables and reseeds a small product set. Call in beforeEach.
export async function resetDb() {
  await query("TRUNCATE messages, order_items, orders, products CASCADE");
  await query(
    `INSERT INTO products (slug, name, price_cents, stock, category) VALUES
       ('test-phone', 'Test Phone', 100000, 5, 'phones'),
       ('test-accessory', 'Test Accessory', 5000, 10, 'accessories'),
       ('test-low-stock', 'Low Stock Item', 20000, 1, 'accessories')`,
  );
}

export async function getProduct(slug) {
  const { rows } = await query("SELECT * FROM products WHERE slug = $1", [slug]);
  return rows[0];
}

export async function createOrder({
  status = "pending",
  totalCents = 100000,
  reference = `order_test_${randomUUID()}`,
} = {}) {
  const { rows } = await query(
    `INSERT INTO orders
       (paystack_reference, customer_email, customer_name, customer_phone,
        payment_channel, total_cents, status)
     VALUES ($1, 'tester@example.com', 'Test Customer', '+254700000000',
             'mobile_money', $2, $3)
     RETURNING id, paystack_reference`,
    [reference, totalCents, status],
  );
  return { id: rows[0].id, reference: rows[0].paystack_reference };
}

export async function addOrderItem(
  orderId,
  { productId, quantity = 1, unitPriceCents },
) {
  await query(
    `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
     VALUES ($1, $2, $3, $4)`,
    [orderId, productId, quantity, unitPriceCents],
  );
}

// Simulates the stock reservation checkout performs.
export async function reserveStock(productId, quantity) {
  await query("UPDATE products SET stock = stock - $1 WHERE id = $2", [
    quantity,
    productId,
  ]);
}

export async function orderStatus(orderId) {
  const { rows } = await query("SELECT status FROM orders WHERE id = $1", [
    orderId,
  ]);
  return rows[0]?.status;
}

// Safety net: any test that reaches the real Paystack API fails loudly
// instead of leaking a network call.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, ...rest) => {
  if (String(url).startsWith("https://api.paystack.co")) {
    throw new Error(
      `Unexpected real Paystack call in tests: ${url} — stub globalThis.fetch for this test`,
    );
  }
  if (originalFetch) return originalFetch(url, ...rest);
  return new Response("{}", { status: 200 });
};

export { pool };

// Close the pool when the suite finishes so the process can exit promptly.
after(() => pool.end());
