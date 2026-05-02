import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const result = await pool.query(
      `
      SELECT
        id,
        basvuru_no,
        karar_adi,
        karar_tarihi,
        sonuc,
        basvuru_konusu,
        metin,
        mudahale_iddiasi_aym,
        sonuc_aym,
        ust_kategori,
        alt_kategori,
        slug
      FROM kararlar
      WHERE slug = $1
         OR REPLACE(basvuru_no, '/', '-') = $1
      LIMIT 1
      `,
      [slug]
    );

    const karar = result.rows[0];

    if (!karar) {
      return NextResponse.json({
        ok: false,
        error: "Karar bulunamadı",
        aranan_slug: slug,
      });
    }

    return NextResponse.json({
      ok: true,
      data: karar,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    });
  }
}