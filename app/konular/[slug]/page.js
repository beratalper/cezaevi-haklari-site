import Link from "next/link";
import { notFound } from "next/navigation";
import { Pool } from "pg";

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

async function getKategoriBySlug(slug) {
  const result = await pool.query(`
    SELECT DISTINCT ust_kategori
    FROM kararlar
    WHERE cezaevi_mi = true
      AND ust_kategori IS NOT NULL
    ORDER BY ust_kategori
  `);

  const kategoriler = result.rows.map((row) => ({
    ad: row.ust_kategori,
    slug: slugify(row.ust_kategori),
  }));

  const bulunan = kategoriler.find((row) => row.slug === slug);

  return {
    kategori: bulunan?.ad || null,
    kategoriler,
  };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { kategori } = await getKategoriBySlug(resolvedParams.slug);

  if (!kategori) {
    return { title: "Konu Bulunamadı" };
  }

  return {
    title: `${kategori} | AYM Cezaevi Kararları`,
    description: `${kategori} konusunda Anayasa Mahkemesi bireysel başvuru kararlarını inceleyin.`,
  };
}

function getPages(totalPages, current) {
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - current) <= 2) {
      pages.push(i);
    }
  }

  const final = [];

  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) {
      final.push("...");
    }

    final.push(pages[i]);
  }

  return final;
}

export default async function KonuPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const page = parseInt(resolvedSearch.page || "1", 10);
  const LIMIT = 10;
  const OFFSET = (page - 1) * LIMIT;
  const { kategori, kategoriler } = await getKategoriBySlug(resolvedParams.slug);

  if (!kategori) {
    return (
      <main className="min-h-screen bg-[#070b14] p-10 text-white">
        <h1 className="text-3xl font-bold">Kategori bulunamadı</h1>
        <p className="mt-4 text-slate-300">
          Gelen slug: {resolvedParams.slug}
        </p>

        <div className="mt-8 space-y-2">
          {kategoriler.map((item) => (
            <div key={item.slug} className="rounded-xl border border-white/10 p-3">
              <div>{item.ad}</div>
              <div className="text-sm text-[#d9bd83]">/{item.slug}</div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  const countRes = await pool.query(
    `
  SELECT COUNT(*) FROM kararlar
  WHERE cezaevi_mi = true
    AND ust_kategori = $1
  `,
    [kategori]
  );

  const total = parseInt(countRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / LIMIT);

  const result = await pool.query(
    `
    SELECT
      id,
      basvuru_no,
      karar_adi,
      karar_tarihi,
      sonuc,
      basvuru_konusu,
      ai_karar_ozeti,
      ai_neden_onemli,
      ust_kategori
    FROM kararlar
    WHERE cezaevi_mi = true
      AND ust_kategori = $1
    ORDER BY id ASC
    LIMIT $2 OFFSET $3
    `,
    [kategori, LIMIT, OFFSET]
  );

  const kararlar = result.rows;

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-14 text-white lg:px-6 lg:py-20">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/konular"
          className="text-sm font-semibold text-[#d9bd83] hover:text-[#f3d99b]"
        >
          ← Konulara dön
        </Link>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/20">

          <h1 className="mt-4 font-serif text-4xl font-semibold md:text-6xl">
            {kategori}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            Bu başlık altında Anayasa Mahkemesi bireysel başvuru kararları
            içinden seçilmiş, ceza infaz kurumlarında yaşanan {kategori} konu başlığına dahil olan
            hak ihlallerine ilişkin kararlar listelenmektedir.
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
                  Başvuru No:{" "}
                  <strong className="text-slate-200">{item.basvuru_no}</strong>
                </span>

                {item.karar_tarihi && (
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    Karar Tarihi:{" "}
                    <strong className="text-slate-200">
                      {item.karar_tarihi}
                    </strong>
                  </span>
                )}

                {item.sonuc && (
                  <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/10 px-3 py-1 text-[#d9bd83]">
                    {item.sonuc}
                  </span>
                )}
              </div>

              <Link href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}>
                <h2 className="font-serif text-2xl font-semibold text-white hover:text-[#d9bd83]">
                  {item.karar_adi}
                </h2>
              </Link>

              {(item.ai_karar_ozeti || item.basvuru_konusu) && (
                <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-300">
                  {item.ai_karar_ozeti || item.basvuru_konusu}
                </p>
              )}

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
              href={`/konular/${resolvedParams.slug}?page=${page - 1}`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-[#c9a96e]"
            >
              ← Önceki
            </Link>
          )}

          {getPages(totalPages, page).map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-slate-500">
                ...
              </span>
            ) : (
              <Link
                key={p}
                href={`/konular/${resolvedParams.slug}?page=${p}`}
                className={`rounded-lg border px-3 py-2 text-sm ${p === page
                    ? "border-[#c9a96e] bg-[#c9a96e]/20 text-[#f3d99b]"
                    : "border-white/10 text-slate-300 hover:border-[#c9a96e]"
                  }`}
              >
                {p}
              </Link>
            )
          )}

          {page < totalPages && (
            <Link
              href={`/konular/${resolvedParams.slug}?page=${page + 1}`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-[#c9a96e]"
            >
              Sonraki →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}