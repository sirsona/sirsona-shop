"use client";

import CartSummary from "@/app/components/CartSummary";
import EmptyState from "@/app/components/ui/EmptyState";
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import { clearCart, readCart, updateCartQuantity } from "@/lib/cart";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [lines, setLines] = useState([]);
  const [subtotalCents, setSubtotalCents] = useState(0);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const items = readCart();
    const priced = await apiFetch("/api/cart/price", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
    setLines(priced.lines);
    setSubtotalCents(priced.subtotalCents);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleQuantityChange(productId, quantity) {
    updateCartQuantity(productId, quantity);
    refresh();
  }

  function handleClear() {
    clearCart();
    refresh();
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <PageHeader title="Your cart" />
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <PageHeader title="Your cart is empty" />
        <EmptyState
          icon="🛒"
          title="Nothing here yet"
          copy="Add some products to get started — your cart items will show up here."
        >
          <Button href="/products">Browse products</Button>
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader title="Your cart" />

      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-6 shadow-sm">
        {lines.map(({ product, quantity, lineTotalCents }) => (
          <div key={product.id} className="flex items-center gap-4 py-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.image_url || "/placeholder.png"}
                alt={product.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-gray-900">
                {product.name}
              </div>
              <div className="mt-0.5 text-sm text-gray-600">
                KSh {(product.price_cents / 100).toLocaleString()} each
              </div>
            </div>

            <input
              type="number"
              defaultValue={quantity}
              min="0"
              className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-center text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onBlur={(e) => {
                const qty = parseInt(e.target.value, 10);
                if (Number.isNaN(qty)) return; // ignore garbage input
                handleQuantityChange(product.id, qty);
              }}
            />

            <div className="w-28 text-right font-medium text-gray-900">
              KSh {(lineTotalCents / 100).toLocaleString()}
            </div>

            <button
              onClick={() => handleQuantityChange(product.id, 0)}
              aria-label={`Remove ${product.name} from cart`}
              className="text-gray-400 transition hover:text-red-600"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <CartSummary subtotalCents={subtotalCents} />

      <div className="mt-6 flex items-center gap-4">
        <Button href="/checkout">Proceed to checkout</Button>
        <button
          onClick={handleClear}
          className="text-sm font-medium text-gray-500 underline-offset-2 transition hover:text-gray-700 hover:underline"
        >
          Clear cart
        </button>
      </div>
    </main>
  );
}
