import { Pool } from "pg";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function POST(request) {

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

  const formData =
    await request.formData();

  const kararId =
    formData.get("karar_id");

  const etiketId =
    formData.get("etiket_id");

  if (!kararId || !etiketId) {
    return Response.json({
      ok: false,
      error: "Eksik veri",
    });
  }

  await pool.query(
    `
    DELETE FROM karar_etiketleri

    WHERE karar_id = $1
      AND etiket_id = $2
    `,
    [kararId, etiketId]
  );

  return redirect(
    request.headers.get("referer")
  );
}