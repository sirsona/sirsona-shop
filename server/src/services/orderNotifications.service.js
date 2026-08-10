// server/services/orderNotifications.service.js
import { query } from "#infrastructure/db.js";
import { sendWhatsAppMessage } from "#services/whatsapp.service.js";

// Sends the WhatsApp order confirmation after a payment is confirmed.
// Never blocks or fails the payment itself — callers catch and log.
export async function sendOrderConfirmation(orderId) {
  const { rows: orderRows } = await query(
    `SELECT id, customer_name, customer_phone, total_cents
     FROM orders WHERE id = $1`,
    [orderId],
  );
  const order = orderRows[0];
  if (!order) throw new Error("Order not found");

  const { rows: items } = await query(
    `SELECT oi.quantity, p.name
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId],
  );

  const itemsText = items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  const totalKsh = (order.total_cents / 100).toLocaleString();
  const firstName = order.customer_name.split(" ")[0];
  const shortId = order.id.slice(0, 8).toUpperCase();
  const deliveryDate = computeDeliveryDate();

  if (process.env.USE_WHATSAPP_TEMPLATE === "true") {
    // Production: use approved template
    const message = await sendWhatsAppMessage({
      to: order.customer_phone,
      templateName: process.env.WHATSAPP_ORDER_TEMPLATE_ID,
      templateParams: [firstName, shortId, totalKsh, itemsText, deliveryDate],
    });

    // Log the outbound message
    await query(
      `INSERT INTO messages (lead_id, direction, body, order_id, twilio_sid)
       VALUES (NULL, 'out', $1, $2, $3)`,
      [
        `[Template] order_confirmation with ${firstName}, ${shortId}, KSh ${totalKsh}`,
        orderId,
        message.sid,
      ],
    );
    return message;
  }

  // Development: use session message (sandbox)
  const body = `Asante ${firstName}! Your order ${shortId} has been confirmed.

Total: KSh ${totalKsh}
Items: ${itemsText}

We will deliver by ${deliveryDate}. Reply to this message if you have any questions.`;

  const message = await sendWhatsAppMessage({
    to: order.customer_phone,
    body,
  });

  await query(
    `INSERT INTO messages (lead_id, direction, body, order_id, twilio_sid)
     VALUES (NULL, 'out', $1, $2, $3)`,
    [body, orderId, message.sid],
  );
  return message;
}

function computeDeliveryDate() {
  const now = new Date();
  const delivery = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  return delivery.toLocaleDateString("en-KE", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
