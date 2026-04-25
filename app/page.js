"use client";

import { useState } from "react";
export default function Home() {
  const [query, setQuery] = useState("");

  function handleSearch(e) {
    e.preventDefault();

    if (!query.trim()) return;

    window.location.href = `/kararlar?q=${encodeURIComponent(query)}`;
  }
  const topics = [
    "Kötü muamele yasağı",
    "Sağlık hizmetlerine erişim",
    "Disiplin cezaları",
    "Haberleşme hakkı",
    "Ziyaret hakkı",
    "Etkili başvuru yolları",
  ];

  const cards = [
    ["Makaleler", "Ceza infaz kurumlarında temel haklara ilişkin sade ve anlaşılır içerikler.", "/makaleler"],
    ["AYM Kararları", "Cezaevleriyle ilgili bireysel başvuru kararları ve kısa karar özetleri.", "/kararlar"],
    ["İstatistikler", "Kararların konu ve sonuç bakımından sınıflandırılmış istatistikleri.", "/istatistikler"],
    ["Dilekçeler", "Genel bilgilendirme amaçlı bireysel başvuru dilekçesi taslakları.", "/dilekceler"],
  ];

  return (
    <>
      <section className="mx-auto max-w-5xl px-6 py-20">

        <form onSubmit={handleSearch} className="mb-16 flex justify-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Karar, konu veya hak ara..."
            className="w-full max-w-3xl rounded-full border border-[#d8d2c6] bg-white px-8 py-5 text-base shadow-sm outline-none focus:border-black"
          />
        </form>

        <div className="grid gap-14 lg:grid-cols-[1.3fr_0.7fr]">

          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
              AYM Bireysel Başvuru Rehberi
            </p>

            <h1 className="max-w-5xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Cezaevleriyle ilgili hak ihlallerini ve AYM kararlarını sade biçimde inceleyin.
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-gray-600">
              Ceza infaz kurumları özelinde kötü muamele yasağı, sağlık hizmetlerine
              erişim, haberleşme, ziyaret ve disiplin cezaları hakkında bilgilendirici
              içerikler ve seçilmiş karar özetleri.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="/makaleler"
                className="rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white hover:bg-black"
              >
                Makaleleri İncele
              </a>

              <a
                href="/kararlar"
                className="rounded-full border border-[#d8d2c6] bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-[#f3efe6]"
              >
                Kararları Gör
              </a>
            </div>
          </div>

          <aside className="border-l border-[#e5e1d8] pl-8">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Öne çıkan konular
            </h2>

            <div className="space-y-3">
              {topics.map((topic) => (
                <div
                  key={topic}
                  className="border-b border-[#e5e1d8] py-4 text-lg font-medium"
                >
                  {topic}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-[#e5e1d8] bg-white p-6">
              <p className="text-sm leading-7 text-gray-600">
                Bu site resmî kurum sitesi değildir. İçerikler yalnızca genel
                bilgilendirme amacı taşır.
              </p>
            </div>
          </aside>

        </div>
      </section>

      <section className="border-y border-[#e5e1d8] bg-white">
        <div className="mx-auto grid max-w-5xl gap-0 px-6 md:grid-cols-4">
          {cards.map(([title, text, href]) => (
            <a
              key={title}
              href={href}
              className="border-[#e5e1d8] py-10 md:border-r md:px-8 first:md:border-l hover:bg-[#fbfaf7]"
            >
              <h3 className="mb-4 text-2xl font-semibold tracking-tight">
                {title}
              </h3>
              <p className="text-sm leading-7 text-gray-600">{text}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}