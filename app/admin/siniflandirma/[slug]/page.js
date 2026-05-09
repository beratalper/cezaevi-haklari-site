import { Pool } from "pg";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function AdminSiniflandirmaPage({
    params,
    searchParams,
}) {

    const cookieStore = await cookies();

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

    const { slug } = await params;

    const basvuruNo =
        slug.replace(/-/g, "/");

    const result = await pool.query(
        `
    SELECT *
    FROM kararlar
    WHERE basvuru_no = $1
    LIMIT 1
  `,
        [basvuruNo]
    );

    const item = result.rows[0];

    if (!item) {
        return (
            <main className="min-h-screen bg-[#070b14] p-10 text-white">
                Karar bulunamadı
            </main>
        );
    }
    const etiketResult = await pool.query(
        `
    SELECT
      e.id,
      e.ad

    FROM karar_etiketleri ke

    JOIN etiketler e
      ON e.id = ke.etiket_id

    WHERE ke.karar_id = $1

    ORDER BY e.ad ASC
    `,
        [item.id]
    );

    const etiketler = etiketResult.rows;
    const ustKategoriResult = await pool.query(`
  SELECT DISTINCT ust_kategori
  FROM kararlar
  WHERE ust_kategori IS NOT NULL
    AND ust_kategori <> ''
  ORDER BY ust_kategori
`);

    const altKategoriResult = await pool.query(`
  SELECT DISTINCT alt_kategori
  FROM kararlar
  WHERE alt_kategori IS NOT NULL
    AND alt_kategori <> ''
  ORDER BY alt_kategori
`);

    const ustKategoriler = ustKategoriResult.rows.map(
        (r) => r.ust_kategori
    );

    const altKategoriler = altKategoriResult.rows.map(
        (r) => r.alt_kategori
    );

    if (!item) {
        return (
            <main className="min-h-screen bg-[#070b14] p-10 text-white">
                Karar bulunamadı
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#070b14] p-10 text-white">
            <h1 className="text-3xl font-semibold">Sınıflandırma Admin</h1>

            <p className="mt-6 text-2xl text-[#f3d99b]">
                {item.karar_adi}
            </p>

            <p className="mt-4 text-slate-400">
                Başvuru No: {item.basvuru_no}
            </p>

            <p className="mt-2 text-slate-400">
                Üst kategori: {item.ust_kategori || "-"}
            </p>

            <p className="mt-2 text-slate-400">
                Alt kategori: {item.alt_kategori || "-"}
            </p>

            <p className="mt-2 text-slate-400">
                Cezaevi mi: {item.cezaevi_mi ? "Evet" : "Hayır"}
            </p>
            <div className="mt-6">
                <div className="mb-3 text-sm font-semibold text-[#f3d99b]">
                    Etiketler
                </div>

                <div className="flex flex-wrap gap-2">

                    {etiketler.length === 0 && (
                        <div className="text-sm text-slate-500">
                            Etiket bulunamadı
                        </div>
                    )}

                    {etiketler.map((etiket) => (
                        <div
                            key={etiket.id}
                            className="flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-sm text-amber-300"
                        >
                            <span>
                                {etiket.ad}
                            </span>

                            <form
                                action="/api/admin/etiket-sil"
                                method="POST"
                            >
                                <input
                                    type="hidden"
                                    name="karar_id"
                                    value={item.id}
                                />

                                <input
                                    type="hidden"
                                    name="etiket_id"
                                    value={etiket.id}
                                />

                                <button
                                    type="submit"
                                    className="text-red-300 transition hover:text-red-200"
                                >
                                    ×
                                </button>
                            </form>
                        </div>
                    ))}
                    <form
                        action={`/api/admin/etiket-ekle/${item.id}`}
                        method="POST"
                        className="mt-4 flex gap-3"
                    >
                        <select
                            name="etiket_id"
                            className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                        >
                            <option value="">
                                Etiket seç
                            </option>

                            {(await pool.query(`
            SELECT *
            FROM etiketler
            ORDER BY ad ASC
        `)).rows.map((etiket) => (
                                <option
                                    key={etiket.id}
                                    value={etiket.id}
                                >
                                    {etiket.ad}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="rounded-xl bg-amber-300 px-5 py-3 font-bold text-black"
                        >
                            Etiket Ekle
                        </button>
                    </form>
                    <form
                        action="/api/admin/etiket-olustur"
                        method="POST"
                        className="mt-4 flex gap-3"
                    >
                        <input
                            type="text"
                            name="ad"
                            placeholder="Yeni etiket adı"
                            className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-500"
                        />

                        <input
                            type="hidden"
                            name="karar_id"
                            value={item.id}
                        />

                        <button
                            type="submit"
                            className="rounded-xl bg-[#1f2937] px-5 py-3 font-bold text-white transition hover:bg-[#374151]"
                        >
                            Oluştur
                        </button>
                    </form>
                </div>
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1320] p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
                    Başvuru Konusu
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
                    {item.basvuru_konusu || "Bilgi bulunamadı"}
                </p>
            </div>
            <form
                action={`/api/admin/siniflandirma/${item.id}`}
                method="POST"
                className="mt-4 mb-40 space-y-6 rounded-2xl border border-white/10 bg-[#0d1320] p-6"
            >
                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#f3d99b]">
                        Cezaevi Kararı mı?
                    </label>

                    <select
                        name="cezaevi_mi"
                        defaultValue={item.cezaevi_mi ? "true" : "false"}
                        className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                    >
                        <option value="true">Evet</option>
                        <option value="false">Hayır</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#f3d99b]">
                        Üst Kategori
                    </label>

                    <select
                        name="ust_kategori"
                        defaultValue={item.ust_kategori || ""}
                        className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                    >
                        <option value="">Seçiniz</option>

                        {ustKategoriler.map((kategori) => (
                            <option key={kategori} value={kategori}>
                                {kategori}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#f3d99b]">
                        Alt Kategori
                    </label>

                    <select
                        name="alt_kategori"
                        defaultValue={item.alt_kategori || ""}
                        className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                    >
                        <option value="">Seçiniz</option>

                        {altKategoriler.map((kategori) => (
                            <option key={kategori} value={kategori}>
                                {kategori}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="rounded-xl bg-amber-300 px-6 py-3 font-bold text-black transition hover:bg-[#e2c17c]"
                >
                    Kaydet
                </button>
            </form>
        </main>
    );
}