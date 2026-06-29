import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function escapeCSV(text) {
  if (text === null || text === undefined) return '""';
  let stringValue = String(text);
  // Çift tırnakları çift çift tırnağa dönüştürerek kaçırıyoruz (CSV kuralı)
  stringValue = stringValue.replace(/"/g, '""');
  return `"${stringValue}"`;
}

async function exportToCSV() {
  console.log("📊 Yeni olay tabanlı analiz dökümanları CSV'ye aktarılıyor...");

  try {
    const query = `
      SELECT 
        id, 
        basvuru_no, 
        karar_adi, 
        sonuc, 
        sonuc_aym, 
        hak_ozgurluk_aym,
        mudahale_iddiasi_aym,
        ai_arama_onerileri, 
        ai_kural, 
        ai_karar_ozeti, 
        ai_neden_onemli, 
        ai_benzer_basvuruda_dikkat,
        ai_karar_ozeti_kalite,
        ai_kural_kalite,
        ai_kalite_kontrol_notu
      FROM kararlar
      WHERE ai_analiz_durumu = 'ok'
        AND ai_prompt_versiyon = 'genel-ai-v3-olay-arama-self-healing'
      ORDER BY id ASC;
    `;

    const res = await pool.query(query);
    const rows = res.rows;

    if (rows.length === 0) {
      console.log("⚠️ Veritabanında yeni olay tabanlı modelle analiz edilmiş kayıt bulunamadı!");
      await pool.end();
      return;
    }

    console.log(`📦 Toplam ${rows.length} kayıt dışa aktarılıyor...`);

    const BOM = "\ufeff";
    let csvContent = BOM + [
      "ID",
      "Başvuru No",
      "Karar Adı",
      "Sonuç",
      "AYM Sonucu",
      "Hak Özgürlük (AYM)",
      "Müdahale İddiası (AYM)",
      "YENİ - Akıllı Arama Önerileri",
      "YENİ - AI Kural",
      "YENİ - Olay Tabanlı Karar Özeti",
      "AI Neden Önemli",
      "AI Benzer Başvuruda Dikkat",
      "Özet Kalite",
      "Kural Kalite",
      "Kalite Notu"
    ].join(";") + "\n";

    for (const row of rows) {
      const line = [
        escapeCSV(row.id),
        escapeCSV(row.basvuru_no),
        escapeCSV(row.karar_adi),
        escapeCSV(row.sonuc),
        escapeCSV(row.sonuc_aym),
        escapeCSV(row.hak_ozgurluk_aym),
        escapeCSV(row.mudahale_iddiasi_aym),
        escapeCSV(row.ai_arama_onerileri),
        escapeCSV(row.ai_kural),
        escapeCSV(row.ai_karar_ozeti),
        escapeCSV(row.ai_neden_onemli),
        escapeCSV(row.ai_benzer_basvuruda_dikkat),
        escapeCSV(row.ai_karar_ozeti_kalite),
        escapeCSV(row.ai_kural_kalite),
        escapeCSV(row.ai_kalite_kontrol_notu)
      ].join(";");

      csvContent += line + "\n";
    }

    const fileName = "ai_analiz_olay_tabanli_kontrol.csv";
    fs.writeFileSync(fileName, csvContent, "utf-8");

    console.log(`\n✅ Başarıyla tamamlandı! Yeni dosya oluşturuldu: ${fileName}`);
    console.log("💡 Bu dosyayı doğrudan Excel ile açarak yeni olay tabanlı özetleri, kapsayıcı kuralları ve akıllı arama önerilerini yakından inceleyebilirsiniz.");

  } catch (error) {
    console.error("❌ CSV çıktısı alınırken hata oluştu:", error);
  } finally {
    await pool.end();
  }
}

exportToCSV();
