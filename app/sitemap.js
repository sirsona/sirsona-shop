import { apiFetch } from "@/lib/api";

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 1. Static routes (always exist)
  const staticRoutes = ["", "/products", "/about", "/contact"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  // 2. Dynamic routes (products from database)
  let productRoutes = [];
  try {
    const { products } = await apiFetch("/api/products");
    productRoutes = products.map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: new Date(p.created_at || new Date()),
    }));
  } catch {
    // If API fails, we still return static routes
  }

  // 3. Return combined list
  return [...staticRoutes, ...productRoutes];
}
