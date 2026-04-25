"use client";

import { useState } from "react";
import data from "../data/kararlar.json";

export default function Kararlar() {
const [page, setPage] = useState(1);

const perPage = 5;

const [query, setQuery] = useState("");

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

const paginated = filtered.slice(
  (page - 1) * perPage,
  page * perPage
);
function badgeClass(sonuc) {
  if (sonuc === "İhlal")
    return "bg-green-100 text-green-800";

  if (sonuc === "İhlal Olmadığı")
    return "bg-blue-100 text-blue-800";

  if (sonuc === "Kabul Edilemezlik")
    return "bg-gray-200 text-gray-800";

  if (sonuc === "Yetkisizlik")
    return "bg-yellow-100 text-yellow-800";

  if (sonuc === "Düşme")
    return "bg-orange-100 text-orange-800";

  if (sonuc === "Ret")
    return "bg-red-100 text-red-800";

  return "bg-gray-100 text-gray-700";
}
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">

<div className="mb-10">
  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Karar ara..."
    className="w-full rounded-2xl border border-[#e5e1d8] bg-white px-5 py-4 outline-none focus:border-black"
  />
</div>

      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Bireysel Başvuru Veri Tabanı
      </p>

      <h1 className="mb-6 text-5xl font-semibold tracking-tight">
        AYM Kararları
      </h1>

      <p className="max-w-3xl text-lg leading-8 text-gray-600">
        Ceza infaz kurumlarıyla ilgili bireysel başvuru kararları.
      </p>

      <div className="mt-10 rounded-3xl border border-[#e5e1d8] bg-white p-6">
        <div className="text-sm font-semibold text-gray-500">
          Gösterilen karar sayısı: {filtered.length}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {paginated.map((item, index) => (
          <article
            key={index}
            className="rounded-3xl border border-[#e5e1d8] bg-white p-8"
          >
            <div className="mb-4 text-sm font-semibold text-gray-400">
              #{index + 1}
            </div>

            <a href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}>
  <h2 className="text-2xl font-semibold hover:underline">
    {item.baslik}
  </h2>
</a>

            <div className="mt-3 text-sm text-gray-500">
              Başvuru No: {item.basvuru_no} · Karar Tarihi: {item.karar_tarihi}
            </div>

            <div
  className={`mt-5 inline-block rounded-full px-4 py-2 text-sm font-semibold ${badgeClass(item.sonuc)}`}
>
  Karar Sonucu: {item.sonuc}
</div>
          </article>
        ))}
<div className="mt-10 flex items-center justify-between">
  <button
    onClick={() => setPage(page - 1)}
    disabled={page === 1}
    className="cursor-pointer rounded-xl border px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
  >
    ← Önceki
  </button>

  <div className="text-sm text-gray-500">
    Sayfa {page} / {totalPages}
  </div>

  <button
    onClick={() => setPage(page + 1)}
    disabled={page === totalPages}
    className="cursor-pointer rounded-xl border px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
  >
    Sonraki →
  </button>
</div>
      </div>
    </section>
  );
}