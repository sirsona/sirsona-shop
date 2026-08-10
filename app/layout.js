// ============================================================
// 1. Imports
// ============================================================

import AxeDevtools from "@/app/components/AxeDevtools"; // Accessibility tool (dev only)
import CartCounter from "@/app/components/CartCounter"; // Live cart badge
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
            Header (Semantic HTML)
           ---------------------------------------------------- */}
        <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-gray-900"
            >
              Mctaba Shop
            </Link>

            <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/products" className="transition hover:text-gray-900">
                Products
              </Link>
              <Link href="/about" className="transition hover:text-gray-900">
                About
              </Link>
              <Link href="/contact" className="transition hover:text-gray-900">
                Contact
              </Link>

              {/* Live cart badge (Client Component) */}
              <CartCounter />
            </div>
          </nav>
        </header>

        {/* ----------------------------------------------------
            Main Content Area — expands to push footer down
           ---------------------------------------------------- */}
        <div className="flex-1">{children}</div>

        {/* ----------------------------------------------------
            Footer (Semantic HTML)
           ---------------------------------------------------- */}
        <footer className="border-t border-gray-100 bg-gray-50 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Mctaba Shop
        </footer>

        {/* ----------------------------------------------------
            Accessibility Tooling (development only)
           ---------------------------------------------------- */}
        <AxeDevtools />
      </body>
    </html>
  );
}
