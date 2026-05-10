import { Pool } from "pg";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default async function CezaeviAdaylariPage() {

    const cookieStore =
        await cookies();

    const adminAuth =
        cookieStore.get("admin_auth")?.value;

    const yetkili =
        Boolean(process.env.ADMIN_SECRET) &&
        Boolean(adminAuth) &&
        adminAuth === process.env.ADMIN_SECRET;

    if (!yetkili) {

        return (
            <main className="min-h-screen bg-[#070b14] p-10 text-white">
                Yetkisiz erişim
            </main>
        );
    }

    const result = await pool.query(
        `
    SELECT
      k.id,
      k.basvuru_no,
      k.karar_adi,
      k.karar_tarihi,
      k.basvuru_konusu

    FROM kararlar k

    INNER JOIN cezaevi_basvurulari cb
    ON cb.basvuru_no = k.basvuru_no

    WHERE
  (
    k.cezaevi_mi = false
    OR k.cezaevi_mi IS NULL
  )

AND
  (
    k.cezaevi_incelendi = false
    OR k.cezaevi_incelendi IS NULL
  )

    ORDER BY k.karar_tarihi DESC
    LIMIT 500
    `
    );

    const toplamResult = await pool.query(
        `
    SELECT COUNT(*) AS toplam
    FROM kararlar k

    INNER JOIN cezaevi_basvurulari cb
    ON cb.basvuru_no = k.basvuru_no

    WHERE
    (
        k.cezaevi_mi = false
        OR k.cezaevi_mi IS NULL
    )

    AND
    (
        k.cezaevi_incelendi = false
        OR k.cezaevi_incelendi IS NULL
    )
    `
    );

    const toplamKarar =
        Number(toplamResult.rows[0].toplam);

    const kararlar = result.rows;

    return (
        <main className="min-h-screen bg-[#070b14] p-10 text-white">

            <div className="mx-auto max-w-6xl">

                <h1 className="text-4xl font-semibold text-[#f3d99b]">
                    Cezaevi Aday Kararlar
                </h1>

                <p className="mt-4 text-slate-400">
                    AYM cezaevi filtresinde bulunan ancak
                    cezaevi_mi=true olarak işaretlenmemiş kararlar.
                </p>

                <div className="mt-6 flex gap-4">

                    <div className="rounded-xl bg-white/5 px-4 py-3 text-sm">
                        Toplam Kalan:
                        <span className="ml-2 font-bold text-[#f3d99b]">
                            {toplamKarar}
                        </span>
                    </div>

                    <div className="rounded-xl bg-white/5 px-4 py-3 text-sm">
                        Bu Sayfadaki:
                        <span className="ml-2 font-bold text-green-400">
                            {kararlar.length}
                        </span>
                    </div>

                </div>

                <div className="mt-10 grid gap-5">

                    {kararlar.map((item) => (

                        <div
                            key={item.id}
                            className="rounded-2xl border border-white/10 bg-[#0d1320] p-6"
                        >

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">

                                <span>
                                    {item.basvuru_no}
                                </span>

                                {item.karar_tarihi && (
                                    <span>
                                        • {item.karar_tarihi}
                                    </span>
                                )}
                            </div>

                            <h2 className="mt-3 text-2xl font-semibold text-white">
                                {item.karar_adi}
                            </h2>

                            <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-300">
                                {item.basvuru_konusu}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">

                                <div className="flex gap-3">

                                    <form
                                        action={`/api/admin/cezaevi-onay/${item.id}`}
                                        method="POST"
                                    >
                                        <button
                                            type="submit"
                                            className="rounded-xl bg-green-500 px-5 py-3 font-bold text-black transition hover:bg-green-400"
                                        >
                                            Evet
                                        </button>
                                    </form>

                                    <form
                                        action={`/api/admin/cezaevi-red/${item.id}`}
                                        method="POST"
                                    >
                                        <button
                                            type="submit"
                                            className="rounded-xl bg-red-500 px-5 py-3 font-bold text-white transition hover:bg-red-400"
                                        >
                                            Hayır
                                        </button>
                                    </form>

                                </div>

                                <a
                                    href={`/admin/siniflandirma/${item.basvuru_no.replace(/\//g, "-")}`}
                                    className="rounded-xl bg-amber-300 px-5 py-3 font-bold text-black"
                                >
                                    İncele
                                </a>

                                <a
                                    href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${item.basvuru_no}`}
                                    target="_blank"
                                    className="rounded-xl border border-white/10 px-5 py-3 text-white"
                                >
                                    AYM Kararını Aç
                                </a>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}