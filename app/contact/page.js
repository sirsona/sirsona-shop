import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <PageHeader title="Contact Us" />

      <p className="max-w-2xl text-gray-600">
        Have a question about an order or a product? We are here to help.
      </p>

      <div className="mt-8 grid max-w-2xl gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Phone</h2>
          <a
            href="tel:+254712000000"
            className="mt-2 inline-block text-indigo-600 hover:text-indigo-700"
          >
            +254 712 000000
          </a>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Email</h2>
          <a
            href="mailto:hi@mctaba.co.ke"
            className="mt-2 inline-block text-indigo-600 hover:text-indigo-700"
          >
            hi@mctaba.co.ke
          </a>
        </div>
      </div>

      <div className="mt-12">
        <Button href="/" variant="outline">
          ← Back to Home
        </Button>
      </div>
    </main>
  );
}
