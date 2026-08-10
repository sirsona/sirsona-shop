import * as productRepository from "#repositories/productRepository.js";

export async function getCategories(req, res) {
  const categories = await productRepository.findCategories();
  res.json({ categories });
}

export async function getAllProducts(req, res) {
  const products = await productRepository.findAll({
    category: req.query.category,
  });
  res.json({ products });
}

export async function getProductBySlug(req, res) {
  const product = await productRepository.findBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
}
