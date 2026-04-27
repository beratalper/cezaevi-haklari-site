"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Scale } from "lucide-react";

const menuItems = [
  {
    label: "Haklar",
    href: "/haklar",
    children: [
      { label: "Telefon Hakkı", href: "/haklar/telefon-hakki" },
      { label: "Görüş Hakkı", href: "/haklar/gorus-hakki" },
      { label: "Mektup Hakkı", href: "/haklar/mektup-hakki" },
      { label: "Sağlık Hakkı", href: "/haklar/saglik-hakki" },
      { label: "Nakil Hakkı", href: "/haklar/nakil-hakki" },
      { label: "Disiplin İşlemleri", href: "/haklar/disiplin-islemleri" },
      { label: "Açık Cezaevi", href: "/haklar/acik-cezaevi" },
    ],
  },
  {
    label: "Mevzuat",
    href: "/mevzuat",
    children: [
  { label: "Tüm Mevzuat", href: "/mevzuat" },

  { label: "5275 Sayılı Kanun", href: "/mevzuat/5275" },
  { label: "4675 Sayılı Kanun", href: "/mevzuat/4675" },

  { label: "Mandela Kuralları", href: "/mevzuat/mandela-kurallari" },
  { label: "Avrupa Cezaevi Kuralları", href: "/mevzuat/avrupa-cezaevi-kurallari" },
  { label: "İşkenceye Karşı Sözleşme", href: "/mevzuat/iskenceye-karsi-sozlesme" },
  { label: "AİHS Madde 3", href: "/mevzuat/aihs-madde-3" },

  { label: "Telefon Hakkı", href: "/mevzuat/telefon-hakki" },
  { label: "Sağlık Hakkı", href: "/mevzuat/saglik-hakki" },
  { label: "Görüş Hakkı", href: "/mevzuat/gorus-hakki" },
  { label: "Mektup Hakkı", href: "/mevzuat/mektup-hakki" },
  { label: "Disiplin Cezaları", href: "/mevzuat/disiplin-cezalari" },
  { label: "Nakil Talebi", href: "/mevzuat/nakil-hakki" },
  { label: "Açık Cezaevi", href: "/mevzuat/acik-cezaevi" },
  { label: "İnfaz Hâkimliği", href: "/mevzuat/infaz-hakimligi" },
],
  },
  {
    label: "Kararlar",
    href: "/kararlar",
    children: [
  { label: "Tüm AYM Kararları", href: "/kararlar" },
  { label: "Telefon Hakkı Kararları", href: "/konular/telefon-hakki" },
  { label: "Sağlık Hakkı Kararları", href: "/konular/saglik-hakki" },
  { label: "Disiplin Kararları", href: "/konular/disiplin" },
  { label: "Görüş Hakkı Kararları", href: "/konular/gorus-hakki" },
  { label: "Mektup Kararları", href: "/konular/mektup-hakki" },
  { label: "Nakil Kararları", href: "/konular/nakil" },
  { label: "Kötü Muamele Kararları", href: "/konular/kotu-muamele" },
],
  },
  {
    label: "Dilekçeler",
    href: "/dilekceler",
    children: [
      { label: "İnfaz Hâkimliği", href: "/dilekceler/infaz-hakimligi" },
      { label: "Telefon Şikayeti", href: "/dilekceler/telefon" },
      { label: "Sağlık Talebi", href: "/dilekceler/saglik" },
      { label: "Nakil Talebi", href: "/dilekceler/nakil" },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState(null);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Scale size={22} />
          </div>

          <div className="leading-tight">
            <div className="text-xl font-bold tracking-tight text-white">
              Cezaevi<span className="text-amber-600">Hakları</span>
            </div>
            <div className="hidden text-xs text-slate-400 sm:block">
              Tutuklu, hükümlü ve yakınları için bilgi platformu
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Ana Sayfa
          </Link>

          {menuItems.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                href={item.href}
                className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
                <ChevronDown
                  size={15}
                  className="transition group-hover:rotate-180"
                />
              </Link>

              <div className="invisible absolute left-0 top-full mt-3 w-72 translate-y-2 rounded-2xl border border-white/10 bg-[#111827] p-2 opacity-0 shadow-xl transition-all duration-200 min-h-[360px] max-h-[360px] overflow-y-auto dropdown-scroll scrollbar-thin scrollbar-thumb-[#c9a96e]/60 scrollbar-track-transparent group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:bg-[#c9a96e]/10 hover:text-[#c9a96e]"
                  >
                    {child.label}
                  </Link>
                ))}

                <Link
                  href={item.href}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c9a96e]/10 hover:text-[#c9a96e]"
                >
                  Tüm {item.label}
                </Link>
              </div>
            </div>
          ))}

        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white lg:hidden"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#070b14] px-4 py-4 lg:hidden">
          <div className="space-y-2">
            <Link
              href="/"
              className="block rounded-2xl px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
            >
              Ana Sayfa
            </Link>

            {menuItems.map((item) => {
              const isOpen = openMobileGroup === item.label;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5"
                >
                  <button
                    onClick={() =>
                      setOpenMobileGroup(isOpen ? null : item.label)
                    }
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-white"
                  >
                    {item.label}
                    <ChevronDown
                      size={18}
                      className={`transition ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="space-y-1 px-2 pb-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-xl px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                        >
                          {child.label}
                        </Link>
                      ))}

                      <Link
                        href={item.href}
                        className="block rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        Tüm {item.label}
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>
      )}
    </header>
  );
}