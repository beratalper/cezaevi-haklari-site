"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `/kararlar?q=${encodeURIComponent(query)}`;
  }

  const cards = [
    ["AYM Kararları", "Ceza infaz kurumlarıyla ilgili bireysel başvuru kararlarını inceleyin.", "/kararlar"],
    ["Makaleler", "Hak ihlalleri, başvuru yolları ve güncel hukuki açıklamalar.", "/makaleler"],
    ["Hak İhlalleri", "Kötü muamele, sağlık, disiplin, haberleşme ve ziyaret hakkı başlıkları.", "/kararlar"],
    ["Başvuru Rehberi", "Bireysel başvuru sürecine ilişkin sade ve pratik bilgiler.", "/makaleler"],
  ];

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#b8925a33,transparent_35%),radial-gradient(circle_at_bottom_left,#1e3a8a44,transparent_40%)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 inline-flex rounded-full border border-[#c9a96e]/30 bg-white/5 px-5 py-2 text-sm text-[#d9bd83] backdrop-blur">
            Türkiye’de Cezaevi Hakları ve AYM İçtihadı
          </div>

          <h1 className="max-w-5xl font-serif text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
            Cezaevi haklarını, AYM kararlarını ve başvuru yollarını sade biçimde inceleyin.
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
            Kötü muamele yasağı, sağlık hizmetlerine erişim, disiplin cezaları,
            haberleşme, ziyaret ve etkili başvuru yolları hakkında kararlar,
            makaleler ve rehber içerikler.
          </p>

          <form onSubmit={handleSearch} className="mt-12 max-w-3xl">
            <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur md:flex-row">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Karar, konu veya hak ara..."
                className="min-h-14 flex-1 rounded-2xl bg-white px-5 text-base text-slate-900 outline-none"
              />
              <button
                type="submit"
                className="rounded-2xl bg-[#c9a96e] px-8 py-4 font-semibold text-[#08111f] transition hover:bg-[#e0bf7a]"
              >
                Karar Ara
              </button>
            </div>
          </form>

          <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-300">
            {["Kötü muamele", "Sağlık hakkı", "Disiplin cezası", "Haberleşme", "Ziyaret", "Etkili başvuru"].map((item) => (
              <a
                key={item}
                href={`/kararlar?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:border-[#c9a96e]/60 hover:text-[#d9bd83]"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-24 md:grid-cols-4">
        {cards.map(([title, text, href]) => (
          <a
            key={title}
            href={href}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-2 hover:border-[#c9a96e]/60 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-[#c9a96e]/10"
          >
	    <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />	
            <div className="mb-8 h-1 w-12 rounded-full bg-[#c9a96e]" />
            <h2 className="font-serif text-2xl font-semibold">{title}</h2>
            <p className="mt-4 leading-7 text-slate-400">{text}</p>
            <div className="mt-8 text-sm font-semibold text-[#d9bd83]">
              İncele →
            </div>
          </a>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-4">
  {[
    ["16.000+", "AYM Kararı"],
    ["50+", "Hak Konusu"],
    ["%100", "Mobil Uyumlu"],
    ["7/24", "Ücretsiz Erişim"],
  ].map(([num, text]) => (
    <div
      key={text}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center"
    >
      <div className="text-4xl font-serif font-semibold text-[#d9bd83]">
        {num}
      </div>
      <div className="mt-3 text-slate-400">{text}</div>
    </div>
  ))}
</section>

      <section className="border-y border-white/10 bg-white/[0.03] px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 text-center md:grid-cols-4">
          {["Güncel içerik", "AYM kararları", "Mobil uyumlu", "Ücretsiz erişim"].map((item) => (
            <div key={item}>
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#c9a96e] text-[#08111f]">
                ✓
              </div>
              <div className="font-semibold">{item}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}