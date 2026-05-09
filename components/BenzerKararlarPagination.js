"use client";

import { useState } from "react";

export default function BenzerKararlarPagination({
  kararlar = [],
  item,
}) {
  const [page, setPage] = useState(1);

  const perPage = 10;

  const totalPages = Math.max(
    1,
    Math.ceil(kararlar.length / perPage)
  );

  const paginated = kararlar.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const kategoriBasligi =
    item.alt_kategori && item.alt_kategori !== item.ust_kategori
      ? `${item.ust_kategori} / ${item.alt_kategori}`
      : item.alt_kategori || item.ust_kategori;

  const baslik = kategoriBasligi
    ? `${kategoriBasligi} ile ilgili diğer kararlar`
    : "Benzer kararlar";

  if (!kararlar.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
        {baslik}
      </h3>

      <div className="mt-4 space-y-3">
        {paginated.map((karar) => (
          <a
            key={karar.id}
            href={`/kararlar/${karar.slug || karar.basvuru_no.replace("/", "-")}`}
            className="block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#c9a96e]/50 hover:bg-white/[0.06]"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="text-sm font-medium text-slate-100">
                {karar.karar_adi}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 text-xs text-slate-400 md:justify-end">
                <span>Başvuru No: {karar.basvuru_no}</span>

                {karar.karar_tarihi && (
                  <span>Karar Tarihi: {karar.karar_tarihi}</span>
                )}
              </div>
            </div>

            {karar.basvuru_konusu && (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {karar.basvuru_konusu}
              </p>
            )}
          </a>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:border-[#c9a96e]/50 hover:text-[#d9bd83]"
          >
            ← Önceki
          </button>

          <div className="text-sm text-slate-400">
            Sayfa {page} / {totalPages}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:border-[#c9a96e]/50 hover:text-[#d9bd83]"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}