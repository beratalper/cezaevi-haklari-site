"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/" className="text-xl font-bold tracking-tight text-white">
          Cezaevi<span className="text-[#c9a96e]">Hakları</span>
        </a>

        <nav className="hidden gap-8 text-sm text-slate-300 md:flex">
          <a className="hover:text-[#d9bd83]" href="/makaleler">Makaleler</a>
          <a className="hover:text-[#d9bd83]" href="/kararlar">AYM Kararları</a>
          <a className="hover:text-[#d9bd83]" href="/istatistikler">İstatistikler</a>
          <a className="hover:text-[#d9bd83]" href="/dilekceler">Dilekçeler</a>
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-2xl"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-slate-300">
            <a href="/makaleler">Makaleler</a>
            <a href="/kararlar">AYM Kararları</a>
            <a href="/istatistikler">İstatistikler</a>
            <a href="/dilekceler">Dilekçeler</a>
          </div>
        </div>
      )}
    </header>
  );
}