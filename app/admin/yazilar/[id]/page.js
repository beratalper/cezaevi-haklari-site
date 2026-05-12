import { Pool } from "pg";
import YaziForm from "@/components/YaziForm";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function AdminYaziDetayPage({ params }) {
  const { id } = await params;

  const result = await pool.query(
    `
      SELECT *
      FROM yazilar
      WHERE id = $1
    `,
    [id]
  );

  const yazi = result.rows[0];

  if (!yazi) {
    return (
      <main className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
        Yazı bulunamadı.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold">
          Yazıyı Düzenle
        </h1>

        <YaziForm yazi={yazi} />
      </div>
    </main>
  );
}