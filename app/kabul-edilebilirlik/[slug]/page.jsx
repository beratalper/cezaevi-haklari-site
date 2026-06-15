import Link from "next/link";
import { notFound } from "next/navigation";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function generateMetadata({ params }) {
    const { slug } = await params;

    const result = await pool.query(
        `
    SELECT seo_baslik, seo_aciklama, soru, ozet
    FROM bireysel_basvuru_kabul_edilebilirlik
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
        description: item.seo_aciklama || item.ozet,
    };
}

export default async function KabulEdilebilirlikDetayPage({ params }) {
    const { slug } = await params;

    const result = await pool.query(
        `
    SELECT *
    FROM bireysel_basvuru_kabul_edilebilirlik
    WHERE slug = $1
      AND aktif = true
    LIMIT 1
    `,
        [slug]
    );

    if (!result.rows.length) notFound();

    const item = result.rows[0];

    const kararResult = await pool.query(
        `
    SELECT
      k.id,
      k.karar_adi,
      k.slug,
      k.basvuru_no,
      k.karar_tarihi,
      k.sonuc,
      k.sonuc_aym,
      bk.konu_baglam_ozeti,
      bk.sira
    FROM bireysel_basvuru_kabul_edilebilirlik_kararlar bk
    JOIN kararlar k
      ON k.slug = bk.karar_slug
    WHERE bk.rehber_id = $1
    ORDER BY bk.sira ASC
    `,
        [item.id]
    );

    const kararlar = kararResult.rows;

    return (
        <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
            <section className="mx-auto max-w-4xl">
                <Link
                    href="/kabul-edilebilirlik"
                    className="mb-8 inline-block text-sm font-semibold text-amber-300 hover:text-amber-200"
                >
                    ← Kabul edilebilirlik rehberine dön
                </Link>

                <h1 className="text-4xl font-bold leading-tight">
                    {item.seo_baslik || item.soru}
                </h1>

                {item.ozet && (
                    <p className="mt-6 text-xl leading-9 text-white/70">{item.ozet}</p>
                )}

                {item.icerik ? (
                    <article
                        className="
                            prose
                            prose-invert
                            prose-lg
                            max-w-none
                            mt-14

                            prose-headings:font-bold

                            prose-p:text-white/80
                            prose-p:leading-8
                            prose-p:mb-6

                            prose-li:text-white/75
                            prose-li:leading-8

                            prose-strong:text-orange-400
prose-strong:italic
prose-strong:font-semibold

                            prose-h2:text-3xl
                            prose-h2:text-amber-300
                            prose-h2:mt-16
                            prose-h2:mb-6

                            prose-h3:text-2xl
                            prose-h3:mt-12
                            prose-h3:mb-4
                            prose-h3:text-amber-300

                            prose-ul:my-8
                            prose-ul:list-disc
                            prose-ul:pl-6

                            prose-a:text-amber-300
                        "
                        dangerouslySetInnerHTML={{ __html: item.icerik }}
                    />
                ) : (
                    <article className="mt-12 max-w-none">
                        <p className="text-[19px] leading-9 text-white/65">
                            Bu rehberin ayrıntılı içeriği hazırlanıyor.
                        </p>
                    </article>
                )}

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
                                        href={`/karar/${karar.id}`}
                                        className="mt-5 inline-block text-sm font-semibold text-amber-300 hover:text-amber-200"
                                    >
                                        Kararı incele →
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </section>
        </main>
    );
}