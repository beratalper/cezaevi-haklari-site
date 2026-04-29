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
          <a className="hover:text-[#d9bd83]" href="/">Ana Sayfa</a>
          <a
  className="rounded-full bg-[#c9a96e]/15 px-4 py-2 font-semibold text-[#e7c98d] transition hover:bg-[#c9a96e]/25 hover:text-white"
  href="/konular"
>
  AYM Kategorileri
</a>
          <a className="hover:text-[#d9bd83]" href="/mevzuat">Mevzuat</a>
          <a className="hover:text-[#d9bd83]" href="/kararlar">Kararlar</a>
          <a className="hover:text-[#d9bd83]" href="/dilekceler">Dilekçeler</a>
          <a className="hover:text-[#d9bd83]" href="/iletisim">İletişim</a>
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
            <a href="/">Ana Sayfa</a>
            <a href="/konular" className="text-[#e7c98d] font-semibold">
  AYM Kategorileri
</a>
            <a href="/mevzuat">Mevzuat</a>
            <a href="/kararlar">Kararlar</a>
            <a href="/dilekceler">Dilekçeler</a>
            <a href="/iletisim">İletişim</a>
          </div>
        </div>
      )}
    </header>
  );
}