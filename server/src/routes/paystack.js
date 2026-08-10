import {
  getOrderStatus,
  handlePaystackWebhook,
  verifyPayment,
} from "#controllers/paystackController.js";
import { asyncHandler } from "#middleware/asyncHandler.js";
import { Router } from "express";

export const paystackRouter = Router();

// ── Verify redirect ─────────────────────────────────────────────────────────
// Paystack redirects the customer's browser here after checkout.
// This is the synchronous path — the customer is watching.
// The webhook below is the authoritative async fallback.
paystackRouter.get("/verify", asyncHandler(verifyPayment));

// Read-only status lookup for the order page's poller.
paystackRouter.get("/status/:reference", asyncHandler(getOrderStatus));

// ── Webhook ─────────────────────────────────────────────────────────────────
// Paystack sends this server-to-server, independently of the browser.
// Mounted with express.raw() in index.js so req.body is the raw Buffer
// needed for HMAC-SHA512 signature verification.
paystackRouter.post("/webhook", asyncHandler(handlePaystackWebhook));
