import Link from "next/link";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function slugify(value = "") {
  return value
    .toLowerCase()
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function KonularPage() {

  const result = await pool.query(`
  SELECT
    kis.mudahale_iddiasi_aym,
    COUNT(DISTINCT kis.karar_id) AS toplam

  FROM karar_inceleme_sonuclari kis

  JOIN kararlar k
    ON k.id = kis.karar_id

  WHERE k.cezaevi_mi = true

    AND kis.mudahale_iddiasi_aym IN (
      'İnfaz Kurumunun fiziki koşulları',
      'Nakil aracının fiziki koşulları',
      'Ceza infaz kurumu uygulamaları',
      'Ceza infaz kurumunda açlık grevi',
      'Ceza infaz kurumunda eğitim',
      'Ceza infaz kurumunda ifade',
      'Ceza infaz kurumunda kitap',
      'İnfaz kurumunda güç kullanımı',
      'Ceza infaz kurumunda süreli yayın',
      'Haberleşme-ceza infaz kurumu uygulamaları (sakıncalı mektup hariç)',
      'Haberleşme-Sakıncalı mektup',
      'İnfaz, koşullu salıverme'
    )

  GROUP BY kis.mudahale_iddiasi_aym

  ORDER BY toplam DESC
`);

  const kategoriler = result.rows.map((item) => ({
    baslik: item.mudahale_iddiasi_aym,
    slug: slugify(item.mudahale_iddiasi_aym),
    toplam: Number(item.toplam || 0),
  }));

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl">

          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Cezaevi Hakları
          </p>

          <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-7xl">
            Konular
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Anayasa Mahkemesi kararlarında yer alan müdahale iddialarına göre
            kararları inceleyin.
          </p>

          <div className="mt-14 space-y-5">

            {kategoriler.map((item) => (
              <Link
                key={item.baslik}
                href={`/konular/${item.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-[#c9a96e]/50 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-6">

                  <div className="min-w-0">

                    <div className="mb-3 h-1 w-14 rounded-full bg-[#c9a96e]" />

                    <h2 className="font-serif text-2xl font-semibold leading-8 text-amber-300">
                      {item.baslik}
                    </h2>

                    <div className="mt-4 text-sm text-slate-400">
                      {item.toplam} karar
                    </div>

                  </div>

                  <div className="shrink-0 text-sm font-semibold text-amber-300">
                    İncele →
                  </div>

                </div>
              </Link>
            ))}

          </div>
        </div>
      </section>
    </main>
  );
}