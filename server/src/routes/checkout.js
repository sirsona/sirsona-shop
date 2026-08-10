import { initiateCheckout } from "#controllers/checkoutController.js";
import { asyncHandler } from "#middleware/asyncHandler.js";
import { Router } from "express";

export const checkoutRouter = Router();

checkoutRouter.post("/", asyncHandler(initiateCheckout));
