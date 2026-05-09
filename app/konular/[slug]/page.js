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

async function getKonuBySlug(slug) {

  const result = await pool.query(`
  SELECT DISTINCT kis.mudahale_iddiasi_aym

  FROM karar_inceleme_sonuclari kis

  JOIN kararlar k
    ON k.id = kis.karar_id

  WHERE k.cezaevi_mi = true

    AND kis.mudahale_iddiasi_aym IN (
      'İnfaz Kurumunun fiziki koşulları',
      'Nakil aracının fiziki koşulları',
      'Ceza infaz kurumu uygulamaları',
      'Ceza infaz kurumunda açlık grevi',
      'Ceza infaz kurumunda eğitim',
      'Ceza infaz kurumunda ifade',
      'Ceza infaz kurumunda kitap',
      'İnfaz kurumunda güç kullanımı',
      'Ceza infaz kurumunda süreli yayın',
      'Haberleşme-ceza infaz kurumu uygulamaları (sakıncalı mektup hariç)',
      'Haberleşme-Sakıncalı mektup',
      'İnfaz, koşullu salıverme'
    )
`);

  const konular = result.rows.map((row) => ({
    ad: row.mudahale_iddiasi_aym,
    slug: slugify(row.mudahale_iddiasi_aym),
  }));

  const bulunan = konular.find(
    (row) => row.slug === slug
  );

  return {
    konu: bulunan?.ad || null,
  };
}

export async function generateMetadata({ params }) {

  const resolvedParams = await params;

  const { konu } = await getKonuBySlug(
    resolvedParams.slug
  );

  if (!konu) {
    return {
      title: "Konu bulunamadı",
    };
  }

  return {
    title: `${konu} | AYM Cezaevi Kararları`,
    description:
      `${konu} konusunda Anayasa Mahkemesi bireysel başvuru kararlarını inceleyin.`,
  };
}

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

export default async function KonuPage({
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

  const { konu } = await getKonuBySlug(
    resolvedParams.slug
  );

  if (!konu) {

    return (
      <main className="min-h-screen bg-[#070b14] p-10 text-white">
        Konu bulunamadı
      </main>
    );
  }

  // toplam kayıt

  const countRes = await pool.query(
    `
    SELECT COUNT(DISTINCT k.id)
    FROM karar_inceleme_sonuclari kis
    JOIN kararlar k
      ON k.id = kis.karar_id
    WHERE kis.mudahale_iddiasi_aym = $1
      AND k.cezaevi_mi = true
    `,
    [konu]
  );

  const total = parseInt(
    countRes.rows[0].count,
    10
  );

  const totalPages = Math.ceil(total / LIMIT);

  // gerçek kararlar

  const result = await pool.query(
    `
    SELECT DISTINCT
      k.id,
      k.basvuru_no,
      k.karar_adi,
      k.karar_tarihi,
      k.basvuru_konusu,
      k.ai_karar_ozeti,
      k.slug
    FROM karar_inceleme_sonuclari kis
    JOIN kararlar k
      ON k.id = kis.karar_id
    WHERE kis.mudahale_iddiasi_aym = $1
      AND k.cezaevi_mi = true
    ORDER BY k.id DESC
    LIMIT $2 OFFSET $3
    `,
    [konu, LIMIT, OFFSET]
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
            {konu}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            Bu başlık altında Anayasa Mahkemesi kararlarında yer alan
            müdahale iddialarına ilişkin cezaevi kararları listelenmektedir.
          </p>

          <div className="mt-5 text-sm text-[#d9bd83]">
            {total} karar bulundu
          </div>

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
                  <strong className="ml-1 text-slate-200">
                    {item.basvuru_no}
                  </strong>
                </span>

                {item.karar_tarihi && (
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    Karar Tarihi:
                    <strong className="ml-1 text-slate-200">
                      {item.karar_tarihi}
                    </strong>
                  </span>
                )}

              </div>

              <Link
                href={`/kararlar/${item.slug || item.basvuru_no.replace("/", "-")}`}
              >

                <h2 className="font-serif text-2xl font-semibold text-white hover:text-[#d9bd83]">
                  {item.karar_adi}
                </h2>

              </Link>

              {(item.basvuru_konusu || item.ai_karar_ozeti) && (

                <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-300">
                  {item.basvuru_konusu || item.ai_karar_ozeti}
                </p>

              )}

              <div className="mt-6 flex justify-end">

                <Link
                  href={`/kararlar/${item.slug || item.basvuru_no.replace("/", "-")}`}
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

              <span
                key={`dots-${i}`}
                className="px-2 text-slate-500"
              >
                ...
              </span>

            ) : (

              <Link
                key={p}
                href={`/konular/${resolvedParams.slug}?page=${p}`}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  p === page
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