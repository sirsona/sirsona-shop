import ProductCard from "@/app/components/ProductCard";
import EmptyState from "@/app/components/ui/EmptyState";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export const metadata = {
  title: "All Products | Mctaba Shop",
  description: "Browse our collection of products",
};

export const revalidate = 0;

function pillClass(active) {
  return active
    ? "rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white"
    : "rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition";
}

export default async function ProductsPage({ searchParams }) {
  const { category } = await searchParams;
  const activeCategory = category?.trim() || "";

  let categories = [];
  let products = [];
  let error = null;

  try {
    // Categories are optional chrome — a failure there shouldn't break the page.
    categories = await apiFetch("/api/products/categories")
      .then((d) => d.categories || [])
      .catch(() => []);

    const data = await apiFetch(
      activeCategory
        ? `/api/products?category=${encodeURIComponent(activeCategory)}`
        : "/api/products",
    );
    products = data.products || [];
  } catch (err) {
    console.error(err);
    error = err.message;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-3xl font-bold mb-6">All Products</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="font-semibold">Unable to load products</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">All Products</h1>
          <p className="mt-2 text-gray-600">
            Browse our latest products and bestsellers.
          </p>
        </div>
        <p className="text-sm text-gray-500">{products.length} products</p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <nav
          aria-label="Filter by category"
          className="mb-8 flex flex-wrap gap-2"
        >
          <Link href="/products" className={pillClass(!activeCategory)}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/products?category=${encodeURIComponent(c)}`}
              className={pillClass(activeCategory === c)}
            >
              {c}
            </Link>
          ))}
        </nav>
      )}

      {products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No products available"
          copy={
            activeCategory
              ? `Nothing in "${activeCategory}" right now — check back later.`
              : "Check back later for new arrivals."
          }
        >
          {activeCategory && (
            <Link
              href="/products"
              className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Show all products
            </Link>
          )}
        </EmptyState>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
