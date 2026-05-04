"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

async function getKararlar({
  q = "",
  limit = 500,
  offset = 0,
  kapsam = "tum",
} = {}) {
  const params = new URLSearchParams();

  if (q.trim()) params.set("q", q.trim());
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  params.set("kapsam", kapsam);

  const res = await fetch(`/api/kararlar?${params.toString()}`, {
    cache: "no-store",
  });

  const json = await res.json();

  if (!json.ok) {
    throw new Error(json.error || "Kararlar alınamadı");
  }

  return json.data || [];
}

const kategoriler = [
  "Telefon, mektup ve haberleşme",
  "Kötü muamele / işkence",
  "Ziyaret ve aile hayatı",
  "Disiplin cezaları",
  "Yayın, kitap, ifade özgürlüğü",
  "Avukat görüşü ve savunma",
  "Tahliye, infaz hesabı, koşullu salıverilme",
  "Sağlık ve tedavi",
  "Yaşam hakkı / ölüm / intihar",
  "Diğer cezaevi hakları",
  "Arama, mahremiyet ve özel hayat",
  "Nakil, sevk, infaz koşulları",
];

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

  const konu = (item.basvuru_konusu || "").toLowerCase();
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

function normalizeSlug(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(".html", "")
    .replace(/\//g, "-")
    .replace(/\s+/g, "")
    .replace(/--+/g, "-");
}

function aramaEslesir(item, query) {
  if (!item) return false;

  const q = (query || "").toString().toLowerCase().trim();

  if (!q) return true;

  if (/^\d{4}[\/-]\d+$/.test(q)) {
    const normalizedQuery = q.replace("/", "-");

    return (
      normalizeSlug(item.basvuru_no || "") === normalizeSlug(normalizedQuery)
    );
  }

  const aranacakMetin = [
    item.karar_adi,
    item.basvuru_konusu,
    item.basvuru_no,
    item.sonuc,
    item.hak_ozgurluk_aym,
    item.mudahale_iddiasi_aym,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const tirnakliIfadeler = [...q.matchAll(/"([^"]+)"/g)].map((m) =>
    m[1].trim()
  );

  if (tirnakliIfadeler.length > 0) {
    return tirnakliIfadeler.every((ifade) => aranacakMetin.includes(ifade));
  }

  const kelimeler = q.split(/\s+/).filter(Boolean);

  return kelimeler.every((kelime) => aranacakMetin.includes(kelime));
}

function KararlarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [sonucFilter, setSonucFilter] = useState("Tümü");
  const [aktifSorun, setAktifSorun] = useState(null);
  const [aktifKategori, setAktifKategori] = useState(null);

  const [query, setQuery] = useState(searchParams.get("arama") || "");
  const [aramaKapsami, setAramaKapsami] = useState(
    searchParams.get("kapsam") || "cezaevi"
  );

  const [tumData, setTumData] = useState([]);
  const [tumLoaded, setTumLoaded] = useState(false);
  const [tumLoading, setTumLoading] = useState(false);

  const [cezaeviData, setCezaeviData] = useState([]);
  const [cezaeviLoading, setCezaeviLoading] = useState(true);  
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    async function loadCezaeviKararlar() {
      try {
        setCezaeviLoading(true);
        const data = await getKararlar({ limit: 20000, kapsam: "cezaevi" });
        setCezaeviData(data);
      } catch (error) {
        console.error("Cezaevi kararları yüklenemedi:", error);
        setCezaeviData([]);
      } finally {
        setCezaeviLoading(false);
      }
    }

    loadCezaeviKararlar();
  }, []);

  useEffect(() => {
    const urlQuery = searchParams.get("arama") || "";
    const urlKapsam = searchParams.get("kapsam") || "cezaevi";

    setQuery(urlQuery);
    setAramaKapsami(urlKapsam);
    setPage(1);
  }, [searchParams]);

  const perPage = 6;

  async function tumAymdeAra() {
    try {
      if (!tumLoaded) {
        setTumLoading(true);

        const data = await getKararlar({ limit: 20000 });

        setTumData(data);
        setTumLoaded(true);
      }

      setAramaKapsami("tum");
      setAktifSorun(null);
      setPage(1);
    } finally {
      setTumLoading(false);
    }
  }

  function temizle() {
    setQuery("");
    setSonucFilter("Tümü");
    setAktifSorun(null);
    setAktifKategori(null); // 🔥 EKLE
    setPage(1);
    router.replace("/kararlar");
  }

  const aktifData = aramaKapsami === "tum" ? tumData : cezaeviData;

  const filtered = aktifData.filter((item) => {
    const q = query.toLowerCase().trim();
    const sonuc = item.sonuc || "";

    const kategoriMatch = aktifKategori
      ? item.ust_kategori === aktifKategori
      : true;

    const textMatch = aktifSorun ? true : aramaEslesir(item, query);

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

    return textMatch && sonucMatch && sorunEslesir(item, aktifSorun) && kategoriMatch;
  });

  function kararSonucu(item) {
    return (
      item.sonuc_aym ||
      item.sonuc ||
      item.karar_sonucu ||
      ""
    ).toString();
  }

  const stats = useMemo(() => {
    const toplam = filtered.length;

    const ihlal = filtered.filter((item) => {
      const sonuc = kararSonucu(item);

      return (
        sonuc.includes("İhlal") &&
        !sonuc.includes("İhlal Olmadığı")
      );
    }).length;

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

  if (cezaeviLoading) {
    return (
      <main className="min-h-screen bg-[#070b14] p-10 text-white">
        Kararlar yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-14 lg:px-6 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl">


          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_270px]">

            <div className="min-w-0">
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    const value = e.target.value;

                    setQuery(value);
                    setAktifSorun(null);
                    setPage(1);

                    const params = new URLSearchParams(window.location.search);

                    if (value.trim()) {
                      params.set("arama", value);
                      params.set("kapsam", aramaKapsami);
                    } else {
                      params.delete("arama");
                      params.delete("kapsam");
                    }

                    const queryString = params.toString();
                    router.replace(
                      queryString ? `/kararlar?${queryString}` : "/kararlar"
                    );
                  }}
                  placeholder="Karar adı, başvuru no, müdahale iddiası veya sonuç ara..."
                  className="min-h-14 w-full rounded-2xl bg-white px-5 text-base text-slate-900 outline-none"
                />
                <details className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400 open:border-[#c9a96e]/30">
                  <summary className="cursor-pointer select-none text-sm font-semibold text-[#d9bd83]">
                    Nasıl arama yapmalıyım?
                  </summary>

                  <div className="mt-4 space-y-5 leading-6">

                    {/* I */}
                    <div>
                      <div className="font-semibold text-slate-200">
                        I. Birden fazla kelime ile arama (varsayılan)
                      </div>
                      <p className="mt-1">
                        Birden fazla kelime yazıldığında, bu kelimelerin birlikte geçtiği kararlar listelenir.
                      </p>
                      <p className="mt-1 text-[#d9bd83]">
                        Örnek: <span className="font-semibold">telefon ziyaret</span>
                      </p>
                      <p>
                        Bu arama, içinde hem{" "}
                        <span className="text-slate-200">telefon</span>{" "}
                        <span className="underline decoration-[#c9a96e] underline-offset-2">ve</span>{" "}
                        <span className="text-slate-200">ziyaret</span> geçen kararları bulur.
                      </p>
                    </div>

                    {/* II */}
                    <div>
                      <div className="font-semibold text-slate-200">
                        II. Tam kelime grubu arama
                      </div>
                      <p className="mt-1">
                        Birden fazla kelimeden oluşan ifadeyi aynen aramak için çift tırnak kullanabilirsiniz.
                      </p>
                      <p className="mt-1 text-[#d9bd83]">
                        Örnek: <span className="font-semibold">"çıplak arama"</span>
                      </p>
                      <p>
                        Bu arama, içinde{" "}
                        <span className="text-slate-200">çıplak arama</span> ifadesi aynen geçen kararları bulur.
                      </p>
                    </div>

                    {/* III */}
                    <div>
                      <div className="font-semibold text-slate-200">
                        III. Başvuru numarası ile arama
                      </div>
                      <p className="mt-1">
                        Kararın başvuru numarasını biliyorsanız doğrudan başvuru numarasıyla arama yapabilirsiniz.
                      </p>
                      <p className="mt-1 text-[#d9bd83]">
                        Örnek:{" "}
                        <span className="font-semibold">2012/69</span>{" "}
                        <span className="underline decoration-[#c9a96e] underline-offset-2">veya</span>{" "}
                        <span className="font-semibold">2012-69</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        (İki yazım biçimi de aynı sonucu verir.)
                      </p>
                    </div>

                  </div>
                </details>
                <div className="mt-5 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => {
                      setAramaKapsami("cezaevi");
                      setPage(1);
                      router.replace(`/kararlar?arama=${query}&kapsam=cezaevi`);
                    }}
                    className={`cursor-pointer rounded-lg border px-5 py-3 text-sm font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5 ${aramaKapsami === "cezaevi"
                      ? "border-[#c9a96e]/80 bg-[#c9a96e]/20 text-[#f3d99b]"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-[#c9a96e]/60 hover:text-[#d9bd83]"
                      }`}
                  >
                    Cezaevi kararlarında ara
                  </button>

                  <button
                    onClick={() => {
                      tumAymdeAra();

                      const params = new URLSearchParams(window.location.search);

                      if (query.trim()) {
                        params.set("arama", query);
                      }

                      params.set("kapsam", "tum");

                      router.replace(`/kararlar?${params.toString()}`);
                    }}
                    disabled={tumLoading}
                    className={`cursor-pointer rounded-lg border px-5 py-3 text-sm font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 ${aramaKapsami === "tum"
                      ? "border-[#c9a96e]/80 bg-[#c9a96e]/20 text-[#f3d99b]"
                      : "border-[#c9a96e]/25 bg-[#c9a96e]/5 text-[#d9bd83] hover:border-[#c9a96e]/70 hover:bg-[#c9a96e]/10"
                      }`}
                  >
                    {tumLoading
                      ? "Tüm AYM kararları yükleniyor..."
                      : `Tüm AYM kararlarında ara${tumLoaded ? ` (${tumData.length})` : ""
                      }`}
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.075] to-white/[0.025] p-6 shadow-2xl shadow-black/20">
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

                <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.10] to-white/[0.025] p-6 shadow-2xl shadow-black/20">
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

                <div className="relative overflow-hidden rounded-3xl border border-[#c9a96e]/20 bg-gradient-to-br from-[#c9a96e]/10 to-white/[0.025] p-6 shadow-2xl shadow-black/20">
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
                      Arama kelimesini değiştirin, farklı filtre deneyin veya
                      tüm filtreleri temizleyerek yeniden arama yapın.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={temizle}
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
                                kararSonucu(item)
                              )}`}
                            >
                              {kararSonucu(item) || "Sonuç belirtilmemiş"}
                            </span>
                          </div>

                          <a
                            href={`/kararlar/${item.basvuru_no.replace(
                              "/",
                              "-"
                            )}`}
                          >
                            <h2 className="font-serif text-2xl font-semibold leading-snug text-white transition group-hover:text-[#d9bd83]">
                              {item.karar_adi}
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

                          {item.basvuru_konusu && (
                            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d9bd83]">
                                Başvuru Konusu
                              </div>

                              <p className="line-clamp-3 text-sm leading-7 text-slate-300">
                                {item.basvuru_konusu}
                              </p>
                            </div>
                          )}

                          <div className="mt-6 flex justify-end">
                            <a
                              href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-[#c9a96e]/70 bg-[#c9a96e]/10 px-5 py-2.5 text-sm font-semibold text-[#f3d99b] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#c9a96e]/20"
                            >
                              Kararı incele
                              <span>→</span>
                            </a>
                          </div>
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
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
                    Kategoriler
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Yaşanan soruna göre hızlı filtreleyin.
                  </p>
                </div>

                {(query || aktifSorun) && (
                  <button
                    onClick={temizle}
                    className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-[#c9a96e]/60 hover:text-[#d9bd83]"
                  >
                    Aramayı temizle
                  </button>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    {kategoriler.map((kat) => {
                      const aktifMi = aktifKategori === kat;

                      return (
                        <button
                          key={kat}
                          onClick={() => {
                            setAktifKategori(kat);
                            setQuery("");
                            setPage(1);
                          }}
                          className={`w-full rounded-xl border px-3 py-2 text-left text-xs font-medium ${aktifMi
                            ? "border-[#c9a96e]/70 bg-[#c9a96e]/15 text-[#f3d99b]"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-[#c9a96e]/60"
                            }`}
                        >
                          {kat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
export default function KararlarPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#070b14] p-10 text-white">
          Kararlar yükleniyor...
        </main>
      }
    >
      <KararlarContent />
    </Suspense>
  );
}