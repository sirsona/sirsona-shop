"use client";

import { clearCart } from "@/lib/cart";
import { useEffect } from "react";

export default function ClearCartOnPaid({ paid }) {
  useEffect(() => {
    if (paid) clearCart();
  }, [paid]);

  return null;
}
