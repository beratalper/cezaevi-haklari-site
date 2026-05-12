import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function EtiketPage({ params }) {
  const { slug } = await params;
  const temizTag = slug.replaceAll("-", " ");
  
  const result = await pool.query(
    `
    SELECT *
    FROM yazilar
    WHERE LOWER(tagler) LIKE LOWER($1)
    ORDER BY id DESC
  `,
    [`%${temizTag}%`]
  );

  const yazilar = result.rows;

  return (
    <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-bold">
          #{temizTag}
        </h1>

        <p className="mt-4 text-white/60">
          Bu etiketle ilgili yazılar
        </p>

        <div className="mt-14 space-y-6">
          {yazilar.map((yazi) => (
            <a
              key={yazi.id}
              href={`/yazilar/${yazi.slug}`}
              className="block rounded-3xl border border-white/10 bg-white/[0.03] p-7 hover:border-amber-300/40 transition"
            >
              <div className="text-sm font-semibold text-amber-300">
                {yazi.kategori}
              </div>

              <h2 className="mt-3 text-2xl font-bold">
                {yazi.baslik}
              </h2>

              <p className="mt-4 text-white/65 leading-8">
                {yazi.ozet}
              </p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}