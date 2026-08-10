import {
  getAllProducts,
  getCategories,
  getProductBySlug,
} from "#controllers/productsController.js";
import { asyncHandler } from "#middleware/asyncHandler.js";
import { Router } from "express";

export const productsRouter = Router();

// IMPORTANT: This route must be registered BEFORE "/:slug".
// Express matches routes in the order they are defined.
// Without this, a request to /api/products/categories would be caught
// by /:slug and treated as a product lookup for slug "categories".
productsRouter.get("/categories", asyncHandler(getCategories));

// Supports ?category= filter, used by /products/category/[cat]
productsRouter.get("/", asyncHandler(getAllProducts));

// Single product by slug — must come AFTER /categories
productsRouter.get("/:slug", asyncHandler(getProductBySlug));
