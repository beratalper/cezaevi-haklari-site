import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

const MODEL = "gpt-4.1-mini";
const BATCH_SIZE = 20;
const PROMPT_VERSION = "cezaevi-ai-v3-final-hukum";
const QUALITY_VERSION = "cezaevi-ai-quality-v1";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function cleanJsonText(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const QUALITY_PROMPT = `
Sen Anayasa Mahkemesi bireysel başvuru kararları için hukuk editörü ve kalite kontrol uzmanısın.

Görevin:
Verilen karar kaydındaki üç AI alanını ayrı ayrı kontrol etmek:

1. ai_karar_ozeti
2. ai_neden_onemli
3. ai_benzer_basvuruda_dikkat

Her alan için sadece şu sonuçlardan birini ver:
- "geçti"
- "geçemedi"
- "kontrol_edilecek"

Değerlendirme ölçütleri:

GEÇTİ:
- HÜKÜM / sonuç ile açıkça çelişmiyor.
- Kabul edilemez kararda ihlal varmış gibi anlatmıyor.
- İhlal kararında ihlalin yönünü makul şekilde açıklıyor.
- Çok haklı veya karma kararlarda bariz yanlış genelleme yapmıyor.
- Vatandaşın anlayabileceği kadar açık.
- Uydurma açık bilgi yok.

GEÇEMEDİ:
- Sonuçla açık çelişki var.
- Kabul edilemez kararı ihlal gibi anlatıyor.
- Hükümde olmayan tazminat, yeniden yargılama, hak veya kişi ekliyor.
- Çok başvuruculu/çok haklı kararı ciddi şekilde karıştırıyor.
- Metnin anlamını değiştirecek açık hata var.

KONTROL_EDİLECEK:
- Bariz hata yok ama metin muğlak, fazla genel, çok kısa, çok uzun veya insan kontrolü gerektiriyor.
- Kaynak veride karmaşıklık var ve emin olunamıyor.

ÖNEMLİ:
- Çok sert davranma; küçük üslup sorunları için "geçemedi" deme.
- Hukuken riskli açık hatalarda "geçemedi" de.
- Emin değilsen "kontrol_edilecek" de.
- Cevap SADECE JSON olsun.

ÇIKTI FORMATI:
{
  "ai_karar_ozeti_kalite": "geçti",
  "ai_neden_onemli_kalite": "geçti",
  "ai_benzer_basvuruda_dikkat_kalite": "geçti",
  "not": "kısa açıklama"
}
`;

async function kaliteKontrol(row) {
  const input = {
    basvuru_no: row.basvuru_no,
    karar_adi: row.karar_adi,
    karar_tarihi: row.karar_tarihi,
    sonuc: row.sonuc,
    sonuc_aym: row.sonuc_aym,
    basvuru_konusu: row.basvuru_konusu,
    mudahale_iddiasi_aym: row.mudahale_iddiasi_aym,

    ai_karar_ozeti: row.ai_karar_ozeti,
    ai_neden_onemli: row.ai_neden_onemli,
    ai_benzer_basvuruda_dikkat: row.ai_benzer_basvuruda_dikkat,

    hukum_bolumu: String(row.metin || "").slice(-8000),
  };

  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: QUALITY_PROMPT },
      { role: "user", content: JSON.stringify(input) },
    ],
  });

  return JSON.parse(cleanJsonText(res.choices[0].message.content));
}

async function main() {
  console.log("🔎 AI kalite kontrol başladı");

  let toplam = 0;

  while (true) {
    const result = await pool.query(
      `
      SELECT
        id,
        basvuru_no,
        karar_adi,
        karar_tarihi,
        sonuc,
        sonuc_aym,
        basvuru_konusu,
        mudahale_iddiasi_aym,
        ai_karar_ozeti,
        ai_neden_onemli,
        ai_benzer_basvuruda_dikkat,
        metin
      FROM kararlar
      WHERE cezaevi_mi = true
        AND ai_prompt_versiyon = $1
        AND ai_analiz_durumu = 'ok'
        AND (
          ai_karar_ozeti_kalite IS NULL
          OR ai_neden_onemli_kalite IS NULL
          OR ai_benzer_basvuruda_dikkat_kalite IS NULL
        )
      ORDER BY id
      LIMIT $2
      `,
      [PROMPT_VERSION, BATCH_SIZE]
    );

    const rows = result.rows;

    if (rows.length === 0) break;

    console.log(`📦 Kontrol edilecek batch: ${rows.length}`);

    for (const row of rows) {
      try {
        const q = await kaliteKontrol(row);

        const kararKalite = q.ai_karar_ozeti_kalite || "kontrol_edilecek";
        const nedenKalite = q.ai_neden_onemli_kalite || "kontrol_edilecek";
        const dikkatKalite =
          q.ai_benzer_basvuruda_dikkat_kalite || "kontrol_edilecek";

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_karar_ozeti_kalite = $1,
            ai_neden_onemli_kalite = $2,
            ai_benzer_basvuruda_dikkat_kalite = $3,
            ai_kalite_kontrol_model = $4,
            ai_kalite_kontrol_at = NOW(),
            ai_kalite_kontrol_notu = $5
          WHERE id = $6
          `,
          [
            kararKalite,
            nedenKalite,
            dikkatKalite,
            `${MODEL} / ${QUALITY_VERSION}`,
            String(q.not || "").slice(0, 2000),
            row.id,
          ]
        );

        console.log(
          `✅ ${row.basvuru_no} | özet:${kararKalite} neden:${nedenKalite} dikkat:${dikkatKalite}`
        );

        toplam++;
      } catch (err) {
        console.log(`❌ Kalite kontrol hatası: ${row.basvuru_no}`);
        console.error(err.message);

        fs.appendFileSync(
          "kalite-hatalar.log",
          `${row.basvuru_no} - ${err.message}\n`
        );

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_karar_ozeti_kalite = 'kontrol_edilecek',
            ai_neden_onemli_kalite = 'kontrol_edilecek',
            ai_benzer_basvuruda_dikkat_kalite = 'kontrol_edilecek',
            ai_kalite_kontrol_model = $1,
            ai_kalite_kontrol_at = NOW(),
            ai_kalite_kontrol_notu = $2
          WHERE id = $3
          `,
          [
            `${MODEL} / ${QUALITY_VERSION}`,
            `Kalite kontrol hatası: ${String(err.message || "").slice(0, 1500)}`,
            row.id,
          ]
        );
      }

      await sleep(300);
    }
  }

  await pool.end();
  console.log(`🎉 Kalite kontrol tamamlandı. Kontrol edilen: ${toplam}`);
}

main();