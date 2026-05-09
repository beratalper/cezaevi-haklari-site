import { Pool } from "pg";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function POST(request, { params }) {

  const cookieStore = await cookies();

  const adminAuth =
    cookieStore.get("admin_auth")?.value;

  const yetkili =
    Boolean(process.env.ADMIN_SECRET) &&
    Boolean(adminAuth) &&
    adminAuth === process.env.ADMIN_SECRET;

  if (!yetkili) {
    return Response.json({
      ok: false,
      error: "Yetkisiz",
    });
  }

  const { id } = await params;

  const formData =
    await request.formData();

  const etiketId =
    formData.get("etiket_id");

  if (!etiketId) {
    return Response.json({
      ok: false,
      error: "Etiket seçilmedi",
    });
  }

  await pool.query(
    `
    INSERT INTO karar_etiketleri
    (karar_id, etiket_id)

    VALUES ($1, $2)

    ON CONFLICT DO NOTHING
    `,
    [id, etiketId]
  );

  return redirect(request.headers.get("referer"));
}