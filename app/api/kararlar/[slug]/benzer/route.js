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

    // 1. Mevcut kararı bul
    const mevcutResult = await pool.query(
      `
      SELECT
        id,
        basvuru_no,
        ust_kategori,
        alt_kategori
      FROM kararlar
      WHERE slug = $1
         OR REPLACE(basvuru_no, '/', '-') = $1
      LIMIT 1
      `,
      [slug]
    );

    const mevcutKarar = mevcutResult.rows[0];

    if (!mevcutKarar) {
      return NextResponse.json({
        ok: false,
        error: "Karar bulunamadı",
      });
    }

    // 2. Önce aynı alt_kategori içinden getir
    const altKategoriResult = await pool.query(
      `
      SELECT
        id,
        basvuru_no,
        karar_adi,
        karar_tarihi,
        basvuru_konusu,
        ust_kategori,
        alt_kategori,
        slug
      FROM kararlar
      WHERE alt_kategori = $1
        AND id <> $2
        AND cezaevi_mi = true
      ORDER BY karar_tarihi DESC NULLS LAST, id DESC
      LIMIT 10
      `,
      [mevcutKarar.alt_kategori, mevcutKarar.id]
    );

    let benzerKararlar = altKategoriResult.rows;

    // 3. Alt kategori 10’a tamamlanmazsa ust_kategori ile tamamla
    if (benzerKararlar.length < 10) {
      const mevcutIdler = benzerKararlar.map((k) => k.id);
      const kalanLimit = 10 - benzerKararlar.length;

      const ustKategoriResult = await pool.query(
        `
        SELECT
          id,
          basvuru_no,
          karar_adi,
          karar_tarihi,
          basvuru_konusu,
          ust_kategori,
          alt_kategori,
          slug
        FROM kararlar
        WHERE ust_kategori = $1
          AND id <> $2
          AND cezaevi_mi = true
          AND NOT (id = ANY($3::int[]))
        ORDER BY karar_tarihi DESC NULLS LAST, id DESC
        LIMIT $4
        `,
        [mevcutKarar.ust_kategori, mevcutKarar.id, mevcutIdler, kalanLimit]
      );

      benzerKararlar = [...benzerKararlar, ...ustKategoriResult.rows];
    }

    return NextResponse.json({
      ok: true,
      data: benzerKararlar,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    });
  }
}