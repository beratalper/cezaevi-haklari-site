import Link from "next/link";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function slugify(value = "") {
  return value
    .toLowerCase()
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function KonularPage() {
  
  const result = await pool.query(`
    SELECT
      ust_kategori,
      COUNT(*) AS toplam,
      COUNT(*) FILTER (
        WHERE sonuc ILIKE '%İhlal%'
          AND sonuc NOT ILIKE '%İhlal Olmadığı%'
      ) AS ihlal
    FROM kararlar
    WHERE cezaevi_mi = true
      AND ust_kategori IS NOT NULL
    GROUP BY ust_kategori
    ORDER BY toplam DESC;
  `);

  const kategoriler = result.rows.map((item) => {
    const toplam = Number(item.toplam || 0);
    const ihlal = Number(item.ihlal || 0);
    const oran = toplam ? ((ihlal / toplam) * 100).toFixed(1) : "0.0";

    return {
      baslik: item.ust_kategori,
      slug: slugify(item.ust_kategori),
      toplam,
      ihlal,
      oran,
    };
  });

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Cezaevi Hakları
          </p>

          <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-7xl">
            Konular
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Ceza infaz kurumlarında yaşanan hak ihlallerine ilişkin Anayasa
            Mahkemesi bireysel başvuru kararlarını konu başlıklarına göre
            inceleyin.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {kategoriler.map((item) => (
              <Link
                key={item.baslik}
                href={`/konular/${item.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-[#c9a96e]/50 hover:bg-white/[0.06]"
              >
                <div className="mb-5 h-1 w-12 rounded-full bg-[#c9a96e]" />

                <h2 className="font-serif text-2xl font-semibold leading-8 text-amber-300">
                  {item.baslik}
                </h2>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-white/[0.05] p-2">
                    <div className="text-slate-400">Karar</div>
                    <div className="mt-1 font-semibold text-white">
                      {item.toplam}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/[0.05] p-2">
                    <div className="text-slate-400">İhlal</div>
                    <div className="mt-1 font-semibold text-white">
                      {item.ihlal}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/[0.05] p-2">
                    <div className="text-slate-400">Oran</div>
                    <div className="mt-1 font-semibold text-white">
                      %{item.oran}
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-right text-sm font-semibold text-amber-300">
                  Kararları Gör →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}