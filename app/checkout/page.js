"use client";

import CartSummary from "@/app/components/CartSummary";
import PaystackCheckoutButton from "@/app/components/PaystackCheckoutButton";
import Button from "@/app/components/ui/Button";
import EmptyState from "@/app/components/ui/EmptyState";
import Field, { inputClass } from "@/app/components/ui/Field";
import PageHeader from "@/app/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import { readCart } from "@/lib/cart";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [lines, setLines] = useState([]);
  const [subtotalCents, setSubtotalCents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentChannel, setPaymentChannel] = useState("mobile_money");

  useEffect(() => {
    const items = readCart();
    apiFetch("/api/cart/price", {
      method: "POST",
      body: JSON.stringify({ items }),
    })
      .then((priced) => {
        setLines(priced.lines);
        setSubtotalCents(priced.subtotalCents);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.target);
    const items = readCart();

    try {
      const { authorizationUrl } = await apiFetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items,
          customer: {
            name: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone"),
            address: form.get("address"),
          },
          paymentChannel,
        }),
      });

      // Redirect to Paystack's hosted checkout page
      window.location.href = authorizationUrl;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <PageHeader title="Checkout" />
        <p className="text-gray-600">Loading your cart...</p>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <PageHeader title="Nothing to check out" />
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          copy="Add some products first, then come back to check out."
        >
          <Button href="/products">Browse products</Button>
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <PageHeader title="Checkout" />

      {/* Order summary */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          Your order
        </h2>
        <ul className="divide-y divide-gray-100">
          {lines.map(({ product, quantity, lineTotalCents }) => (
            <li
              key={product.id}
              className="flex justify-between py-2 text-sm text-gray-700"
            >
              <span>
                {product.name} &times; {quantity}
              </span>
              <span>KSh {(lineTotalCents / 100).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <CartSummary subtotalCents={subtotalCents} />
      </section>

      {/* Customer information form */}
      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <h2 className="text-base font-semibold text-gray-900">Your details</h2>

        <Field label="Full name *">
          <input
            name="name"
            required
            autoComplete="name"
            className={inputClass}
          />
        </Field>

        <Field label="Email address *">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </Field>

        <Field label="Phone number" hint="+254 7XX XXX XXX">
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
          />
        </Field>

        <Field label="Shipping address" hint="Building, Street, Area, City">
          <textarea
            name="address"
            rows={3}
            autoComplete="street-address"
            className={`${inputClass} resize-y`}
          />
        </Field>

        {/* Payment method selector */}
        <fieldset className="rounded-2xl border border-gray-200 p-5">
          <legend className="px-2 text-sm font-medium text-gray-700">
            Payment method
          </legend>

          <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-gray-700">
            <input
              type="radio"
              name="paymentChannel"
              value="mobile_money"
              checked={paymentChannel === "mobile_money"}
              onChange={() => setPaymentChannel("mobile_money")}
              className="accent-indigo-600"
            />
            M-Pesa / Airtel Money
          </label>

          <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-gray-700">
            <input
              type="radio"
              name="paymentChannel"
              value="card"
              checked={paymentChannel === "card"}
              onChange={() => setPaymentChannel("card")}
              className="accent-indigo-600"
            />
            Debit / Credit card
          </label>

          <p className="mt-3 text-xs text-gray-500">
            Payment is processed securely by Paystack. You will be redirected to
            complete payment on the next screen.
          </p>
        </fieldset>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <PaystackCheckoutButton pending={submitting} />

        <p className="text-center text-sm text-gray-500">
          <Link href="/cart" className="text-gray-600 underline-offset-2 hover:underline">
            ← Back to cart
          </Link>
        </p>
      </form>
    </main>
  );
}
