import Link from "next/link";
import { notFound } from "next/navigation";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const dynamic = "force-dynamic";

function getPages(totalPages, current) {

  const pages = [];

  for (let i = 1; i <= totalPages; i++) {

    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - current) <= 2
    ) {
      pages.push(i);
    }
  }

  const final = [];

  for (let i = 0; i < pages.length; i++) {

    if (
      i > 0 &&
      pages[i] - pages[i - 1] > 1
    ) {
      final.push("...");
    }

    final.push(pages[i]);
  }

  return final;
}

export default async function EtiketDetayPage({
  params,
  searchParams,
}) {

  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const page = parseInt(
    resolvedSearch.page || "1",
    10
  );

  const LIMIT = 10;
  const OFFSET = (page - 1) * LIMIT;

  const etiketRes = await pool.query(
    `
    SELECT *
    FROM etiketler
    WHERE slug = $1
    LIMIT 1
    `,
    [resolvedParams.slug]
  );

  const etiket = etiketRes.rows[0];

  if (!etiket) {
    notFound();
  }

  const countRes = await pool.query(
    `
    SELECT COUNT(*) AS total

    FROM karar_etiketleri ke

    JOIN kararlar k
      ON k.id = ke.karar_id

    WHERE ke.etiket_id = $1
      AND k.cezaevi_mi = true
    `,
    [etiket.id]
  );

  const total = parseInt(
    countRes.rows[0].total,
    10
  );

  const totalPages = Math.ceil(total / LIMIT);

  const result = await pool.query(
    `
    SELECT
      k.id,
      k.basvuru_no,
      k.karar_adi,
      k.karar_tarihi,
      k.basvuru_konusu

    FROM karar_etiketleri ke

    JOIN kararlar k
      ON k.id = ke.karar_id

    WHERE ke.etiket_id = $1
      AND k.cezaevi_mi = true

    ORDER BY k.id DESC

    LIMIT $2 OFFSET $3
    `,
    [etiket.id, LIMIT, OFFSET]
  );

  const kararlar = result.rows;

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-14 text-white lg:px-6 lg:py-20">

      <section className="mx-auto max-w-6xl">

        <Link
          href="/etiketler"
          className="text-sm font-semibold text-[#d9bd83]"
        >
          ← Etiketlere dön
        </Link>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/20">

          <div className="mb-3 h-1 w-20 rounded-full bg-[#c9a96e]" />

          <h1 className="font-serif text-4xl font-semibold md:text-6xl">
            {etiket.ad}
          </h1>

          <p className="mt-5 text-base leading-8 text-slate-300">
            "{etiket.ad}" etiketi ile ilişkili
            Anayasa Mahkemesi kararları.
          </p>
        </div>

        <div className="mt-10 grid gap-6">

          {kararlar.map((item) => (

            <article
              key={item.id}
              className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.075] to-white/[0.025] p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-[#c9a96e]/60"
            >

              <div className="mb-4 flex flex-wrap gap-3 text-sm text-slate-400">

                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                  Başvuru No:
                  <strong className="ml-2 text-slate-200">
                    {item.basvuru_no}
                  </strong>
                </span>

                {item.karar_tarihi && (
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    {item.karar_tarihi}
                  </span>
                )}
              </div>

              <Link
                href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}
              >
                <h2 className="font-serif text-2xl font-semibold text-white hover:text-[#d9bd83]">
                  {item.karar_adi}
                </h2>
              </Link>

              <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-300">
                {item.basvuru_konusu}
              </p>

              <div className="mt-6 flex justify-end">

                <Link
                  href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#c9a96e]/70 bg-[#c9a96e]/10 px-5 py-2.5 text-sm font-semibold text-[#f3d99b] transition hover:-translate-y-0.5 hover:bg-[#c9a96e]/20"
                >
                  Kararı incele →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">

          {page > 1 && (
            <Link
              href={`/etiketler/${resolvedParams.slug}?page=${page - 1}`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
            >
              ← Önceki
            </Link>
          )}

          {getPages(totalPages, page).map((p, i) =>

            p === "..." ? (
              <span
                key={i}
                className="px-2 text-slate-500"
              >
                ...
              </span>
            ) : (
              <Link
                key={p}
                href={`/etiketler/${resolvedParams.slug}?page=${p}`}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  p === page
                    ? "border-[#c9a96e] bg-[#c9a96e]/20 text-[#f3d99b]"
                    : "border-white/10 text-slate-300"
                }`}
              >
                {p}
              </Link>
            )
          )}

          {page < totalPages && (
            <Link
              href={`/etiketler/${resolvedParams.slug}?page=${page + 1}`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
            >
              Sonraki →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}