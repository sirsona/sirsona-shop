// server/src/routes/webhooks.js
import { query } from "#infrastructure/db.js";
import { Router } from "express";

const router = Router();

// Twilio posts SMS replies here. If the message replies to an outbound
// confirmation (matched by twilio_sid), it is logged against that order.
router.post("/sms", async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;

    const { rows } = await query(
      `SELECT order_id FROM messages WHERE twilio_sid = $1 LIMIT 1`,
      [MessageSid],
    );

    if (rows.length > 0 && rows[0].order_id) {
      const orderId = rows[0].order_id;
      await query(
        `INSERT INTO messages (lead_id, direction, body, order_id, twilio_sid)
         VALUES (NULL, 'in', $1, $2, $3)`,
        [Body, orderId, MessageSid],
      );
    } else {
      // New inbound SMS, not a reply to an order. Treat as a new lead inquiry.
      // (You can wire this to your Week 11 lead bot if desired.)
    }

    // Twilio expects a 200 response with empty body
    res.status(200).send("");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("");
  }
});

export default router;
