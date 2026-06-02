import Link from "next/link";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.cezaevihaklari.com";

export const metadata = {
    title: "AYM Cezaevi İçtihat Rehberleri | Cezaevi Hakları",
    description:
        "Anayasa Mahkemesinin ceza infaz kurumu kararlarından çıkarılan ihlal ve ihlal yok içtihat kuralları, pratik testler ve konu bazlı cezaevi hakları rehberleri.",
    alternates: {
        canonical: `${SITE_URL}/ictihatlar`,
    },
    openGraph: {
        title: "AYM Cezaevi İçtihat Rehberleri",
        description:
            "Ceza infaz kurumlarına ilişkin AYM bireysel başvuru kararlarından çıkarılan konu bazlı içtihat rehberleri.",
        url: `${SITE_URL}/ictihatlar`,
        siteName: "Cezaevi Hakları",
        locale: "tr_TR",
        type: "website",
    },
};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function getRehberler() {
    const result = await pool.query(`
        SELECT
            slug,
            baslik,
            aciklama,
            istatistik_incelenen,
            istatistik_ihlal,
            istatistik_ihlal_yok
        FROM ictihat_kategori_haritasi
        ORDER BY id;
    `);

    return result.rows;
}

export default async function Page() {
    const rehberler = await getRehberler();

    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "AYM Cezaevi İçtihat Rehberleri",
        description:
            "Anayasa Mahkemesinin ceza infaz kurumlarına ilişkin bireysel başvuru kararlarından çıkarılan konu bazlı içtihat rehberleri.",
        url: `${SITE_URL}/ictihatlar`,
        mainEntity: {
            "@type": "ItemList",
            itemListElement: rehberler.map((rehber, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: rehber.baslik,
                description: rehber.aciklama,
                url: `${SITE_URL}/ictihatlar/${rehber.slug}`,
            })),
        },
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Ana Sayfa",
                item: SITE_URL,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "İçtihatlar",
                item: `${SITE_URL}/ictihatlar`,
            },
        ],
    };

    return (
        <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(collectionSchema),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
            />

            <div className="mx-auto max-w-5xl">
                <h1 className="text-5xl font-bold leading-tight mb-6">
                    AYM Cezaevi İçtihat Rehberleri
                </h1>

                <p className="text-lg text-white/60 mb-6">
                    Anayasa Mahkemesinin ceza infaz kurumlarına ilişkin
                    bireysel başvuru kararlarından çıkarılan pratik içtihat
                    testleri, ihlal ölçütleri ve temel kurallar.
                </p>

                <p className="text-white/50 leading-7 mb-10">
                    Bu sayfada cezaevinde sağlık, haberleşme, disiplin
                    cezaları, ziyaret, kötü muamele, mahkemeye erişim, yayınlara
                    ulaşma ve benzeri konularda AYM kararlarından oluşturulan
                    konu bazlı rehberlere ulaşabilirsiniz.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {rehberler.map((rehber) => (
                        <Link
                            key={rehber.slug}
                            href={`/ictihatlar/${rehber.slug}`}
                            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-amber-300/40 transition"
                        >
                            <div className="text-sm text-amber-300 font-semibold mb-2">
                                {rehber.istatistik_incelenen} AYM kararı incelendi
                            </div>

                            <h2 className="text-2xl font-semibold mb-3 text-white">
                                {rehber.baslik}
                            </h2>

                            <p className="text-white/60 leading-7">
                                {rehber.aciklama}
                            </p>

                            <div className="mt-5 flex gap-3 text-sm">
                                <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-300">
                                    {rehber.istatistik_ihlal} ihlal
                                </span>

                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">
                                    {rehber.istatistik_ihlal_yok} ihlal yok
                                </span>
                            </div>

                            <div className="mt-5 text-sm font-semibold text-amber-300">
                                İçtihat rehberini aç →
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}