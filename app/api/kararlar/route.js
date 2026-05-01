import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const kapsam = searchParams.get("kapsam") || "tum";
    const limit = Math.min(Number(searchParams.get("limit") || 50), 20000);
    const offset = Number(searchParams.get("offset") || 0);

    const cezaeviWhere = kapsam === "cezaevi" ? "cezaevi_mi = 1" : "1=1";

    const db = getDb();

    const baseQuery = `
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
        giderim_aym,
        cezaevi_mi
      FROM kararlar
    `;

    let rows;

    if (q) {
      rows = db
        .prepare(`
          ${baseQuery}
          WHERE
            ${cezaeviWhere}
            AND (
              basvuru_no LIKE ?
              OR karar_adi LIKE ?
              OR basvuru_konusu LIKE ?
              OR sonuc LIKE ?
              OR hak_ozgurluk_aym LIKE ?
              OR mudahale_iddiasi_aym LIKE ?
              OR metin LIKE ?
            )
          ORDER BY karar_tarihi DESC
          LIMIT ? OFFSET ?
        `)
        .all(
          `%${q}%`,
          `%${q}%`,
          `%${q}%`,
          `%${q}%`,
          `%${q}%`,
          `%${q}%`,
          `%${q}%`,
          limit,
          offset
        );
    } else {
      rows = db
        .prepare(`
          ${baseQuery}
          WHERE ${cezaeviWhere}
          ORDER BY karar_tarihi DESC
          LIMIT ? OFFSET ?
        `)
        .all(limit, offset);
    }

    return NextResponse.json({
      ok: true,
      kapsam,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    });
  }
}