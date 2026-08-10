"use client";

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mirrors TRANSITIONS in server/src/services/orderLifecycleService.js —
// the server enforces these; this just drives the dropdown.
const TRANSITIONS = {
  pending: ["cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  failed: [],
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(null);
  const [choices, setChoices] = useState({});

  useEffect(() => {
    apiFetch("/api/admin/orders", { credentials: "include" })
      .then((data) => setOrders(data.orders || []))
      .catch(() => router.replace("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleUpdate(reference, status) {
    setError(null);
    setUpdating(reference);
    try {
      await apiFetch(`/api/admin/orders/${reference}/status`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      // Refresh the list to show the new status
      const data = await apiFetch("/api/admin/orders", {
        credentials: "include",
      });
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <PageHeader title="Orders" />
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <PageHeader
        title="Orders"
        subtitle={`The ${orders.length} most recent orders.`}
      >
        <div className="flex items-center gap-3">
          <Button href="/admin/transactions" variant="ghost">
            Transactions →
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Sign out
          </Button>
        </div>
      </PageHeader>

      {error && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                {["Reference", "Customer", "Channel", "Total", "Status", "Update"].map(
                  (h) => (
                    <th key={h} className="px-5 py-3 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => {
                const nextStatuses = TRANSITIONS[o.status] || [];
                return (
                  <tr key={o.paystack_reference}>
                    <td className="px-5 py-3">
                      <Link
                        href={`/orders/${o.paystack_reference}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {o.paystack_reference.slice(0, 20)}…
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">
                        {o.customer_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {o.customer_email}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {o.payment_channel}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      KSh {(o.total_cents / 100).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={o.status} />
                    </td>
                    <td className="px-5 py-3">
                      {nextStatuses.length === 0 ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={
                              choices[o.paystack_reference] || nextStatuses[0]
                            }
                            onChange={(e) =>
                              setChoices((c) => ({
                                ...c,
                                [o.paystack_reference]: e.target.value,
                              }))
                            }
                            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                          >
                            {nextStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <Button
                            onClick={() =>
                              handleUpdate(
                                o.paystack_reference,
                                choices[o.paystack_reference] || nextStatuses[0],
                              )
                            }
                            disabled={updating === o.paystack_reference}
                            variant="outline"
                            className="!px-3 !py-1.5"
                          >
                            {updating === o.paystack_reference ? "..." : "Update"}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
