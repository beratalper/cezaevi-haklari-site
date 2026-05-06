import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function AdminSiniflandirmaPage({
    params,
    searchParams,
}) {
    const { slug } = await params;
    const sp = await searchParams;

    const secret = sp?.secret;

    if (secret !== process.env.ADMIN_SECRET) {
        return (
            <main className="min-h-screen bg-[#070b14] p-10 text-white">
                Yetkisiz erişim
            </main>
        );
    }

    const basvuruNo = slug.replace("-", "/");

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