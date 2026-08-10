import { getOrderByReference } from "#controllers/ordersController.js";
import { asyncHandler } from "#middleware/asyncHandler.js";
import { Router } from "express";

export const ordersRouter = Router();

ordersRouter.get("/:reference", asyncHandler(getOrderByReference));
