import { Pool } from "pg";
import Script from "next/script";

export const dynamic = "force-dynamic";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function YaziDetay({ params }) {
    const { slug } = await params;

    const result = await pool.query(
        `
    SELECT *
    FROM yazilar
    WHERE slug = $1
  `,
        [slug]
    );

    const yazi = result.rows[0];
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: yazi.baslik,
        description: yazi.ozet,
        author: {
            "@type": "Organization",
            name: "Cezaevi Hakları",
        },
        publisher: {
            "@type": "Organization",
            name: "Cezaevi Hakları",
            logo: {
                "@type": "ImageObject",
                url: "https://cezaevihaklari.com/favicon.png",
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://cezaevihaklari.com/yazilar/${yazi.slug}`,
        },
        datePublished: yazi.created_at,
        dateModified: yazi.updated_at || yazi.created_at,
    };
    const kararRes = await pool.query(
        `
      SELECT
        k.basvuru_no,
        ka.karar_adi,
        ka.basvuru_konusu,
        ka.slug,
        ka.aym_url
      FROM yazi_kararlar k
      LEFT JOIN kararlar ka
        ON ka.basvuru_no = k.basvuru_no
      WHERE k.yazi_id = $1
    `,
        [yazi.id]
    );

    const ilgiliKararlar = kararRes.rows;
    const ilkKarar = ilgiliKararlar[0];

    let ustKategori = null;

    if (ilkKarar) {
        const kategoriRes = await pool.query(
            `
      SELECT ust_kategori
      FROM kararlar
      WHERE basvuru_no = $1
      LIMIT 1
    `,
            [ilkKarar.basvuru_no]
        );

        ustKategori = kategoriRes.rows[0]?.ust_kategori;
    }

    let digerKararlar = [];

    if (ustKategori) {
        const digerRes = await pool.query(
            `
      SELECT
        basvuru_no,
        karar_adi,
        basvuru_konusu,
        slug,
        aym_url
      FROM kararlar
      WHERE ust_kategori = $1
        AND basvuru_no != ALL($2)
      ORDER BY karar_tarihi DESC NULLS LAST
      LIMIT 6
    `,
            [
                ustKategori,
                ilgiliKararlar.map((k) => k.basvuru_no),
            ]
        );

        digerKararlar = digerRes.rows;
    }

    if (!yazi) {
        return (
            <main className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
                Yazı bulunamadı.
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">

            <Script
                id="article-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(articleSchema),
                }}
            />
            
            <div className="mx-auto max-w-4xl">
                <h1 className="text-5xl font-bold leading-tight">
                    {yazi.baslik}
                </h1>

                <div className="mb-6 flex flex-wrap gap-3">
                    {yazi.kategori && (
                        <span className="rounded-full bg-amber-300/10 border border-amber-300/20 px-4 py-1 text-sm font-semibold text-amber-300">
                            {yazi.kategori}
                        </span>
                    )}

                    {yazi.tagler &&
                        yazi.tagler.split(",").map((tag) => (
                            <a
                                key={tag}
                                href={`/etiket/${tag
                                    .trim()
                                    .toLowerCase()
                                    .replaceAll(" ", "-")}`}
                                className="rounded-full bg-white/5 border border-white/10 px-4 py-1 text-sm text-white/70 hover:border-amber-300/40 hover:text-amber-300 transition"
                            >
                                #{tag.trim()}
                            </a>
                        ))}
                </div>

                <p className="mt-6 text-lg text-white/60">
                    {yazi.ozet}
                </p>

                <article
                    className="
                      prose
                      prose-invert
                      prose-lg
                      max-w-none
                      mt-14

                      prose-headings:text-white
                      prose-headings:font-bold

                      prose-p:text-white/80
                      prose-p:leading-8
                      prose-p:mb-6

                      prose-li:text-white/75

                      prose-strong:text-amber-300

                      prose-h2:text-3xl
                      prose-h2:mt-16
                      prose-h2:mb-6

                      prose-ul:my-8

                      prose-a:text-amber-300
                    "
                    dangerouslySetInnerHTML={{
                        __html: yazi.icerik,
                    }}
                />
                {ilgiliKararlar.length > 0 && (
                    <section className="mt-20 border-t border-white/10 pt-12">
                        <h2 className="text-3xl font-bold mb-8">
                            Bu Yazıda İncelenen Kararlar
                        </h2>

                        <div className="space-y-4">
                            {ilgiliKararlar.map((karar) => (
                                <a
                                    key={karar.basvuru_no}
                                    href={karar.aym_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-amber-300/40 transition"
                                >
                                    <div className="text-sm text-amber-300 font-semibold">
                                        Başvuru No: {karar.basvuru_no}
                                    </div>

                                    <div className="mt-2 text-xl font-semibold text-white">
                                        {karar.karar_adi || "Kararı İncele"}
                                    </div>

                                    <p className="mt-3 text-sm leading-7 text-white/60">
                                        {karar.basvuru_konusu}
                                    </p>

                                    <div className="mt-4 text-sm font-semibold text-amber-300">
                                        Tam Metni Oku →
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
                {digerKararlar.length > 0 && (
                    <section className="mt-20 border-t border-white/10 pt-12">
                        <h2 className="text-3xl font-bold mb-8">
                            Bunları da İnceleyin
                        </h2>

                        <div className="space-y-4">
                            {digerKararlar.map((karar) => (
                                <a
                                    key={karar.basvuru_no}
                                    href={karar.aym_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-amber-300/40 transition"
                                >
                                    <div className="text-sm text-amber-300 font-semibold">
                                        Başvuru No: {karar.basvuru_no}
                                    </div>

                                    <div className="mt-2 text-xl font-semibold text-white">
                                        {karar.karar_adi}
                                    </div>

                                    <p className="mt-3 text-sm leading-7 text-white/60">
                                        {karar.basvuru_konusu}
                                    </p>

                                    <div className="mt-4 text-sm font-semibold text-amber-300">
                                        AYM Kararını Aç →
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}