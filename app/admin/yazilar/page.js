import Link from "next/link";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function AdminYazilarPage() {
  const result = await pool.query(`
    SELECT *
    FROM yazilar
    ORDER BY created_at DESC
  `);

  const yazilar = result.rows;

  return (
    <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-bold">
            Yazılar
          </h1>

          <Link
            href="/admin/yeni-yazi"
            className="rounded-2xl bg-amber-300 px-5 py-3 font-bold text-black"
          >
            Yeni Yazı
          </Link>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-white/10">
          <table className="w-full">
            <thead className="bg-white/[0.03]">
              <tr className="text-left">
                <th className="px-6 py-4">Başlık</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {yazilar.map((yazi) => (
                <tr
                  key={yazi.id}
                  className="border-t border-white/10"
                >
                  <td className="px-6 py-5 font-semibold">
                    {yazi.baslik}
                  </td>

                  <td className="px-6 py-5 text-white/60">
                    {yazi.kategori}
                  </td>

                  <td className="px-6 py-5">
                    <span className="rounded-full bg-amber-300/10 px-3 py-1 text-sm text-amber-300">
                      {yazi.durum}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <Link
                      href={`/admin/yazilar/${yazi.id}`}
                      className="text-amber-300 hover:text-white"
                    >
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}