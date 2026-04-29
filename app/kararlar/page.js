"use client";

import { useMemo, useState } from "react";
import cezaeviData from "../data/kararlar.json";

const sorunGruplari = [
  {
    baslik: "Haberleşme ve Yayın",
    aciklama: "Mektup, telefon, kitap, gazete ve süreli yayın sorunları",
    items: [
      ["Mektubumu vermediler", "mektup"],
      ["Sakıncalı mektup dediler", "sakıncalı mektup"],
      ["Telefon hakkımı vermediler", "telefon"],
      ["Kitap / gazete vermediler", "kitap"],
      ["Süreli yayın vermediler", "süreli yayın"],
    ],
  },
  {
    baslik: "Sağlık ve Kötü Muamele",
    aciklama: "Sağlık hizmetine erişim, çıplak arama, darp ve kötü koşullar",
    items: [
      ["Hastaneye götürmediler", "tıbbi ihmal"],
      ["İlaç vermediler", "sağlık"],
      ["Doktora çıkarmadılar", "sağlık"],
      ["Çıplak arama yaptılar", "çıplak"],
      ["Beni dövdüler / darp ettiler", "güç kullanımı"],
      ["Koğuş çok kalabalık", "fiziki koşulları"],
      ["Tek kişilik odaya koydular", "tek kişilik oda"],
    ],
  },
  {
    baslik: "Görüş, Ziyaret ve Sevk",
    aciklama: "Açık görüş, ziyaret yasağı, uzak cezaevine sevk ve nakil aracı",
    items: [
      ["Açık görüşe çıkarmadılar", "görüş"],
      ["Ziyaret yasağı koydular", "ziyaret"],
      ["Uzağa sevk ettiler", "uzak_sevk"],
      ["Sevk aracında kötü koşullar vardı", "nakil_araci"],
    ],
  },
  {
    baslik: "İnfaz ve Disiplin",
    aciklama: "Tahliye, açık cezaevi, denetimli serbestlik ve disiplin cezaları",
    items: [
      ["Tahliyemi geciktirdiler", "koşullu salıverme"],
      ["Açık cezaevine ayırmadılar", "açığa ayrılma"],
      ["Denetimli serbestlik vermediler", "denetimli serbestlik"],
      ["Disiplin cezası verdiler", "mahkumiyet"],
      ["Eğitime çıkarmadılar", "eğitim"],
      ["Açlık grevi nedeniyle sorun yaşadım", "açlık grevi"],
    ],
  },
];

function sorunEslesir(item, aktifSorun) {
  if (!aktifSorun) return true;

  const konu = (item.konu || "").toLowerCase();
  const mudahale = (item.mudahale_iddiasi_aym || "").toLowerCase();

  if (aktifSorun === "uzak_sevk") {
    return (
      (
        konu.includes("sevk") ||
        konu.includes("nakil") ||
        konu.includes("nakledil") ||
        konu.includes("başka ceza infaz kurum") ||
        konu.includes("başka bir ceza infaz kurum") ||
        konu.includes("ailesinden uzak")
      ) &&
      !konu.includes("yanında getirdiği") &&
      !konu.includes("süresiz yayın") &&
      !konu.includes("radyo nedeniyle") &&
      !konu.includes("yayının içeriği") &&
      !konu.includes("disiplin cezasıyla cezalandırılmasının ifade özgürlüğü")
    );
  }

  if (aktifSorun === "nakil_araci") {
    return mudahale.includes("nakil aracının fiziki koşulları");
  }

  return true;
}

export default function Kararlar() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sonucFilter, setSonucFilter] = useState("Tümü");
  const [aktifSorun, setAktifSorun] = useState(null);

  const [aramaKapsami, setAramaKapsami] = useState("cezaevi");
  const [tumData, setTumData] = useState([]);
  const [tumLoaded, setTumLoaded] = useState(false);
  const [tumLoading, setTumLoading] = useState(false);

  const perPage = 6;

  async function tumAymdeAra() {
    try {
      if (!tumLoaded) {
        setTumLoading(true);
        const mod = await import("../data/tum-kararlar.json");
        setTumData(mod.default || []);
        setTumLoaded(true);
      }

      setAramaKapsami("tum");
      setAktifSorun(null);
      setPage(1);
    } finally {
      setTumLoading(false);
    }
  }

  const aktifData = aramaKapsami === "tum" ? tumData : cezaeviData;

  const filtered = aktifData.filter((item) => {
    const q = query.toLowerCase().trim();
    const sonuc = item.sonuc || "";

    const textMatch = aktifSorun
      ? true
      : !q ||
        item.baslik?.toLowerCase().includes(q) ||
        item.konu?.toLowerCase().includes(q) ||
        item.basvuru_no?.toLowerCase().includes(q) ||
        item.sonuc?.toLowerCase().includes(q) ||
        item.hak_ozgurluk_aym?.toLowerCase().includes(q) ||
        item.mudahale_iddiasi_aym?.toLowerCase().includes(q);

    let sonucMatch = true;

    if (sonucFilter === "İhlal") {
      sonucMatch = sonuc.includes("İhlal") && !sonuc.includes("İhlal Olmadığı");
    } else if (sonucFilter === "İhlal Olmadığı") {
      sonucMatch = sonuc.includes("İhlal Olmadığı");
    } else if (sonucFilter === "Kabul Edilemezlik") {
      sonucMatch =
        sonuc.includes("Açıkça Dayanaktan Yoksunluk") ||
        sonuc.includes("Başvuru Yollarının Tüketilmemesi") ||
        sonuc.includes("Süre Aşımı") ||
        sonuc.includes("Kişi Bakımından Yetkisizlik") ||
        sonuc.includes("Konu Bakımından Yetkisizlik") ||
        sonuc.includes("Zaman Bakımından Yetkisizlik") ||
        sonuc.includes("Anayasal ve Kişisel Önemin Olmaması") ||
        sonuc.includes("Başvurunun Reddi") ||
        sonuc.includes("İdari Redde İtirazın Reddi");
    } else if (sonucFilter === "Düşme") {
      sonucMatch = sonuc.includes("Düşme");
    }

    return textMatch && sonucMatch && sorunEslesir(item, aktifSorun);
  });

  const stats = useMemo(() => {
    const toplam = filtered.length;
    const ihlal = filtered.filter(
      (item) =>
        (item.sonuc || "").includes("İhlal") &&
        !(item.sonuc || "").includes("İhlal Olmadığı")
    ).length;

    const oran = toplam ? Math.round((ihlal / toplam) * 100) : 0;

    return { toplam, ihlal, oran };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function badgeClass(sonuc = "") {
    if (sonuc.includes("İhlal Olmadığı"))
      return "border-blue-400/30 bg-blue-400/10 text-blue-300";

    if (sonuc.includes("İhlal"))
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";

    if (
      sonuc.includes("Açıkça Dayanaktan Yoksunluk") ||
      sonuc.includes("Başvuru Yollarının Tüketilmemesi") ||
      sonuc.includes("Süre Aşımı") ||
      sonuc.includes("Yetkisizlik")
    )
      return "border-slate-400/30 bg-slate-400/10 text-slate-300";

    if (sonuc.includes("Düşme"))
      return "border-orange-400/30 bg-orange-400/10 text-orange-300";

    if (sonuc.includes("Ret"))
      return "border-red-400/30 bg-red-400/10 text-red-300";

    return "border-slate-400/30 bg-slate-400/10 text-slate-300";
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Bireysel Başvuru Veri Tabanı
          </p>

          <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-7xl">
            AYM Kararları
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Ceza infaz kurumlarına ilişkin seçilmiş Anayasa Mahkemesi bireysel
            başvuru kararlarını müdahale iddiası, karar sonucu ve başvuru
            numarasına göre inceleyin.
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setAktifSorun(null);
                setPage(1);
              }}
              placeholder="Karar adı, başvuru no, müdahale iddiası veya sonuç ara..."
              className="min-h-14 w-full rounded-2xl bg-white px-5 text-base text-slate-900 outline-none"
            />

            <div className="mt-5 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  setAramaKapsami("cezaevi");
                  setPage(1);
                }}
                className={`cursor-pointer rounded-lg border px-5 py-3 text-sm font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 ${
                  aramaKapsami === "cezaevi"
                    ? "border-[#c9a96e]/80 bg-[#c9a96e]/20 text-[#f3d99b]"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-[#c9a96e]/60 hover:text-[#d9bd83]"
                }`}
              >
                Cezaevi kararlarında ara
              </button>

              <button
                onClick={tumAymdeAra}
                disabled={tumLoading}
                className={`cursor-pointer rounded-lg border px-5 py-3 text-sm font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 ${
                  aramaKapsami === "tum"
                    ? "border-[#c9a96e]/80 bg-[#c9a96e]/20 text-[#f3d99b]"
                    : "border-[#c9a96e]/25 bg-[#c9a96e]/5 text-[#d9bd83] hover:border-[#c9a96e]/70 hover:bg-[#c9a96e]/10"
                }`}
              >
                {tumLoading
                  ? "Tüm AYM kararları yükleniyor..."
                  : `Tüm AYM kararlarında ara${
                      tumLoaded ? ` (${tumData.length})` : ""
                    }`}
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9a96e]">
                    Sık Aranan Cezaevi Sorunları
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Hukuki terim bilmeden, yaşanan soruna göre karar arayın.
                  </p>
                </div>

                {(query || aktifSorun) && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setAktifSorun(null);
                      setPage(1);
                    }}
                    className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-[#c9a96e]/60 hover:text-[#d9bd83]"
                  >
                    Etiket aramasını temizle
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {sorunGruplari.map((grup) => (
                  <div
                    key={grup.baslik}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#c9a96e]/40 hover:bg-white/[0.055]"
                  >
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-white">
                        {grup.baslik}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {grup.aciklama}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {grup.items.map(([label, keyword]) => {
                        const aktifMi =
                          aktifSorun === keyword ||
                          query.toLowerCase() === keyword.toLowerCase();

                        return (
                          <button
                            key={label}
                            onClick={() => {
                              setAramaKapsami("cezaevi");

                              if (
                                keyword === "uzak_sevk" ||
                                keyword === "nakil_araci"
                              ) {
                                setAktifSorun(keyword);
                                setQuery(label);
                              } else {
                                setAktifSorun(null);
                                setQuery(keyword);
                              }

                              setPage(1);
                            }}
                            className={`rounded-full border px-3 py-2 text-xs font-medium transition hover:-translate-y-0.5 ${
                              aktifMi
                                ? "border-[#c9a96e]/70 bg-[#c9a96e]/15 text-[#f3d99b]"
                                : "border-white/10 bg-white/5 text-slate-300 hover:border-[#c9a96e]/60 hover:text-[#d9bd83]"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {[
                "Tümü",
                "İhlal",
                "İhlal Olmadığı",
                "Kabul Edilemezlik",
                "Düşme",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSonucFilter(item);
                    setPage(1);
                  }}
                  className={`cursor-pointer rounded-2xl border px-5 py-3 text-sm font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5 ${
                    sonucFilter === item
                      ? "border-[#c9a96e]/60 bg-[#c9a96e]/10 text-[#d9bd83]"
                      : "border-[#c9a96e]/25 bg-[#c9a96e]/5 text-[#d9bd83] hover:border-[#c9a96e]/70 hover:bg-[#c9a96e]/10"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.075] to-white/[0.025] p-6 shadow-2xl shadow-black/20">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#c9a96e]/10 blur-3xl" />

              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Bulunan karar
                </div>

                <div className="mt-3 font-serif text-5xl font-semibold text-[#d9bd83]">
                  {stats.toplam}
                </div>

                <div className="mt-3 text-sm text-slate-500">
                  {aramaKapsami === "tum"
                    ? "Tüm AYM kararları içinde"
                    : "Cezaevi kararları içinde"}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.10] to-white/[0.025] p-6 shadow-2xl shadow-black/20">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />

              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  İhlal içeren karar
                </div>

                <div className="mt-3 font-serif text-5xl font-semibold text-emerald-300">
                  {stats.ihlal}
                </div>

                <div className="mt-3 text-sm text-slate-500">
                  Bulunan kararlar içinde ihlal sonucu olanlar
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-[#c9a96e]/20 bg-gradient-to-br from-[#c9a96e]/10 to-white/[0.025] p-6 shadow-2xl shadow-black/20">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#c9a96e]/10 blur-3xl" />

              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  İhlal oranı
                </div>

                <div className="mt-3 font-serif text-5xl font-semibold text-[#d9bd83]">
                  %{stats.oran}
                </div>

                <div className="mt-3 text-sm text-slate-500">
                  Filtrelenmiş sonuçlara göre hesaplanır
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {paginated.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-10 text-center shadow-2xl shadow-black/20">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 text-2xl">
                  🔎
                </div>

                <h3 className="font-serif text-3xl font-semibold text-white">
                  Sonuç bulunamadı
                </h3>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
                  Arama kelimesini değiştirin, farklı filtre deneyin veya tüm
                  filtreleri temizleyerek yeniden arama yapın.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      setQuery("");
                      setSonucFilter("Tümü");
                      setAktifSorun(null);
                      setPage(1);
                    }}
                    className="rounded-full border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-5 py-3 text-sm font-semibold text-[#f3d99b] transition hover:border-[#c9a96e]/70 hover:bg-[#c9a96e]/20"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {paginated.map((item) => (
                  <article
                    key={item.basvuru_no}
                    className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.075] to-white/[0.025] p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/60 hover:shadow-[#c9a96e]/10"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#c9a96e]/10 blur-3xl transition group-hover:bg-[#c9a96e]/20" />

                    <div className="relative">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {item.hak_ozgurluk_aym && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                              {item.hak_ozgurluk_aym}
                            </span>
                          )}

                          {item.mudahale_iddiasi_aym && (
                            <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-xs font-medium text-[#d9bd83]">
                              {item.mudahale_iddiasi_aym}
                            </span>
                          )}
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                            item.sonuc
                          )}`}
                        >
                          {item.sonuc || "Sonuç belirtilmemiş"}
                        </span>
                      </div>

                      <a href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}>
                        <h2 className="font-serif text-2xl font-semibold leading-snug text-white transition group-hover:text-[#d9bd83]">
                          {item.baslik}
                        </h2>
                      </a>

                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                          Başvuru No:{" "}
                          <span className="font-semibold text-slate-200">
                            {item.basvuru_no}
                          </span>
                        </div>

                        {item.karar_tarihi && (
                          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                            Karar Tarihi:{" "}
                            <span className="font-semibold text-slate-200">
                              {item.karar_tarihi}
                            </span>
                          </div>
                        )}
                      </div>

                      {item.konu && (
                        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d9bd83]">
                            Başvuru Konusu
                          </div>

                          <p className="line-clamp-3 text-sm leading-7 text-slate-300">
                            {item.konu}
                          </p>
                        </div>
                      )}

                      <a
                        href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}
                        className="mt-6 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-5 py-3 text-sm font-semibold text-[#f3d99b] transition hover:border-[#c9a96e]/70 hover:bg-[#c9a96e]/20"
                      >
                        Kararı incele →
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
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