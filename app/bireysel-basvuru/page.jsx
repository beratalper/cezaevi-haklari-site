import Link from "next/link";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export const metadata = {
    title: "Bireysel Başvuru Rehberi | Cezaevi Hakları",
    description:
        "Anayasa Mahkemesine bireysel başvuru süresi, başvuru yeri, gerekli belgeler, adli yardım ve tedbir kararı hakkında temel bilgiler.",
};

export default async function BireyselBasvuruPage() {
    const result = await pool.query(`
    SELECT id, soru, cevap, slug, kategori, sira, ozet
    FROM bireysel_basvuru_sss
    WHERE aktif = true
    ORDER BY sira ASC;
  `);

    const sssler = result.rows;

    return (
        <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
            <section className="mx-auto max-w-5xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
                    Anayasa Mahkemesi Bireysel Başvuru
                </p>

                <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
                    Bireysel Başvuru Rehberi
                </h1>

                <p className="mt-8 max-w-3xl text-lg leading-8 text-white/65">
                    Anayasa Mahkemesine bireysel başvuru yaparken en sık karşılaşılan
                    süre, başvuru yeri, gerekli belgeler, adli yardım ve tedbir kararı
                    gibi temel sorulara kısa cevaplar.
                </p>

                <div className="mt-12 grid gap-5">
                    {sssler.map((item) => (
                        <article
                            key={item.id}
                            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                        >
                            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                                {item.kategori}
                            </div>

                            <h2 className="text-2xl font-bold text-white">{item.soru}</h2>

                            <p className="mt-4 text-[17px] leading-8 text-white/70">
                                {item.ozet || item.cevap}
                            </p>

                            <Link
                                href={`/bireysel-basvuru/${item.slug}`}
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