"use client";

import { addToCart } from "@/lib/cart";
import { useState } from "react";

export default function AddToCartButton({ productId, stock }) {
  const [added, setAdded] = useState(false);

  function handleClick() {
    addToCart(productId, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      disabled={stock === 0}
      className={
        stock === 0
          ? "rounded-full bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-500"
          : added
            ? "rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            : "rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      }
    >
      {stock === 0 ? "Out of stock" : added ? "Added!" : "Add to cart"}
    </button>
  );
}
