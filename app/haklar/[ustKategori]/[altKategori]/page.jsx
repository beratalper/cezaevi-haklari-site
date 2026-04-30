import Link from "next/link";
import data from "@/app/data/kararlar.json";
import { cezaeviHaklari, slugifyTR } from "@/data/cezaeviHaklari";

function titleFromSlug(slug = "") {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function normalize(value = "") {
  return slugifyTR(String(value || "").trim());
}

export default async function HakAltKategoriPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const aktifSayfa = Number(resolvedSearchParams?.sayfa || 1);
  const sayfaBasina = 20;

  const ustSlug = resolvedParams?.ustKategori || "";
  const altSlug = resolvedParams?.altKategori || "";

  const ustKategoriData = cezaeviHaklari.find(
    (group) => group.slug === ustSlug
  );

  const altKategoriTitle =
    ustKategoriData?.items.find((item) => normalize(item) === altSlug) ||
    titleFromSlug(altSlug);

  const sayfaBasligi = altKategoriTitle
    ? `${altKategoriTitle} ile İlgili Kararlar`
    : "İlgili Kararlar";

  const kararlar = data.filter((item) => {
    return normalize(item.altKategori) === altSlug;
  });

  const toplamSayfa = Math.ceil(kararlar.length / sayfaBasina);
  const baslangic = (aktifSayfa - 1) * sayfaBasina;
  const bitis = baslangic + sayfaBasina;
  const gosterilecekKararlar = kararlar.slice(baslangic, bitis);

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/haklar"
          className="mb-8 inline-flex rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white/70 transition hover:border-amber-300/40 hover:text-amber-300"
        >
          ← Haklar sayfasına dön
        </Link>

        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
          {ustKategoriData?.title || titleFromSlug(ustSlug)}
        </p>

        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
          {sayfaBasligi}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
          Bu başlık altında Anayasa Mahkemesi bireysel başvuru kararları
          içinden ilgili ceza infaz kurumu kararları listelenmektedir.
        </p>

        <div className="mt-10 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Bulunan Karar
          </div>

          <div className="mt-2 text-4xl font-bold text-white">
            {kararlar.length}
          </div>
        </div>

        <div className="mt-12 grid gap-5">
          {kararlar.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-white/60">
              Bu alt başlık için henüz karar bulunamadı.
            </div>
          ) : (
            gosterilecekKararlar.map((item, index) => (
              <Link
                key={`${item.basvuru_no || index}`}
                href={`/kararlar/${item.basvuru_no?.replace("/", "-")}`}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl transition-all duration-300 hover:border-amber-300/40 hover:bg-white/[0.06]"
              >
                <div className="mb-4 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-amber-300/15 px-3 py-1 font-semibold text-amber-300">
                    Karar Tarihi: {item.karar_tarihi || "Belirtilmemiş"}
                  </span>

                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 font-semibold text-amber-300">
                    {item.ustKategori || "-"}
                  </span>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-white/60">
                    {item.altKategori || altKategoriTitle}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white transition group-hover:text-amber-300">
                  {item.baslik || item.basvuru_no}
                </h2>

                <div className="mt-4 grid gap-2 text-sm text-white/55 md:grid-cols-3">
                  <div>
                    <span className="text-white/35">Başvuru No: </span>
                    {item.basvuru_no || "-"}
                  </div>

                  <div>
                    <span className="text-white/35">Karar Sonucu: </span>
                    {item.sonuc || "-"}
                  </div>

                  <div>
                    <span className="text-white/35">Müdahale İddiası: </span>
                    {item.mudahale_iddiasi_aym || "-"}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        {toplamSayfa > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {Array.from({ length: toplamSayfa }, (_, i) => i + 1).map((sayfa) => (
              <Link
                key={sayfa}
                href={`/haklar/${ustSlug}/${altSlug}?sayfa=${sayfa}`}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${aktifSayfa === sayfa
                    ? "bg-amber-300 text-black"
                    : "border border-white/10 bg-white/[0.03] text-white/70 hover:border-amber-300/40 hover:text-amber-300"
                  }`}
              >
                {sayfa}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}