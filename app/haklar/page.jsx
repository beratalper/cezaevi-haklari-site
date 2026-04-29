"use client";

import { useState } from "react";
import Link from "next/link";
import { cezaeviHaklari, slugifyTR } from "@/data/cezaeviHaklari";

export default function HaklarPage() {
  const [openSlug, setOpenSlug] = useState(null);

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
          Cezaevi Hakları
        </p>

        <h1 className="max-w-5xl text-4xl font-bold leading-tight md:text-5xl">
          Cezaevlerinde Yaşanan Hak İhlalleri & Anayasa Mahkemesi Tarafından
          Verilen Bireysel Başvuru Kararları
        </h1>

        <p className="mt-8 max-w-4xl text-lg leading-8 text-white/65">
          Ceza infaz kurumlarında bulunan tutuklu ve hükümlüler de Anayasa ve
          hukuk devleti ilkesiyle güvence altına alınan temel haklara sahiptir.
          Bu sayfada, cezaevlerinde yaşanmış ve yaşanabilecek olan hak
          ihlallerini daha anlaşılır konu başlıkları altında inceleyebilir;
          Anayasa Mahkemesine bireysel başvuru yolunda hangi konuların öne
          çıktığını AYM kararları ışığında görebilirsiniz.
        </p>

        <div className="mt-14 space-y-5">
          {cezaeviHaklari.map((group) => {
            const isOpen = openSlug === group.slug;

            return (
              <div
                key={group.slug}
                className="rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => setOpenSlug(isOpen ? null : group.slug)}
                  className="flex w-full cursor-pointer items-center justify-between gap-5 p-6 text-left transition-all duration-300 hover:bg-white/[0.04]"
                >
                  <h2 className="text-2xl font-bold leading-snug text-amber-300">
                    {group.title}
                  </h2>

                  <span
                    className={`shrink-0 text-3xl font-bold text-amber-300 transition-all duration-500 ease-in-out ${
                      isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-4 border-t border-white/10 p-6">
                      {group.items.map((item) => (
                        <div
                          key={item}
                          className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-black/20 p-5 transition-all duration-300 hover:bg-white/[0.03] md:flex-row md:items-center"
                        >
                          <div className="text-lg font-semibold leading-snug text-white">
                            {item}
                          </div>

                          <Link
                            href={`/haklar/${group.slug}/${slugifyTR(item)}`}
                            className="shrink-0 rounded-2xl bg-amber-300 px-5 py-3 text-center text-sm font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-[#e2c17c]"
                          >
                            Kararları İncele
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}