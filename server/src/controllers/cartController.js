import { priceCart } from "#services/cartService.js";

export async function priceCartItems(req, res) {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const pricing = await priceCart(items);
  res.json(pricing);
}
