import Link from "next/link";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

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

    return (
        <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
            <div className="mx-auto max-w-5xl">

                <h1 className="text-5xl font-bold leading-tight mb-6">
                    AYM Cezaevi İçtihat Rehberleri
                </h1>

                <p className="text-lg text-white/60 mb-10">
                    Anayasa Mahkemesinin ceza infaz kurumu kararlarından
                    çıkarılan pratik içtihat testleri ve temel kurallar.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {rehberler.map((rehber) => (
                        <Link
                            key={rehber.slug}
                            href={`/ictihatlar/${rehber.slug}`}
                            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-amber-300/40 transition"
                        >
                            <div className="text-sm text-amber-300 font-semibold mb-2">
                                {rehber.istatistik_incelenen} karar incelendi
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
                                Rehberi Aç →
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </main>
    );
}