require("dotenv").config({ path: ".env.local" });

const Database = require("better-sqlite3");
const { createClient } = require("@supabase/supabase-js");

const sqlite = new Database("C:/Projects/cezaevi-haklari-site/db/aym_kararlar.db");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rows = sqlite
  .prepare(`
    SELECT
      basvuru_no,
      ai_basvuru_konusu,
      ai_karar_ozeti,
      ai_neden_onemli,
      ai_benzer_basvuruda_dikkat,
      ai_analiz_model,
      ai_prompt_versiyon,
      ai_analiz_at,
      ai_analiz_durumu,
      ai_analiz_hata
    FROM kararlar
    WHERE ai_prompt_versiyon = 'v5-ultra-net-2026-05-01'
      AND ai_analiz_durumu = 'tamamlandi'
  `)
  .all();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Taşınacak AI kayıt sayısı: ${rows.length}`);

  let ok = 0;
  let fail = 0;

  for (const row of rows) {
    const { error } = await supabase
      .from("kararlar")
      .update({
        ai_basvuru_konusu: row.ai_basvuru_konusu,
        ai_karar_ozeti: row.ai_karar_ozeti,
        ai_neden_onemli: row.ai_neden_onemli,
        ai_benzer_basvuruda_dikkat: row.ai_benzer_basvuruda_dikkat,
        ai_analiz_model: row.ai_analiz_model,
        ai_prompt_versiyon: row.ai_prompt_versiyon,
        ai_analiz_at: row.ai_analiz_at,
        ai_analiz_durumu: row.ai_analiz_durumu,
        ai_analiz_hata: row.ai_analiz_hata,
      })
      .eq("basvuru_no", row.basvuru_no);

    if (error) {
      fail++;
      console.error(`Hata: ${row.basvuru_no}`, error.message);
    } else {
      ok++;
      if (ok % 50 === 0) {
        console.log(`Aktarıldı: ${ok}/${rows.length}`);
      }
    }

    await sleep(50);
  }

  console.log(`Bitti. Başarılı: ${ok}, Hatalı: ${fail}`);
}

main();