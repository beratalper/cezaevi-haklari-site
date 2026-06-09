import Link from "next/link";
import { notFound } from "next/navigation";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function formatMarkdown(text = "") {
    return text
        .split("\n")
        .map((line, index) => {
            if (line.startsWith("## ")) {
                return (
                    <h2 key={index} className="mt-14 text-3xl font-bold text-amber-300">
                        {line.replace("## ", "")}
                    </h2>
                );
            }

            if (line.startsWith("- ")) {
                return (
                    <li key={index} className="ml-6 list-disc text-[18px] leading-8 text-white/75">
                        {line.replace("- ", "")}
                    </li>
                );
            }

            if (!line.trim()) {
                return null;
            }

            return (
                <p key={index} className="text-[19px] leading-9 text-white/75">
                    {line}
                </p>
            );
        });
}

export async function generateMetadata({ params }) {
    const { slug } = await params;

    const result = await pool.query(
        `
    SELECT seo_baslik, seo_aciklama, soru, cevap
    FROM bireysel_basvuru_sss
    WHERE slug = $1
      AND aktif = true
    LIMIT 1
    `,
        [slug]
    );

    if (!result.rows.length) return {};

    const item = result.rows[0];

    return {
        title: `${item.seo_baslik || item.soru} | Cezaevi Hakları`,
        description: item.seo_aciklama || item.cevap,
    };
}

export default async function SSSDetayPage({ params }) {
    const { slug } = await params;

    const result = await pool.query(
        `
    SELECT *
    FROM bireysel_basvuru_sss
    WHERE slug = $1
      AND aktif = true
    LIMIT 1
    `,
        [slug]
    );

    if (!result.rows.length) {
        notFound();
    }

    const item = result.rows[0];

    let kararlar = [];

    const kararResult = await pool.query(
        `
  SELECT
  k.karar_adi,
  k.slug,
  k.basvuru_no,
  k.karar_tarihi,
  k.sonuc,
  k.sonuc_aym,
  bk.konu_baglam_ozeti,
  bk.sira
  FROM bireysel_basvuru_sss_kararlar bk
  JOIN kararlar k
    ON k.slug = bk.karar_slug
  WHERE bk.sss_id = $1
  ORDER BY bk.sira ASC
  `,
        [item.id]
    );

    kararlar = kararResult.rows;

    return (
        <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
            <section className="mx-auto max-w-4xl">
                <Link
                    href="/bireysel-basvuru"
                    className="mb-8 inline-block text-sm font-semibold text-amber-300 hover:text-amber-200"
                >
                    ← Bireysel başvuru rehberine dön
                </Link>

                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                    {item.kategori}
                </div>

                <h1 className="text-4xl font-bold leading-tight">
                    {item.seo_baslik || item.soru}
                </h1>

                {item.ozet && (
                    <p className="mt-6 text-xl leading-9 text-white/70">{item.ozet}</p>
                )}

                <article className="mt-12 max-w-none">
                    <div className="space-y-6">
                        {formatMarkdown(item.icerik || item.cevap)}
                    </div>
                </article>

                {kararlar.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-2xl font-bold text-amber-300">
                            İlgili AYM Kararları
                        </h2>

                        <div className="mt-6 grid gap-5">
                            {kararlar.map((karar) => (
                                <article
                                    key={karar.slug}
                                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                                >
                                    <div className="text-sm text-white/50">
                                        {karar.basvuru_no} · {karar.karar_tarihi}
                                    </div>

                                    <h3 className="mt-2 text-xl font-bold text-white">
                                        {karar.karar_adi || "AYM Kararı"}
                                    </h3>

                                    <div className="mt-2 text-sm font-semibold text-amber-300">
                                        {karar.sonuc_aym || karar.sonuc}
                                    </div>

                                    {karar.konu_baglam_ozeti && (
                                        <p className="mt-4 text-[16px] leading-7 text-white/70">
                                            {karar.konu_baglam_ozeti}
                                        </p>
                                    )}

                                    <Link
                                        href={`/kararlar/${karar.slug}`}
                                        className="mt-5 inline-block text-sm font-semibold text-amber-300 hover:text-amber-200"
                                    >
                                        Kararı incele →
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {item.kaynak_notu && (
                    <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-white/55">
                        {item.kaynak_notu}
                    </div>
                )}
            </section>
        </main>
    );
}