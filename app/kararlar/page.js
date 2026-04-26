"use client";

import { useState } from "react";
import data from "../data/kararlar.json";

export default function Kararlar() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const perPage = 6;

  const filtered = data.filter((item) => {
    const q = query.toLowerCase();

    return (
      item.baslik.toLowerCase().includes(q) ||
      item.konu.toLowerCase().includes(q) ||
      item.basvuru_no.toLowerCase().includes(q) ||
      item.sonuc.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function badgeClass(sonuc) {
    if (sonuc === "İhlal") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    if (sonuc === "İhlal Olmadığı") return "border-blue-400/30 bg-blue-400/10 text-blue-300";
    if (sonuc === "Kabul Edilemezlik") return "border-slate-400/30 bg-slate-400/10 text-slate-300";
    if (sonuc === "Yetkisizlik") return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    if (sonuc === "Düşme") return "border-orange-400/30 bg-orange-400/10 text-orange-300";
    if (sonuc === "Ret") return "border-red-400/30 bg-red-400/10 text-red-300";
    return "border-slate-400/30 bg-slate-400/10 text-slate-300";
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Bireysel Başvuru Veri Tabanı
          </p>

          <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-7xl">
            AYM Kararları
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Ceza infaz kurumlarıyla ilgili bireysel başvuru kararlarını konu,
            başvuru numarası ve karar sonucu üzerinden inceleyin.
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Karar, konu, başvuru no veya sonuç ara..."
              className="min-h-14 w-full rounded-2xl bg-white px-5 text-base text-slate-900 outline-none"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            {["Kötü muamele", "Sağlık", "Disiplin", "Haberleşme", "Ziyaret"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setQuery(item);
                  setPage(1);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:border-[#c9a96e]/60 hover:text-[#d9bd83]"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm text-slate-400">Bulunan karar</div>
            <div className="mt-2 font-serif text-4xl font-semibold text-[#d9bd83]">
              {filtered.length}
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {paginated.map((item, index) => (
              <article
                key={`${item.basvuru_no}-${index}`}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/50 hover:bg-white/[0.07]"
              >
                <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      #{(page - 1) * perPage + index + 1}
                    </span>

                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(item.sonuc)}`}>
                      {item.sonuc}
                    </span>
                  </div>

                  <a href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}>
                    <h2 className="font-serif text-2xl font-semibold leading-snug text-white group-hover:text-[#d9bd83]">
                      {item.baslik}
                    </h2>
                  </a>

                  <div className="mt-4 text-sm leading-7 text-slate-400">
                    Başvuru No: {item.basvuru_no}
                    <br />
                    Karar Tarihi: {item.karar_tarihi}
                  </div>

                  <div className="mt-6 text-sm font-semibold text-[#d9bd83]">
                    Kararı incele →
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[#c9a96e]/50 hover:text-[#d9bd83]"
            >
              ← Önceki
            </button>

            <div className="text-sm text-slate-400">
              Sayfa {page} / {totalPages}
            </div>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[#c9a96e]/50 hover:text-[#d9bd83]"
            >
              Sonraki →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}