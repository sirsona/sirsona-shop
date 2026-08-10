import ClearCartOnPaid from "@/app/components/ClearCartOnPaid";
import OrderStatusPoller from "@/app/components/OrderStatusPoller";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { notFound } from "next/navigation";

const STATUS_COPY = {
  paid: {
    heading: "Payment received",
    detail:
      "Thank you — your order is confirmed. We've sent a WhatsApp confirmation to your phone.",
  },
  pending: {
    heading: "Payment pending",
    detail:
      "We're waiting for your provider to confirm. This page refreshes automatically once it settles.",
  },
  failed: {
    heading: "Payment failed",
    detail:
      "The payment did not go through. Your items have been returned to stock — you can try again.",
  },
  cancelled: { heading: "Order cancelled", detail: "This order was cancelled." },
};

const PAYMENT_CHANNEL_LABEL = {
  card: "Card",
  mobile_money: "M-Pesa / Airtel Money",
};

export async function generateMetadata({ params }) {
  const { reference } = await params;
  return { title: `Order ${reference.slice(0, 14)}…` };
}

export default async function OrderPage({ params }) {
  const { reference } = await params;

  let order, items;
  try {
    ({ order, items } = await apiFetch(`/api/orders/${reference}`));
  } catch {
    notFound();
  }

  const copy = STATUS_COPY[order.status] ?? STATUS_COPY.pending;

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <ClearCartOnPaid paid={order.status === "paid"} />
      {/* Auto-refreshes when a pending order settles (mobile money) */}
      <OrderStatusPoller reference={reference} status={order.status} />

      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {copy.heading}
      </h1>
      <p className="mt-2 leading-relaxed text-gray-600">{copy.detail}</p>

      {/* Order metadata */}
      <dl className="mt-8 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-6 shadow-sm">
        <div className="flex gap-4 py-3">
          <dt className="min-w-28 text-sm font-semibold text-gray-700">
            Reference
          </dt>
          <dd className="m-0 break-all text-sm text-gray-600">
            {order.paystack_reference}
          </dd>
        </div>
        <div className="flex gap-4 py-3">
          <dt className="min-w-28 text-sm font-semibold text-gray-700">Date</dt>
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
            Customer
          </dt>
          <dd className="m-0 text-sm text-gray-600">{order.customer_name}</dd>
        </div>
      </dl>

      {/* Order items */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900">
        Items ordered
      </h2>
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

      <div className="mt-6 flex gap-3">
        <Button href="/products">Continue shopping</Button>
        {order.status === "failed" && (
          <Button href="/cart" variant="outline">
            Back to cart
          </Button>
        )}
      </div>
    </main>
  );
}
