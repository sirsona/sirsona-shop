"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Polls the order status while it is still pending (mobile money often reports
// 'pending' at redirect time) and refreshes the server-rendered page once the
// webhook settles it.
export default function OrderStatusPoller({ reference, status }) {
  const router = useRouter();
  const [pending, setPending] = useState(status === "pending");

  useEffect(() => {
    if (!pending || !reference) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const order = await apiFetch(`/api/paystack/status/${reference}`);
        if (cancelled || order.status === "pending") return;
        setPending(false);
        router.refresh();
      } catch {
        // Transient — keep polling until the timeout below stops us.
      }
    }, 4000);

    const timeout = setTimeout(() => clearInterval(interval), 120000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pending, reference, router]);

  return null;
}
