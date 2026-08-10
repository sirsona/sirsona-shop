"use client";

import CartCounter from "@/app/components/CartCounter";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function navClass(active) {
  return active
    ? "font-medium text-gray-900 underline decoration-indigo-600 decoration-2 underline-offset-8"
    : "text-gray-600 transition hover:text-gray-900";
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-gray-900"
        >
          Mctaba Shop
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 text-sm sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navClass(isActive(link.href))}
            >
              {link.label}
            </Link>
          ))}
          <CartCounter />
        </div>

        {/* Mobile: hamburger + cart */}
        <div className="flex items-center gap-4 sm:hidden">
          <CartCounter />
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="text-gray-700 transition hover:text-gray-900"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-6 py-3 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-2 text-sm ${navClass(isActive(link.href))}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
