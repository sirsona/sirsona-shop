"use client";

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import {
  formatAmount,
  shortReference,
  transactionStatusDisplay,
} from "@/lib/paystack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/transactions", { credentials: "include" })
      .then(setData)
      .catch(() => router.replace("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <PageHeader title="Paystack Transactions" />
        <p className="text-gray-600">Loading from Paystack...</p>
      </main>
    );
  }

  const { transactions = [] } = data ?? {};

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <PageHeader
        title="Paystack Transactions"
        subtitle={`Last ${transactions.length} transactions from Paystack, compared against your database. Rows highlighted in red indicate a mismatch.`}
      >
        <div className="flex items-center gap-3">
          <Button href="/admin/orders" variant="ghost">
            ← Orders
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Sign out
          </Button>
        </div>
      </PageHeader>

      {transactions.length === 0 ? (
        <p className="text-gray-600">No transactions found in Paystack.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                {["Reference", "Email", "Amount", "Paystack", "Database", "Paid at"].map(
                  (h) => (
                    <th key={h} className="px-5 py-3 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => {
                const psDisplay = transactionStatusDisplay(t.paystackStatus);
                return (
                  <tr
                    key={t.reference}
                    className={
                      t.mismatch ? "bg-red-50/60" : "transition hover:bg-gray-50"
                    }
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${t.reference}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {shortReference(t.reference)}
                      </Link>
                      {t.mismatch && (
                        <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                          MISMATCH
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{t.email}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {formatAmount(t.paystackAmount)}
                    </td>
                    <td className="px-5 py-3">
                      <span style={{ color: psDisplay.color }} className="font-medium">
                        {psDisplay.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {t.dbStatus ? (
                        <Badge status={t.dbStatus} />
                      ) : (
                        <span className="text-gray-400">not in DB</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {t.paidAt
                        ? new Intl.DateTimeFormat("en-KE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(new Date(t.paidAt))
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {transactions.some((t) => t.mismatch) && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>⚠ Mismatches detected.</strong> Paystack reports successful
          payment but the corresponding order is not marked paid. This may
          indicate a webhook delivery failure or a bug in the verification flow.
          Check the Paystack webhook log in your dashboard and consider manually
          verifying these references.
        </div>
      )}
    </main>
  );
}
