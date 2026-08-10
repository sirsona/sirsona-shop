"use client";

import { addToCart } from "@/lib/cart";
import { useState } from "react";

// Quantity stepper + add-to-cart, used on the product detail page.
export default function AddToCartButton({ productId, stock }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = stock === 0;
  const canIncrement = quantity < stock;

  function handleAdd() {
    addToCart(productId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (outOfStock) {
    return (
      <button
        disabled
        className="rounded-full bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-500"
      >
        Out of stock
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Quantity stepper */}
      <div className="flex items-center rounded-full border border-gray-200">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
          className="px-4 py-3 text-lg font-medium text-gray-600 transition hover:text-gray-900"
        >
          −
        </button>
        <span className="min-w-8 text-center text-sm font-semibold text-gray-900">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          disabled={!canIncrement}
          aria-label="Increase quantity"
          className="px-4 py-3 text-lg font-medium text-gray-600 transition hover:text-gray-900 disabled:cursor-default disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        className={
          added
            ? "rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            : "rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        }
      >
        {added ? "Added!" : "Add to cart"}
      </button>
    </div>
  );
}
