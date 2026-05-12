"use client";

import { useState } from "react";

export default function YaziDuzenleForm({ yazi }) {
  const [baslik, setBaslik] = useState(yazi.baslik || "");
  const [ozet, setOzet] = useState(yazi.ozet || "");

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch(`/api/yazilar/${yazi.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        baslik,
        ozet,
      }),
    });

    if (response.ok) {
      alert("Yazı güncellendi!");
    } else {
      alert("Bir hata oluştu.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-12 space-y-8"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-white/60">
          Başlık
        </label>

        <input
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-white/60">
          Özet
        </label>

        <textarea
          value={ozet}
          onChange={(e) => setOzet(e.target.value)}
          rows={5}
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
        />
      </div>

      <button
        type="submit"
        className="rounded-2xl bg-amber-300 px-6 py-3 font-bold text-black"
      >
        Kaydet
      </button>
    </form>
  );
}