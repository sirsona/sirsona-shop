import ProductCard from "@/app/components/ProductCard";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export const metadata = {
  title: "Mctaba Shop",
  description:
    "Good things at fair prices — phones, accessories and more with secure Paystack checkout.",
};

function pillClass(active) {
  return active
    ? "rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white"
    : "rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition";
}

export default async function HomePage() {
  let products = [];
  let categories = [];
  let error = null;

  try {
    [categories, products] = await Promise.all([
      apiFetch("/api/products/categories")
        .then((d) => d.categories || [])
        .catch(() => []),
      apiFetch("/api/products")
        .then((d) => d.products || [])
        .catch(() => []),
    ]);
  } catch (err) {
    console.error(err);
    error = err.message;
  }

  const featured = products.slice(0, 4);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Welcome to Mctaba Shop
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Good things at fair prices. Phones, accessories and more — pay
          securely with M-Pesa or card.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse Products
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
          >
            About Us
          </Link>
        </div>

        {/* Category shortcuts */}
        {categories.length > 0 && (
          <nav
            aria-label="Browse by category"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-sm text-gray-500">Shop by category:</span>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/products?category=${encodeURIComponent(c)}`}
                className={pillClass(false)}
              >
                {c}
              </Link>
            ))}
          </nav>
        )}
      </section>

      {/* ── Featured products ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
              <p className="mt-1 text-gray-600">
                A few of our bestsellers.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Trust strip ───────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl">🔒</div>
            <h3 className="mt-2 font-semibold text-gray-900">
              Secure payments
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Checkout is processed securely by Paystack.
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl">💳</div>
            <h3 className="mt-2 font-semibold text-gray-900">
              M-Pesa or card
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Pay with mobile money or your debit card.
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl">💬</div>
            <h3 className="mt-2 font-semibold text-gray-900">
              WhatsApp confirmations
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Get your order confirmation on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* If the API is down, the page still shows the hero */}
      {error && featured.length === 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h2 className="font-semibold">Products are temporarily unavailable</h2>
            <p className="mt-2 text-sm">Please try again in a moment.</p>
          </div>
        </section>
      )}
    </main>
  );
}
