import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const kapsam = searchParams.get("kapsam") || "tum";
    const limit = Math.min(Number(searchParams.get("limit") || 50), 20000);
    const offset = Number(searchParams.get("offset") || 0);

    let query = supabase
      .from("kararlar")
      .select(`
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
        cezaevi_mi,
        ai_basvuru_konusu,
        ai_karar_ozeti,
        ai_neden_onemli,
        ai_benzer_basvuruda_dikkat,
        ai_analiz_model,
        ai_prompt_versiyon,
        ai_analiz_at,
        ai_analiz_durumu
      `)
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (kapsam === "cezaevi") {
      query = query.eq("cezaevi_mi", true);
    }

    if (q) {
      const safeQ = q.replaceAll("%", "").replaceAll(",", " ");
      query = query.or(
        `basvuru_no.ilike.%${safeQ}%,karar_adi.ilike.%${safeQ}%,basvuru_konusu.ilike.%${safeQ}%,sonuc.ilike.%${safeQ}%,mudahale_iddiasi_aym.ilike.%${safeQ}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase kararlar hata:", error);

      return NextResponse.json({
        ok: false,
        error: error.message || error.details || JSON.stringify(error),
      });
    }

    return NextResponse.json({
      ok: true,
      kapsam,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (error) {
    console.error("Kararlar API gerçek hata:", error);

    return NextResponse.json({
      ok: false,
      error: error?.message || JSON.stringify(error),
    });
  }
}