import { pool } from "#infrastructure/db.js";
import { confirmPayment, markPaymentFailed } from "#services/paymentService.js";
import {
  isValidWebhookSignature,
  verifyTransaction,
} from "#services/paystackService.js";

// Sends the customer to the order page. We serve a small HTML page instead of
// a bare 302 so the flow survives hostile redirect handling (e.g. ngrok-free's
// interstitial). The target is the absolute shop URL — SHOP_URL — because the
// verify endpoint lives on the API origin (:4000), and a relative /orders path
// would resolve back to :4000 (which has no such route).
function sendOrderRedirect(res, reference) {
  const target = `${process.env.SHOP_URL}/orders/${encodeURIComponent(reference)}`;
  res
    .status(200)
    .type("html")
    .send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Taking you to your order…</title>
  <meta http-equiv="refresh" content="0; url=${target}">
  <script>window.location.replace(${JSON.stringify(target)});</script>
</head>
<body style="font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #f9fafb; color: #111827;">
  <div style="text-align: center; padding: 2rem;">
    <p style="font-size: 1.25rem; font-weight: 600;">Payment received</p>
    <p style="color: #4b5563; margin: 0.5rem 0 1.5rem;">Taking you to your order…</p>
    <a href="${target}" style="color: #4f46e5;">If you are not redirected, tap here.</a>
  </div>
</body>
</html>`);
}

// ── Verify redirect ─────────────────────────────────────────────────────────
// Paystack redirects the customer's browser here after checkout.
// This is the synchronous path — the customer is watching.
// The webhook below is the authoritative async fallback.
export async function verifyPayment(req, res) {
  const { reference } = req.query;
  if (!reference) {
    return res.status(400).send("Missing reference");
  }

  // Check if we already have a result for this reference
  const { rows } = await pool.query(
    "SELECT status FROM orders WHERE paystack_reference = $1",
    [reference],
  );
  if (!rows[0]) {
    return res.status(404).send("Order not found");
  }

  // Only call Paystack if the order is still pending
  // (webhook may have already confirmed it)
  if (rows[0].status === "pending") {
    let transaction;
    try {
      transaction = await verifyTransaction(reference);
    } catch (err) {
      // Couldn't reach Paystack. Leave the order pending — the webhook or a
      // retry can still settle it. Redirect so the customer is never stuck.
      console.error(`Paystack verify failed for ${reference}:`, err.message);
      return sendOrderRedirect(res, reference);
    }

    if (transaction.status === "success") {
      await confirmPayment(reference, transaction.amount);
    } else if (["failed", "abandoned", "reversed"].includes(transaction.status)) {
      await markPaymentFailed(reference);
    }
    // Anything else (mobile money often reports 'pending'/'ongoing' at redirect
    // time) is still in flight — don't fail the order or touch stock yet;
    // the webhook settles it once the provider confirms.
  }

  // Always redirect to the order page — let the UI show the current status
  sendOrderRedirect(res, reference);
}

// Read-only status lookup for the order page, so a customer who lands on
// 'pending' (mobile money is often still in flight at redirect time) can poll
// instead of being told to guess.
export async function getOrderStatus(req, res) {
  const { rows } = await pool.query(
    "SELECT status FROM orders WHERE paystack_reference = $1",
    [req.params.reference],
  );

  if (!rows[0]) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json({ status: rows[0].status });
}

// ── Webhook ─────────────────────────────────────────────────────────────────
// Paystack sends this server-to-server, independently of the browser.
// Mounted with express.raw() in index.js so req.body is the raw Buffer
// needed for HMAC-SHA512 signature verification.
export async function handlePaystackWebhook(req, res) {
  const signature = req.headers["x-paystack-signature"];
  const rawBody = req.body; // Buffer, not parsed JSON

  if (!signature || !isValidWebhookSignature(rawBody, signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(rawBody.toString("utf8"));

  if (event.event === "charge.success") {
    await confirmPayment(event.data.reference, event.data.amount);
  }

  if (event.event === "charge.failed") {
    await markPaymentFailed(event.data.reference);
  }

  // Always return 200 — Paystack retries webhooks on non-200 responses
  res.json({ received: true });
}
