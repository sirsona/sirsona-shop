import { findOrderWithItems } from "#services/orderService.js";

export async function getOrderByReference(req, res) {
  const { reference } = req.params;

  const orderData = await findOrderWithItems(reference);
  if (!orderData) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json({
    order: orderData.order,
    items: orderData.items,
  });
}
