import { Pool } from "pg";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function AdminMevzuatPage() {

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

  const result = await pool.query(`
    SELECT *
    FROM mevzuatlar
    ORDER BY aktif_mi ASC, title ASC
  `);

  const items =
    result.rows;

  return (

    <main className="min-h-screen bg-[#070b14] p-10 text-white">

      <div className="mx-auto max-w-6xl">

        <h1 className="text-4xl font-semibold text-[#f3d99b]">
          Mevzuat Link Kontrolü
        </h1>

        <p className="mt-4 text-slate-400">
          Mevzuat.gov.tr bağlantılarının sağlık durumu
        </p>

        <div className="mt-10 space-y-4">

          {items.map((item) => (

            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#0d1320] p-5"
            >

              <div className="flex items-start justify-between gap-6">

                <div className="min-w-0 flex-1">

                  <h2 className="text-lg font-semibold text-white">
                    {item.title}
                  </h2>

                  <div className="mt-2 break-all text-sm text-slate-400">
                    {item.href}
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    Son kontrol:
                    {" "}
                    {item.son_kontrol
                      ? new Date(
                          item.son_kontrol
                        ).toLocaleString("tr-TR")
                      : "-"
                    }
                  </div>

                </div>

                <div className="shrink-0">

                  {item.aktif_mi ? (

                    <div className="rounded-full bg-green-500/15 px-4 py-2 text-sm font-bold text-green-400">
                      Çalışıyor
                    </div>

                  ) : (

                    <div className="rounded-full bg-red-500/15 px-4 py-2 text-sm font-bold text-red-400">
                      Bozuk
                    </div>

                  )}

                </div>

              </div>

              {!item.aktif_mi && item.son_hata && (

                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {item.son_hata}
                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}