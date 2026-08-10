"use client";

import { getCartCount, onCartChange } from "@/lib/cart";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCartCount());

    return onCartChange(() => setCount(getCartCount()));
  }, []);

  return (
    <Link href="/cart" className="transition hover:text-gray-900">
      Cart
      {count > 0 && (
        <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
