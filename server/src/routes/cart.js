import { priceCartItems } from "#controllers/cartController.js";
import { asyncHandler } from "#middleware/asyncHandler.js";
import { Router } from "express";

export const cartRouter = Router();

// Prices a cart the client is holding in localStorage.
// Never trust client-sent prices — look up current price_cents
// from the products table for every line item.
cartRouter.post("/price", asyncHandler(priceCartItems));
