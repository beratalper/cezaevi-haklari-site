import { Pool } from "pg";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function AdminSiniflandirmaListPage({ searchParams }) {
    const sp = await searchParams;
    const cezaevi = sp?.cezaevi || "true";
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("admin_auth")?.value;

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

    const kararResult = await pool.query(`
    SELECT
      id,
      karar_adi,
      basvuru_no,
      karar_tarihi,
      basvuru_konusu,
      cezaevi_mi,
      ust_kategori,
      alt_kategori,
      admin_kontrol_edildi,
      admin_kontrol_at
    FROM kararlar
    WHERE COALESCE(admin_kontrol_edildi, false) = false
  AND (
    $1 = 'tum'
    OR ($1 = 'true' AND cezaevi_mi = true)
    OR ($1 = 'false' AND cezaevi_mi = false)
  )
    ORDER BY id DESC
    LIMIT 50
    `,
        [cezaevi]
    );

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

    const kararlar = kararResult.rows;
    const ustKategoriler = ustKategoriResult.rows.map((r) => r.ust_kategori);
    const altKategoriler = altKategoriResult.rows.map((r) => r.alt_kategori);

    return (
        <main className="min-h-screen bg-[#070b14] p-6 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-[#f3d99b]">
                            Sınıflandırma Kontrolü
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Kaydedilen kayıtlar kontrol edildi sayılır ve bu listeden çıkar.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:border-amber-300/50 hover:text-amber-300"
                    >
                        Admin panele dön
                    </Link>
                </div>

                <div className="mb-6 flex flex-wrap gap-3">
                    <Link
                        href="/admin/siniflandirma?cezaevi=true"
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold ${cezaevi === "true"
                            ? "border-amber-300 bg-amber-300/15 text-amber-300"
                            : "border-white/10 bg-white/5 text-slate-300"
                            }`}
                    >
                        Sadece cezaevi true
                    </Link>

                    <Link
                        href="/admin/siniflandirma?cezaevi=false"
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold ${cezaevi === "false"
                            ? "border-amber-300 bg-amber-300/15 text-amber-300"
                            : "border-white/10 bg-white/5 text-slate-300"
                            }`}
                    >
                        Sadece cezaevi false
                    </Link>

                    <Link
                        href="/admin/siniflandirma?cezaevi=tum"
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold ${cezaevi === "tum"
                            ? "border-amber-300 bg-amber-300/15 text-amber-300"
                            : "border-white/10 bg-white/5 text-slate-300"
                            }`}
                    >
                        Tümü
                    </Link>
                </div>

                <div className="space-y-5">
                    {kararlar.map((item) => (
                        <form
                            key={item.id}
                            action={`/api/admin/siniflandirma/${item.id}`}
                            method="POST"
                            className="rounded-2xl border border-white/10 bg-[#0d1320] p-5"
                        >
                            <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
                                <div>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                                        <span>Başvuru No: {item.basvuru_no}</span>
                                        {item.karar_tarihi && <span>• {item.karar_tarihi}</span>}
                                        <Link
                                            href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}
                                            target="_blank"
                                            className="text-amber-300 hover:underline"
                                        >
                                            Kararı aç →
                                        </Link>
                                        <Link
                                            href={`/admin/siniflandirma/${item.basvuru_no.replace(/\//g, "-")}`}
                                            className="text-cyan-300 hover:underline"
                                        >
                                            Etiketleri yönet →
                                        </Link>
                                    </div>

                                    <h2 className="mt-3 text-xl font-semibold text-white">
                                        {item.karar_adi}
                                    </h2>

                                    <p className="mt-4 text-sm leading-7 text-slate-400">
                                        {item.basvuru_konusu || "Başvuru konusu bulunamadı."}
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-[#f3d99b]">
                                            Cezaevi Kararı mı?
                                        </label>
                                        <select
                                            name="cezaevi_mi"
                                            defaultValue={item.cezaevi_mi ? "true" : "false"}
                                            className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white"
                                        >
                                            <option value="true">Evet</option>
                                            <option value="false">Hayır</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-[#f3d99b]">
                                            Üst Kategori
                                        </label>
                                        <select
                                            name="ust_kategori"
                                            defaultValue={item.ust_kategori || ""}
                                            className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white"
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
                                        <label className="mb-1 block text-xs font-semibold text-[#f3d99b]">
                                            Alt Kategori
                                        </label>
                                        <select
                                            name="alt_kategori"
                                            defaultValue={item.alt_kategori || ""}
                                            className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white"
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
                                        className="mt-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e2c17c]"
                                    >
                                        Kaydet ve listeden çıkar
                                    </button>
                                </div>
                            </div>
                        </form>
                    ))}
                </div>
            </div>
        </main>
    );
}