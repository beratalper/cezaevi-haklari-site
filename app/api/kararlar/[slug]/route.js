import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const db = getDb();

    const karar = db
      .prepare(`
        SELECT
          id,
          basvuru_no,
          url,
          karar_adi,
          karar_tarihi,
          sonuc,
          hak,
          basvuru_konusu,
          metin_uzunlugu,
          kalite,
          created_at,
          hak_ozgurluk_aym,
          mudahale_iddiasi_aym,
          sonuc_aym,
          giderim_aym
        FROM kararlar
        WHERE REPLACE(basvuru_no, '/', '-') = ?
        LIMIT 1
      `)
      .get(slug);

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