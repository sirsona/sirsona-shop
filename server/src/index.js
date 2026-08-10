import "dotenv/config"; // Must be first — routes/services read env vars at import time
import { adminRouter } from "#routes/admin.js";
import { cartRouter } from "#routes/cart.js";
import { checkoutRouter } from "#routes/checkout.js";
import { myOrdersRouter } from "#routes/myOrders.js";
import { ordersRouter } from "#routes/orders.js";
import { paystackRouter } from "#routes/paystack.js";
import { productsRouter } from "#routes/products.js";
import webhooks from "#routes/webhooks.js";
import cors from "cors";
import express from "express";

const app = express();

const allowedOrigin = process.env.SHOP_URL || "http://localhost:3000";
const allowedOrigins = allowedOrigin.split(",").map((s) => s.trim());
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, server-to-server), configured
      // origins (SHOP_URL), and any localhost/127.0.0.1 dev origin.
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

// The Paystack webhook verifies HMAC-SHA512 over the raw request body.
// Must be mounted BEFORE express.json() so the body arrives as a Buffer.
app.use("/api/paystack/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// Twilio posts SMS webhooks as application/x-www-form-urlencoded.
app.use("/webhooks", express.urlencoded({ extended: false }));

app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/paystack", paystackRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/my-orders", myOrdersRouter);
app.use("/api/admin", adminRouter);
app.use("/webhooks", webhooks);

app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Shop API listening on http://localhost:${port}`);
});
