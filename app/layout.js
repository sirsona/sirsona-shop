// ============================================================
// 1. Imports
// ============================================================

import AxeDevtools from "@/app/components/AxeDevtools"; // Accessibility tool (dev only)
import Header from "@/app/components/Header"; // Sticky header with nav + cart badge
import { Inter } from "next/font/google"; // Self‑hosted Google Fonts
import Link from "next/link"; // Client‑side navigation
import "./globals.css"; // Tailwind + global styles

// ============================================================
// 2. Font Configuration
// ============================================================

const inter = Inter({
  subsets: ["latin"], // Only load Latin characters (smaller file)
  display: "swap", // Show system font immediately, then swap
});

// ============================================================
// 3. Metadata (SEO + Open Graph)
// ============================================================

export const metadata = {
  // Base URL for resolving relative metadata URLs (e.g., og:image)
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),

  // Title configuration: automatic branding for every page
  title: {
    default: "Shop",
    template: "%s | Mctaba Shop",
  },

  // Meta description (appears in Google search results)
  description: "A fullstack shop with Paystack checkout",
};

// ============================================================
// 4. Root Layout Component
// ============================================================

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {" "}
      {/* WCAG requirement — screen readers need language */}
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-white text-gray-900 antialiased`}
      >
        {/* ----------------------------------------------------
            Header (mobile nav + active link highlighting)
           ---------------------------------------------------- */}
        <Header />

        {/* ----------------------------------------------------
            Main Content Area — expands to push footer down
           ---------------------------------------------------- */}
        <div className="flex-1">{children}</div>

        {/* ----------------------------------------------------
            Footer (Semantic HTML)
           ---------------------------------------------------- */}
        <footer className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 sm:flex-row">
            <div className="text-center sm:text-left">
              <Link href="/" className="text-base font-bold tracking-tight text-gray-900">
                Mctaba Shop
              </Link>
              <p className="mt-1 text-sm text-gray-500">
                Good things at fair prices.
              </p>
            </div>

            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center justify-center gap-5 text-sm text-gray-600"
            >
              <Link href="/products" className="transition hover:text-gray-900">
                Products
              </Link>
              <Link href="/about" className="transition hover:text-gray-900">
                About
              </Link>
              <Link href="/contact" className="transition hover:text-gray-900">
                Contact
              </Link>
              <Link href="/admin/login" className="transition hover:text-gray-900">
                Admin
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              {["Paystack", "M-Pesa", "Card"].map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Mctaba Shop · Payments powered by
            Paystack
          </div>
        </footer>

        {/* ----------------------------------------------------
            Accessibility Tooling (development only)
           ---------------------------------------------------- */}
        <AxeDevtools />
      </body>
    </html>
  );
}
