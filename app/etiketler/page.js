import { Pool } from "pg";
import Link from "next/link";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const metadata = {
  title:
    "Cezaevi Karar Etiketleri | Cezaevi Hakları",

  description:
    "Çıplak arama, disiplin cezası, telefon görüşmesi, sakıncalı mektup, havalandırma ve diğer cezaevi karar etiketleri üzerinden AYM kararlarını inceleyin.",
};

export default async function EtiketlerPage() {

  const result = await pool.query(
    `
    SELECT
  e.id,
  e.ad,
  e.slug,
  COUNT(*)::int as toplam

    FROM etiketler e

    INNER JOIN karar_etiketleri ke
    ON ke.etiket_id = e.id

    GROUP BY
      e.id,
      e.ad,
      e.slug

    ORDER BY toplam DESC, e.ad ASC
    `
  );

  const etiketler = result.rows;

  const populerEtiketler =
    etiketler
      .filter((e) => e.toplam >= 15)
      .slice(0, 20);

  const harfGruplari = {};

  for (const etiket of etiketler) {

    const ilkHarf =
      etiket.ad[0]
        ?.toUpperCase()
        ?.replace("Ç", "C")
        ?.replace("Ğ", "G")
        ?.replace("İ", "I")
        ?.replace("Ö", "O")
        ?.replace("Ş", "S")
        ?.replace("Ü", "U");

    if (!harfGruplari[ilkHarf]) {
      harfGruplari[ilkHarf] = [];
    }

    harfGruplari[ilkHarf].push(etiket);
  }

  const harfler =
    Object.keys(harfGruplari).sort();

  return (
    <main className="min-h-screen bg-[#070b14] text-white">

      <section className="border-b border-white/10 bg-gradient-to-b from-[#0d1320] to-[#070b14]">

        <div className="mx-auto max-w-6xl px-6 py-20">

          <div className="max-w-3xl">

            <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
              Cezaevi Karar Etiketleri
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight text-white">
              Cezaevi haklarına ilişkin
              kararları etiketler üzerinden keşfedin
            </h1>

            <p className="mt-8 text-lg leading-8 text-slate-300">
              Çıplak arama, disiplin cezası, telefon görüşmesi,
              havalandırma, sakıncalı mektup, tek kişilik oda,
              ziyaret hakkı ve diğer cezaevi uygulamalarına ilişkin
              Anayasa Mahkemesi kararlarını etiketler üzerinden inceleyin.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">

        <div>

          <h2 className="text-3xl font-bold text-[#f3d99b]">
            Popüler Etiketler
          </h2>

          <p className="mt-3 text-slate-400">
            Kullanıcıların en çok incelediği cezaevi konuları
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">

          {populerEtiketler.map((etiket) => (

            <Link
              key={`pop-${etiket.id}`}
              href={`/etiketler/${etiket.slug}`}
              className="group rounded-2xl border border-amber-300/20 bg-amber-300/10 px-5 py-4 transition hover:-translate-y-1 hover:border-amber-300/40"
            >

              <div className="flex items-center gap-3">

                <span className="text-base font-semibold text-white">
                  {etiket.ad}
                </span>

                <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-bold text-amber-200">
                  {etiket.toplam}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">

        <div className="mb-10">

          <h2 className="text-3xl font-bold text-[#f3d99b]">
            A-Z Etiket Dizini
          </h2>

          <p className="mt-3 text-slate-400">
            Tüm cezaevi karar etiketlerini alfabetik olarak inceleyin.
          </p>
        </div>

        <div className="sticky top-20 z-20 mb-10 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-[#0d1320]/90 p-4 backdrop-blur">

          {harfler.map((harf) => (

            <a
              key={harf}
              href={`#harf-${harf}`}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-amber-300/40 hover:text-[#f3d99b]"
            >
              {harf}
            </a>
          ))}
        </div>

        <div className="space-y-16">

          {harfler.map((harf) => (

            <section
              key={harf}
              id={`harf-${harf}`}
            >

              <h3 className="mb-6 text-4xl font-black text-[#f3d99b]">
                {harf}
              </h3>

              <div className="flex flex-wrap gap-4">

                {harfGruplari[harf].map((etiket) => (

                  <Link
                    key={`az-${etiket.id}`}
                    href={`/etiketler/${etiket.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 transition hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/[0.06]"
                  >

                    <div className="flex items-center gap-3">

                      <span className="text-base font-semibold text-white transition group-hover:text-[#f3d99b]">
                        {etiket.ad}
                      </span>

                      <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
                        {etiket.toplam}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}