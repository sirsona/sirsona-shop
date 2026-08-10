"use client";

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mirrors TRANSITIONS in server/src/services/orderLifecycleService.js.
const TRANSITIONS = {
  pending: ["cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  failed: [],
};

const PAYMENT_CHANNEL_LABEL = {
  card: "Card",
  mobile_money: "M-Pesa / Airtel Money",
};

export default function AdminOrderDetailPage({ params }) {
  const router = useRouter();
  const [reference] = useState(() => params.reference);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [choice, setChoice] = useState("");

  useEffect(() => {
    apiFetch(`/api/admin/orders/${reference}`, { credentials: "include" })
      .then((data) => {
        setOrder(data.order);
        setItems(data.items || []);
        setChoice((TRANSITIONS[data.order.status] || [])[0] || "");
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setLoading(false));
  }, [reference, router]);

  async function handleUpdate(status) {
    setError(null);
    setUpdating(true);
    try {
      await apiFetch(`/api/admin/orders/${reference}/status`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      // Re-fetch to reflect the new status
      const data = await apiFetch(`/api/admin/orders/${reference}`, {
        credentials: "include",
      });
      setOrder(data.order);
      setChoice((TRANSITIONS[data.order.status] || [])[0] || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <PageHeader title="Order" />
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!order) return null;

  const nextStatuses = TRANSITIONS[order.status] || [];

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <PageHeader
        title="Order detail"
        subtitle={`${order.paystack_reference.slice(0, 20)}…`}
      >
        <Button href="/admin/orders" variant="ghost">
          ← Back to orders
        </Button>
      </PageHeader>

      {error && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Customer + shipping details */}
      <dl className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-6 shadow-sm">
        <div className="flex gap-4 py-3">
          <dt className="min-w-28 text-sm font-semibold text-gray-700">
            Customer
          </dt>
          <dd className="m-0 text-sm text-gray-600">
            {order.customer_name}
            <span className="block text-xs text-gray-500">
              {order.customer_email}
            </span>
          </dd>
        </div>
        <div className="flex gap-4 py-3">
          <dt className="min-w-28 text-sm font-semibold text-gray-700">
            Phone
          </dt>
          <dd className="m-0 text-sm text-gray-600">
            {order.customer_phone || "—"}
          </dd>
        </div>
        <div className="flex gap-4 py-3">
          <dt className="min-w-28 text-sm font-semibold text-gray-700">
            Shipping address
          </dt>
          <dd className="m-0 text-sm text-gray-600">
            {order.shipping_address || "—"}
          </dd>
        </div>
        <div className="flex gap-4 py-3">
          <dt className="min-w-28 text-sm font-semibold text-gray-700">
            Payment
          </dt>
          <dd className="m-0 text-sm text-gray-600">
            {PAYMENT_CHANNEL_LABEL[order.payment_channel] ??
              order.payment_channel}
          </dd>
        </div>
        <div className="flex gap-4 py-3">
          <dt className="min-w-28 text-sm font-semibold text-gray-700">
            Placed
          </dt>
          <dd className="m-0 text-sm text-gray-600">
            {new Date(order.created_at).toLocaleString("en-KE", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </dd>
        </div>
        <div className="flex gap-4 py-3">
          <dt className="min-w-28 text-sm font-semibold text-gray-700">
            Status
          </dt>
          <dd className="m-0">
            <Badge status={order.status} />
          </dd>
        </div>
      </dl>

      {/* Items */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900">Items</h2>
      <ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-6 shadow-sm">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex justify-between py-3 text-sm text-gray-700"
          >
            <span>
              {item.name} &times; {item.quantity}
            </span>
            <span>
              KSh{" "}
              {((item.unit_price_cents * item.quantity) / 100).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right font-semibold text-gray-900">
        Total: KSh {(order.total_cents / 100).toLocaleString()}
      </p>

      {/* Status management */}
      {nextStatuses.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <span className="text-sm font-medium text-gray-700">
            Move order to:
          </span>
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
          >
            {nextStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button
            onClick={() => handleUpdate(choice)}
            disabled={updating || !choice}
            variant="outline"
          >
            {updating ? "Updating..." : "Update status"}
          </Button>
        </div>
      )}
    </main>
  );
}
