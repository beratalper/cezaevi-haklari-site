import { Pool } from "pg";

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
    const kararRes = await pool.query(
        `
  SELECT k.basvuru_no, ka.karar_adi
  FROM yazi_kararlar k
  LEFT JOIN kararlar ka
    ON ka.basvuru_no = k.basvuru_no
  WHERE k.yazi_id = $1
`,
        [yazi.id]
    );

    const ilgiliKararlar = kararRes.rows;

    if (!yazi) {
        return (
            <main className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
                Yazı bulunamadı.
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-5xl font-bold leading-tight">
                    {yazi.baslik}
                </h1>

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

    prose-li:text-white/75

    prose-strong:text-amber-300

    prose-h2:text-3xl
    prose-h2:mt-16
    prose-h2:mb-6

    prose-ul:my-8

    prose-a:text-amber-300
  "
                >
                    <div
                        dangerouslySetInnerHTML={{
                            __html: yazi.icerik,
                        }}
                    />
                </article>
                {ilgiliKararlar.length > 0 && (
                    <section className="mt-20 border-t border-white/10 pt-12">
                        <h2 className="text-3xl font-bold mb-8">
                            İlgili Kararlar
                        </h2>

                        <div className="space-y-4">
                            {ilgiliKararlar.map((karar) => (
                                <a
                                    key={karar.basvuru_no}
                                    href={`/kararlar/${karar.basvuru_no.replace("/", "-")}`}
                                    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-amber-300/40 transition"
                                >
                                    <div className="text-sm text-amber-300 font-semibold">
                                        Başvuru No: {karar.basvuru_no}
                                    </div>

                                    <div className="mt-2 text-xl font-semibold text-white">
                                        {karar.karar_adi || "Kararı İncele"}
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