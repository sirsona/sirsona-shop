import Badge from "@/app/components/ui/Badge";
import EmptyState from "@/app/components/ui/EmptyState";
import PageHeader from "@/app/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export const metadata = { title: "My Orders" };

export default async function MyOrdersPage({ searchParams }) {
  const { phone } = await searchParams;
  const cleanPhone = phone?.trim() || "";

  let orders = [];
  let error = null;

  if (cleanPhone) {
    try {
      const result = await apiFetch(
        `/api/my-orders?phone=${encodeURIComponent(cleanPhone)}`,
      );

      if (result.error) {
        error = result.error;
      } else {
        orders = result.orders || [];
      }
    } catch (err) {
      error = err.message;
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <PageHeader
        title="My Orders"
        subtitle="Enter the phone number you used at checkout to find your orders."
      />

      {/* Pure HTML form — works without JavaScript */}
      <form action="/my-orders" method="GET">
        <div className="flex gap-2">
          <input
            type="tel"
            name="phone"
            defaultValue={cleanPhone}
            placeholder="+254 7XX XXX XXX"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Search
          </button>
        </div>
      </form>

      {cleanPhone && (
        <div className="mt-8">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Could not load orders. Please try again.
            </p>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No orders found"
              copy={`We couldn't find any orders for ${cleanPhone}. Double-check the number and try again.`}
            />
          ) : (
            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-6 shadow-sm">
              {orders.map((o) => (
                <li
                  key={o.paystack_reference}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <Link
                    href={`/orders/${o.paystack_reference}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {o.paystack_reference.slice(0, 20)}…
                    <span className="ml-2 font-normal text-gray-600">
                      KSh {(o.total_cents / 100).toLocaleString()}
                    </span>
                  </Link>
                  <Badge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
