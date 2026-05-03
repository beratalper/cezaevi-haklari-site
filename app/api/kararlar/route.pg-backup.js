import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const kapsam = searchParams.get("kapsam") || "tum";
    const limit = Math.min(Number(searchParams.get("limit") || 50), 20000);
    const offset = Number(searchParams.get("offset") || 0);

    const where = [];
    const values = [];

    if (kapsam === "cezaevi") {
      where.push(`cezaevi_mi = true`);
    }

    if (q) {
      values.push(`%${q}%`);
      where.push(`
        (
          basvuru_no ILIKE $${values.length}
          OR karar_adi ILIKE $${values.length}
          OR basvuru_konusu ILIKE $${values.length}
          OR sonuc ILIKE $${values.length}
          OR mudahale_iddiasi_aym ILIKE $${values.length}
        )
      `);
    }

    values.push(limit);
    const limitParam = values.length;

    values.push(offset);
    const offsetParam = values.length;

    const result = await pool.query(
      `
      SELECT
        id,
        basvuru_no,
        karar_adi,
        karar_tarihi,
        sonuc,
        basvuru_konusu,
        mudahale_iddiasi_aym,
        sonuc_aym,
        ust_kategori,
        alt_kategori,
        slug,
        cezaevi_mi
      FROM kararlar
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY id DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
      `,
      values
    );

    return NextResponse.json({
      ok: true,
      kapsam,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
  console.error("Kararlar API gerçek hata:", error);

  return NextResponse.json({
    ok: false,
    error: error?.message || JSON.stringify(error),
  });
}
}