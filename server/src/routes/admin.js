import {
  getOrderDetail,
  getRecentOrders,
  getStats,
  getTransactionReconciliation,
  updateOrderStatusByReference,
} from "#controllers/adminController.js";
import { asyncHandler } from "#middleware/asyncHandler.js";
import { requireAdmin } from "#middleware/requireAdmin.js";
import { Router } from "express";

export const adminRouter = Router();

// All admin routes require authentication
adminRouter.use(requireAdmin);

// Get transaction reconciliation — compare Paystack records with DB records
adminRouter.get("/transactions", asyncHandler(getTransactionReconciliation));

// Get the most recent orders from the database
adminRouter.get("/orders", asyncHandler(getRecentOrders));

// Dashboard summary numbers
adminRouter.get("/stats", asyncHandler(getStats));

// Full order detail for the admin page (must come AFTER /orders and /stats)
adminRouter.get("/orders/:reference", asyncHandler(getOrderDetail));

// Admin-driven status changes — transition rules + restock in the service
adminRouter.patch(
  "/orders/:reference/status",
  asyncHandler(updateOrderStatusByReference),
);
