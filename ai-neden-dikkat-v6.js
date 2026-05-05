import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

const MODEL = "gpt-4.1-mini";
const PROMPT_VERSION = "cezaevi-ai-v6-neden-dikkat-final";
const BATCH_SIZE = 10;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const PROMPT = `
Sen Anayasa Mahkemesi bireysel başvuru kararlarını vatandaşın anlayacağı dile çeviren kıdemli hukuk editörüsün.

GÖREV:
Sadece şu iki alanı üret:
1. ai_neden_onemli
2. ai_benzer_basvuruda_dikkat

TEMEL DAYANAK:
- Karar özeti ve HÜKÜM esas alınır.
- Sonuç ile çelişen hiçbir şey yazma.
- Kabul edilemez kararda "hak ihlali vardır" gibi anlatma.
- İhlal kararında hangi davranışın veya eksikliğin ihlale yol açtığını açıkla.
- Düşme veya ret kararlarında bunu açıkça gözet.

AI_NEDEN_ONEMLI NASIL OLMALI:
- 2 ila 4 kısa cümle.
- "Bu karar şunu gösterir..." diye başlayabilir.
- Vatandaşın bu karardan hangi dersi çıkaracağını açıkla.
- Soyut hukuk cümlesi kurma.
- "Belirli ağırlık", "etkili başvuru", "somut mağduriyet" gibi ifadeleri açıklamadan kullanma.
- Eğer başvuru kabul edilemez ise önemini şöyle kur:
  "Bu karar, başvurunun kabul edilebilmesi için iddianın somut olay ve delillerle açıkça ortaya konulması gerektiğini gösterir."
- Eğer ihlal varsa:
  "Bu karar, cezaevi idaresi veya yargı makamlarının hangi eksikliği nedeniyle hak ihlali oluştuğunu gösterir."

AI_BENZER_BASVURUDA_DIKKAT NASIL OLMALI:
- Yol gösterici yaz.
- 3 ila 6 kısa cümle.
- Başvurucuya pratik tavsiye ver.
- Mutlaka somutlaştır:
  - hangi belgeler eklenmeli
  - hangi tarihler belirtilmeli
  - hangi başvuru yolları tüketilmeli
  - hangi kararın ne zaman tebliğ edildiği yazılmalı
- Süre vurgusu yap.
- "Somut delil" dersen örnek ver:
  kamera kaydı, doktor raporu, dilekçe, disiplin kararı, infaz hâkimliği kararı, tebliğ tarihi, tanık beyanı gibi.

YASAK:
- Hükümde olmayan tazminat veya sonuçtan bahsetme.
- "Kesin ihlal olur" gibi garanti verme.
- Vatandaşa yanlış başvuru yolu öğretme.
- Genel ve boş tavsiye yazma.

SADECE JSON üret:

{
  "ai_neden_onemli": "",
  "ai_benzer_basvuruda_dikkat": ""
}
`;

function buildInput(row) {
  const metin = row.metin || "";
  const basMetin = metin.slice(0, 10000);
  const hukum = metin.slice(-8000);

  return `
Başvuru No:
${row.basvuru_no}

Karar Adı:
${row.karar_adi || ""}

Başvuru Konusu:
${row.basvuru_konusu || ""}

Genel Sonuç:
${row.sonuc || ""}

AYM Sonucu:
${row.sonuc_aym || ""}

Kalitesi geçti kabul edilen karar özeti:
${row.ai_karar_ozeti || ""}

Mevcut neden önemli:
${row.ai_neden_onemli || ""}

Mevcut benzer başvuruda dikkat:
${row.ai_benzer_basvuruda_dikkat || ""}

--- KARAR METNİ BAŞLANGICI ---
${basMetin}

--- HÜKÜM / KARAR METNİNİN SON KISMI ---
${hukum}
`;
}

async function main() {
  console.log("🚀 V6 NEDEN + DİKKAT ÜRETİMİ BAŞLADI");

  let toplam = 0;

  while (true) {
    const result = await pool.query(
      `
      SELECT
        id,
        basvuru_no,
        karar_adi,
        sonuc,
        sonuc_aym,
        basvuru_konusu,
        ai_karar_ozeti,
        ai_neden_onemli,
        ai_benzer_basvuruda_dikkat,
        ai_neden_onemli_kalite,
        ai_benzer_basvuruda_dikkat_kalite,
        metin
      FROM kararlar
      WHERE cezaevi_mi = true
        AND (
          ai_neden_onemli_kalite IS NULL
          OR ai_neden_onemli_kalite <> 'geçti'
          OR ai_benzer_basvuruda_dikkat_kalite IS NULL
          OR ai_benzer_basvuruda_dikkat_kalite <> 'geçti'
        )
      ORDER BY id
      LIMIT $1
      `,
      [BATCH_SIZE]
    );

    const rows = result.rows;

    if (rows.length === 0) break;

    console.log(`📦 V6 batch: ${rows.length}`);

    for (const row of rows) {
      try {
        const input = buildInput(row);

        const res = await openai.chat.completions.create({
          model: MODEL,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: PROMPT },
            { role: "user", content: input },
          ],
        });

        const parsed = JSON.parse(
          cleanJsonText(res.choices[0].message.content)
        );

        if (!parsed.ai_neden_onemli || !parsed.ai_benzer_basvuruda_dikkat) {
          throw new Error("V6 boş alan döndürdü");
        }

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_neden_onemli = $1,
            ai_benzer_basvuruda_dikkat = $2,
            ai_neden_onemli_kalite = 'geçti',
            ai_benzer_basvuruda_dikkat_kalite = 'geçti',
            ai_neden_dikkat_v6_model = $3,
            ai_neden_dikkat_v6_at = NOW(),
            ai_neden_dikkat_v6_not = 'v6 ile yeniden üretildi'
          WHERE id = $4
          `,
          [
            parsed.ai_neden_onemli,
            parsed.ai_benzer_basvuruda_dikkat,
            `${MODEL} / ${PROMPT_VERSION}`,
            row.id,
          ]
        );

        console.log(`✅ ${row.basvuru_no}`);
        toplam++;
      } catch (err) {
        console.log(`❌ HATA: ${row.basvuru_no}`);
        console.error(err.message);

        fs.appendFileSync(
          "v6-hatalar.log",
          `${row.basvuru_no} - ${err.message}\n`
        );
      }

      await sleep(400);
    }
  }

  await pool.end();
  console.log(`🎉 V6 TAMAMLANDI: ${toplam}`);
}

main();