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

  const cookieStore =
    await cookies();

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

  await pool.query(
    `
    UPDATE kararlar

    SET
      cezaevi_mi = false,
      cezaevi_incelendi = true

    WHERE id = $1
    `,
    [id]
  );

  return redirect(
    request.headers.get("referer")
  );
}