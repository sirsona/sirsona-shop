import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";

export const metadata = {
  title: "About",
};

const FEATURES = [
  { icon: "📱", title: "Phones", detail: "Smartphones from brands you trust." },
  { icon: "🔌", title: "Accessories", detail: "Chargers, cables and essentials." },
  { icon: "🔋", title: "Power Banks", detail: "Stay charged on the go." },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <PageHeader title="About Mctaba Shop" />

      <div className="max-w-2xl space-y-4 text-gray-600">
        <p className="leading-relaxed">
          Mctaba Shop is a production-grade ecommerce platform built entirely
          with Next.js, PostgreSQL, Express, and Paystack.
        </p>
        <p className="leading-relaxed">
          This shop was built as part of the Mctaba Labs bootcamp to teach
          full-stack engineering through a real project that works like a real
          business.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-bold text-gray-900">What We Sell</h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{f.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Button href="/" variant="outline">
          ← Back to Home
        </Button>
      </div>
    </main>
  );
}
