"use client";

import Link from "next/link";

export default function Navbar() {
  const menuItems = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Haklar", href: "/haklar" },
    { label: "Kararlar", href: "/kararlar" },
    { label: "AYM Kategorileri", href: "/konular" },
    { label: "Mevzuat", href: "/mevzuat" },
    { label: "Dilekçeler", href: "/dilekceler" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-white md:text-3xl"
        >
          Cezaevi<span className="text-amber-300">Hakları</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-amber-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/kararlar"
          className="hidden rounded-2xl bg-amber-300 px-5 py-2 text-sm font-bold text-black transition hover:scale-105 hover:bg-[#e2c17c] lg:inline-flex"
        >
          Kararlarda Ara
        </Link>
      </div>
    </header>
  );
}