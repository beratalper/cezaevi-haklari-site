import { Pool } from "pg";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function getIctihatRehberi(slug, searchParams = {}) {
    const result = await pool.query(
        `
        SELECT
            h.id,
            h.slug,
            h.kategori,
            h.alt_kategori,
            h.baslik,
            h.aciklama,
            h.istatistik_incelenen,
            h.istatistik_ihlal,
            h.istatistik_ihlal_yok,
            h.ihlal_aciklama,
            h.nasil_olusturuldu,
            h.hizli_sonuc_ihlal,
            h.hizli_sonuc_ihlal_yok,
            h.test_sorulari,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', k.id,
                        'kural_adi', k.kural_adi,
                        'kural_metni', k.kural_metni,
                        'sonuc_tipi', k.sonuc_tipi,
                        'kural_tipi', k.kural_tipi,
                        'destekleyen_kararlar', k.destekleyen_kararlar,
                        'kurucu_kararlar', k.kurucu_kararlar,
                        'notlar', k.notlar
                    )
                    ORDER BY k.id
                ) FILTER (WHERE k.id IS NOT NULL),
                '[]'
            ) AS kurallar
        FROM ictihat_kategori_haritasi h
        LEFT JOIN ictihat_kurallari k
          ON k.kategori = h.kategori
         AND k.alt_kategori = h.alt_kategori
        WHERE h.slug = $1
        GROUP BY
            h.id,
            h.slug,
            h.kategori,
            h.alt_kategori,
            h.baslik,
            h.aciklama,
            h.istatistik_incelenen,
            h.istatistik_ihlal,
            h.istatistik_ihlal_yok,
            h.ihlal_aciklama,
            h.nasil_olusturuldu,
            h.hizli_sonuc_ihlal,
            h.hizli_sonuc_ihlal_yok,
            h.test_sorulari
        `,
        [slug]
    );

    const rehber = result.rows[0];

    if (!rehber) {
        return null;
    }

    const basvuruNolari = [
        ...new Set(
            rehber.kurallar.flatMap((kural) => [
                ...(kural.destekleyen_kararlar || []),
                ...(kural.kurucu_kararlar || []),
            ])
        ),
    ];

    const kararResult = await pool.query(
        `
        SELECT
            basvuru_no,
            karar_adi
        FROM kararlar
        WHERE basvuru_no = ANY($1)
        `,
        [basvuruNolari]
    );

    const kararMap = Object.fromEntries(
        kararResult.rows.map((karar) => [
            karar.basvuru_no,
            karar,
        ])
    );

    rehber.kurallar = rehber.kurallar.map((kural) => {
        const kurucuNolar = kural.kurucu_kararlar || [];
        const destekleyenNolar = kural.destekleyen_kararlar || [];

        return {
            ...kural,
            kurucuKararlar: kurucuNolar.map((basvuruNo) => ({
                basvuru_no: basvuruNo,
                karar_adi: kararMap[basvuruNo]?.karar_adi || basvuruNo,
            })),
            destekleyenKararlar: destekleyenNolar
                .filter((basvuruNo) => !kurucuNolar.includes(basvuruNo))
                .map((basvuruNo) => ({
                    basvuru_no: basvuruNo,
                    karar_adi: kararMap[basvuruNo]?.karar_adi || basvuruNo,
                })),
        };
    });

    const kararSayfa = Math.max(
        Number(searchParams?.kararSayfa || 1),
        1
    );

    const kararLimit = 10;
    const kararOffset = (kararSayfa - 1) * kararLimit;
    const kararKuralMap = {};

    rehber.kurallar.forEach((kural) => {
        const tumKararlar = [
            ...(kural.kurucu_kararlar || []),
            ...(kural.destekleyen_kararlar || []),
        ];

        [...new Set(tumKararlar)].forEach((basvuruNo) => {
            if (!kararKuralMap[basvuruNo]) {
                kararKuralMap[basvuruNo] = [];
            }

            kararKuralMap[basvuruNo].push(kural.kural_adi);
        });
    });

    const rehberKararlariResult = await pool.query(
        `
        SELECT
            basvuru_no,
            karar_adi,
            basvuru_konusu,
            sonuc_aym,
            karar_tarihi
        FROM kararlar
        WHERE ictihat_slug = $1
        ORDER BY karar_tarihi DESC NULLS LAST
        LIMIT $2 OFFSET $3
        `,
        [slug, kararLimit, kararOffset]
    );

    const rehberKararSayisiResult = await pool.query(
        `
        SELECT COUNT(*)::int AS toplam
        FROM kararlar
        WHERE ictihat_slug = $1
        `,
        [slug]
    );

    rehber.rehberKararlari = rehberKararlariResult.rows.map((karar) => ({
        ...karar,
        ilgiliKurallar: kararKuralMap[karar.basvuru_no] || [],
    }));
    rehber.rehberKararlariToplam =
        rehberKararSayisiResult.rows[0]?.toplam || 0;
    rehber.rehberKararSayfa = kararSayfa;
    rehber.rehberKararLimit = kararLimit;

    return rehber;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;

    const rehber = await getIctihatRehberi(slug);

    if (!rehber) {
        return {};
    }

    const title =
        rehber.baslik ||
        `${rehber.alt_kategori} İçtihat Rehberi`;

    const description =
        rehber.aciklama;

    const url =
        `https://cezaevihaklari.com/ictihatlar/${rehber.slug}`;

    return {
        title,
        description,

        alternates: {
            canonical: url,
        },

        openGraph: {
            title,
            description,
            url,
            type: "article",
            siteName: "Cezaevi Hakları",
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

function KararListeleri({ kural }) {
    return (
        <div className="mt-5 space-y-4 text-sm">
            {kural.kurucuKararlar?.length > 0 && (
                <div>
                    <div className="mb-2 font-semibold text-amber-300">
                        🏛 Kurucu Kararlar ({kural.kurucuKararlar.length})
                    </div>

                    <ul className="space-y-1">
                        {kural.kurucuKararlar.map((karar) => (
                            <li key={karar.basvuru_no}>
                                <a
                                    href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${karar.basvuru_no}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-300 hover:text-amber-200 hover:underline"
                                >
                                    • {karar.karar_adi} - {karar.basvuru_no}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {kural.destekleyenKararlar?.length > 0 && (
                <div>
                    <div className="mb-2 font-semibold text-slate-300">
                        📚 Destekleyen Kararlar ({kural.destekleyenKararlar.length})
                    </div>

                    <ul className="space-y-1">
                        {kural.destekleyenKararlar.map((karar) => (
                            <li key={karar.basvuru_no}>
                                <a
                                    href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${karar.basvuru_no}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-300 hover:text-white hover:underline"
                                >
                                    • {karar.karar_adi} - {karar.basvuru_no}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function KuralKart({ kural, renk }) {
    const stiller =
        renk === "red"
            ? "border-red-900/60 bg-red-950/20"
            : "border-emerald-900/60 bg-emerald-950/20";

    return (
        <article className={`rounded-2xl border p-5 ${stiller}`}>
            <h3 className="text-xl font-semibold">
                {kural.kural_adi}
            </h3>

            <p className="mt-3 leading-7 text-slate-300">
                {kural.kural_metni}
            </p>

            <KararListeleri kural={kural} />
        </article>
    );
}

export default async function IctihatDetayPage({
    params,
    searchParams,
}) {
    const { slug } = await params;
    const sp = await searchParams;

    const rehber = await getIctihatRehberi(slug, sp);

    if (!rehber) {
        notFound();
    }

    const ihlalKurallari = rehber.kurallar.filter(
        (kural) => kural.sonuc_tipi === "İhlal"
    );

    const ihlalYokKurallari = rehber.kurallar.filter(
        (kural) => kural.sonuc_tipi === "İhlal Olmadığı"
    );

    const toplamSayfa = Math.max(
        Math.ceil(
            rehber.rehberKararlariToplam /
            rehber.rehberKararLimit
        ),
        1
    );

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: rehber.baslik,
        description: rehber.aciklama,
        author: {
            "@type": "Organization",
            name: "Cezaevi Hakları",
        },
        publisher: {
            "@type": "Organization",
            name: "Cezaevi Hakları",
        },
        mainEntityOfPage:
            `https://cezaevihaklari.com/ictihatlar/${rehber.slug}`,
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Ana Sayfa",
                item: "https://cezaevihaklari.com",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "İçtihat Rehberleri",
                item: "https://cezaevihaklari.com/ictihatlar",
            },
            {
                "@type": "ListItem",
                position: 3,
                name: rehber.baslik,
                item:
                    `https://cezaevihaklari.com/ictihatlar/${rehber.slug}`,
            },
        ],
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity:
            (rehber.test_sorulari || []).map(
                (soru) => ({
                    "@type": "Question",
                    name: soru,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text:
                            rehber.ihlal_aciklama ||
                            rehber.aciklama,
                    },
                })
            ),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(articleSchema),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema),
                }}
            />

            <main className="min-h-screen bg-[#070b14] px-6 py-10 text-white">
                <section className="mx-auto max-w-5xl">
                    <p className="text-sm text-slate-400">
                        İçtihat Rehberleri / {rehber.kategori}
                    </p>

                    <h1 className="mt-3 text-4xl font-bold tracking-tight">
                        {rehber.baslik || `${rehber.alt_kategori} İçtihat Rehberi`}
                    </h1>

                    <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                        {rehber.aciklama}
                    </p>

                    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                            <div className="text-4xl font-bold">
                                {rehber.istatistik_incelenen}
                            </div>
                            <div className="mt-2 text-sm text-white/60">
                                İncelenen Karar
                            </div>
                        </div>

                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
                            <div className="text-4xl font-bold text-red-400">
                                {rehber.istatistik_ihlal}
                            </div>
                            <div className="mt-2 text-sm text-white/60">
                                İhlal
                            </div>
                        </div>

                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
                            <div className="text-4xl font-bold text-emerald-400">
                                {rehber.istatistik_ihlal_yok}
                            </div>
                            <div className="mt-2 text-sm text-white/60">
                                İhlal Yok
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 space-y-6">
                        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <h2 className="mb-3 text-2xl font-semibold">
                                AYM'nin Dikkat Ettiği Konular
                            </h2>
                            <p className="leading-8 text-white/70">
                                {rehber.ihlal_aciklama}
                            </p>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <h2 className="mb-3 text-2xl font-semibold">
                                Bu rehber nasıl oluşturuldu?
                            </h2>
                            <p className="leading-8 text-white/70">
                                {rehber.nasil_olusturuldu}
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-semibold">
                                Hızlı Sonuç
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                                    <h3 className="mb-3 font-semibold">
                                        AYM'nin En Sık İhlal Bulduğu Durumlar
                                    </h3>

                                    <ul className="space-y-2 text-sm text-white/80">
                                        {rehber.hizli_sonuc_ihlal?.map((item) => (
                                            <li key={item}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                                    <h3 className="mb-3 font-semibold">
                                        AYM'nin Genellikle Kabul Ettiği Müdahaleler
                                    </h3>

                                    <ul className="space-y-2 text-sm text-white/80">
                                        {rehber.hizli_sonuc_ihlal_yok?.map((item) => (
                                            <li key={item}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="mt-10">
                        <h2 className="mb-4 text-2xl font-semibold">
                            AYM Testi
                        </h2>

                        <div className="grid gap-3 md:grid-cols-2">
                            {rehber.test_sorulari?.map((soru) => (
                                <div
                                    key={soru}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                                >
                                    ☐ {soru}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-10">
                        <h2 className="text-2xl font-bold text-red-300">
                            AYM İhlal Bulabilir Eğer
                        </h2>

                        <div className="mt-5 grid gap-4">
                            {ihlalKurallari.map((kural) => (
                                <KuralKart
                                    key={kural.id}
                                    kural={kural}
                                    renk="red"
                                />
                            ))}
                        </div>
                    </section>

                    <section className="mt-12">
                        <h2 className="text-2xl font-bold text-emerald-300">
                            AYM İhlal Bulmayabilir Eğer
                        </h2>

                        <div className="mt-5 grid gap-4">
                            {ihlalYokKurallari.map((kural) => (
                                <KuralKart
                                    key={kural.id}
                                    kural={kural}
                                    renk="emerald"
                                />
                            ))}
                        </div>
                    </section>

                    <section className="mt-14">
                        <h2 className="text-2xl font-bold text-white">
                            Bu Rehbere Ait Kararlar
                        </h2>

                        <div className="mt-5 grid gap-3">
                            {rehber.rehberKararlari?.map((karar) => (
                                <a
                                    key={karar.basvuru_no}
                                    href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${karar.basvuru_no}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-amber-300/40"
                                >
                                    <div className="text-sm font-semibold text-amber-300">
                                        {rehber.alt_kategori}
                                    </div>

                                    <div className="mt-2 font-semibold text-white">
                                        {karar.karar_adi} - {karar.basvuru_no}
                                    </div>

                                    {karar.ilgiliKurallar?.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {karar.ilgiliKurallar.map((kural) => (
                                                <span
                                                    key={kural}
                                                    className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200"
                                                >
                                                    {kural}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            {rehber.rehberKararSayfa > 1 ? (
                                <a
                                    href={`/ictihatlar/${rehber.slug}?kararSayfa=${rehber.rehberKararSayfa - 1}`}
                                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:border-amber-300/40"
                                >
                                    ← Önceki
                                </a>
                            ) : (
                                <span />
                            )}

                            <div className="text-sm text-white/50">
                                Sayfa {rehber.rehberKararSayfa} / {toplamSayfa}
                            </div>

                            {rehber.rehberKararSayfa < toplamSayfa ? (
                                <a
                                    href={`/ictihatlar/${rehber.slug}?kararSayfa=${rehber.rehberKararSayfa + 1}`}
                                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:border-amber-300/40"
                                >
                                    Sonraki →
                                </a>
                            ) : (
                                <span />
                            )}
                        </div>
                    </section>
                </section>
            </main>
        </>
    );
}