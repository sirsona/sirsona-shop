import * as orderRepository from "#repositories/orderRepository.js";
import { updateOrderStatus } from "#services/orderLifecycleService.js";
import { listRecentOrders, reconcileTransactions } from "#services/adminService.js";

export async function getTransactionReconciliation(req, res) {
  const perPage = Math.min(parseInt(req.query.perPage, 10) || 10, 50);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const transactions = await reconcileTransactions({ perPage, page });

  res.json({ transactions, page, perPage });
}

export async function getRecentOrders(req, res) {
  const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100);

  const orders = await listRecentOrders({ limit });

  res.json({ orders });
}

// Admin-driven status changes (ship / deliver / cancel). Transition rules and
// automatic restocking live in orderLifecycleService.
export async function updateOrderStatusByReference(req, res) {
  const { reference } = req.params;
  const nextStatus = req.body?.status;

  if (!nextStatus) {
    return res.status(400).json({ error: "Status is required" });
  }

  const order = await orderRepository.findByReference(reference);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const result = await updateOrderStatus(order.id, nextStatus);
  if (result.error) {
    return res.status(result.httpStatus || 400).json({ error: result.error });
  }

  res.json({ status: result.status });
}
