import Link from "next/link";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function YazilarPage() {
  const result = await pool.query(`
    SELECT *
FROM yazilar
WHERE durum = 'yayinda'
ORDER BY created_at DESC
  `);

  const yazilar = result.rows;

  return (
    <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-bold mb-12">
          İçtihat Analizleri
        </h1>

        <div className="space-y-6">
          {yazilar.map((yazi) => (
            <Link
              key={yazi.id}
              href={`/yazilar/${yazi.slug}`}
              className="block rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-amber-300/40 transition"
            >

              {yazi.kategori && (
                <div className="text-sm font-semibold text-white/50">
                  {yazi.kategori}
                </div>
              )}

              <h2 className="text-2xl font-semibold text-amber-300">
                {yazi.baslik}
              </h2>

              <p className="mt-3 text-white/60">
                {yazi.ozet}
              </p>

              <div className="mt-5 text-sm font-semibold text-amber-300">
                Yazıyı Oku →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}