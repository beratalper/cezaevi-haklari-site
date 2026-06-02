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
  k.id,
  k.basvuru_no,
  k.karar_adi,
  k.karar_tarihi,
  k.sonuc,
  k.basvuru_konusu,
  k.mudahale_iddiasi_aym,
  k.sonuc_aym,
  k.ust_kategori,
  k.alt_kategori,
  k.slug,
  k.ictihat_slug,
  h.baslik AS ictihat_baslik,
  k.cezaevi_mi,
  k.ai_basvuru_konusu,
  k.ai_karar_ozeti,
  k.ai_neden_onemli,
  k.ai_benzer_basvuruda_dikkat,
  k.ai_prompt_versiyon
FROM kararlar k
LEFT JOIN ictihat_kategori_haritasi h
  ON h.slug = k.ictihat_slug
WHERE k.slug = $1
   OR REPLACE(k.basvuru_no, '/', '-') = $1
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