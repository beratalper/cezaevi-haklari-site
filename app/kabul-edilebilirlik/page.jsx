import Link from "next/link";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const metadata = {
  title: "AYM Kabul Edilebilirlik Rehberi | Cezaevi Hakları",
  description:
    "Anayasa Mahkemesi bireysel başvurularında süre aşımı, başvuru yollarının tüketilmemesi, açıkça dayanaktan yoksunluk ve diğer kabul edilemezlik sebeplerini açıklayan rehber.",
};

export default async function KabulEdilebilirlikPage() {
  const result = await pool.query(`
    SELECT id, soru, slug, sira, ozet
    FROM bireysel_basvuru_kabul_edilebilirlik
    WHERE aktif = true
    ORDER BY sira ASC;
  `);

  const rehberler = result.rows;

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
          Anayasa Mahkemesi Kabul Edilebilirlik Kriterleri
        </p>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
          Başvurunuz neden incelenmeden reddedilebilir?
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-white/65">
          Anayasa Mahkemesi her başvurunun esasını incelemez. Süre aşımı,
          başvuru yollarının tüketilmemesi, açıkça dayanaktan yoksunluk ve
          benzeri nedenlerle birçok başvuru kabul edilemez bulunabilmektedir.
          Bu rehberde özellikle cezaevi uygulamalarına ilişkin başvurularda
          sık karşılaşılan kabul edilebilirlik sorunlarını sade bir dille
          açıklıyoruz.
        </p>

        <div className="mt-12 grid gap-5">
          {rehberler.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >

              <h2 className="text-2xl font-bold text-white">{item.soru}</h2>

              {item.ozet && (
                <p className="mt-4 text-[17px] leading-8 text-white/70">
                  {item.ozet}
                </p>
              )}

              <Link
                href={`/kabul-edilebilirlik/${item.slug}`}
                className="mt-5 inline-block text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Ayrıntılı oku →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}