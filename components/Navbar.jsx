"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-white md:text-3xl"
        >
          Cezaevi<span className="text-amber-300">Hakları</span>
        </Link>

        {/* Masaüstü Menü */}
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

        {/* Sağ buton (masaüstü) */}
        <Link
          href="/kararlar"
          className="hidden rounded-2xl bg-amber-300 px-5 py-2 text-sm font-bold text-black transition hover:scale-105 hover:bg-[#e2c17c] lg:inline-flex"
        >
          Kararlarda Ara
        </Link>

        {/* Hamburger Buton */}
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-col gap-1 lg:hidden"
        >
          <span className="h-0.5 w-6 bg-white"></span>
          <span className="h-0.5 w-6 bg-white"></span>
          <span className="h-0.5 w-6 bg-white"></span>
        </button>
      </div>

      {/* Mobil Açılır Menü */}
      {open && (
        <div className="border-t border-white/10 bg-[#070b14] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-amber-300 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            {/* Mobilde buton */}
            <Link
              href="/kararlar"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center rounded-xl bg-amber-300 px-4 py-2 text-sm font-bold text-black"
            >
              Kararlarda Ara
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}