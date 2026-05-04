import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

const MODEL = "gpt-4.1-mini";
const BATCH_SIZE = 20;
const PROMPT_VERSION = "cezaevi-ai-v3-final-hukum";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanJsonText(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

// 🔥 1. AŞAMA: VERİ ÇIKARIM
const EXTRACT_PROMPT = `
Sen bir hukuk veri çıkarım uzmanısın.

KESİN KURALLAR:
- Yorum yapma
- Tahmin yapma
- Metinde yoksa yazma
- Emin değilsen "belirtilmemiş" yaz

HÜKÜM ÖNCELİĞİ:
- Kararın sonucu sadece HÜKÜM bölümünden çıkarılır
- Diğer bölümlerle çelişirse HÜKÜM doğrudur

ÇOK BAŞVURUCU:
- Ayrım varsa ayrı ayrı yaz

ÇOK HAK:
- Her hak için sonucu ayrı yaz

ÇIKTI JSON:
{
  "basvurucunun_iddiasi": "",
  "idari_yargisal_surec": "",
  "aym_gerekcesi": "",
  "aym_sonucu": ""
}
`;

// 🔥 2. AŞAMA: YAZIM
const WRITE_PROMPT = `
Sen sade anlatım konusunda uzman hukuk yazarı­sın.

ASLA:
- uydurma bilgi ekleme
- genelleme yapma

KURALLAR:
- Sonuç sadece HÜKÜM'e göre yazılır
- Karma karar varsa ilk cümlede belirt
- Çok başvurucu varsa ayır
- Çok hak varsa ayrı ayrı yaz

JSON üret:
{
  "ai_basvuru_konusu": "",
  "ai_karar_ozeti": "",
  "ai_neden_onemli": "",
  "ai_benzer_basvuruda_dikkat": ""
}
`;

function buildInput(row) {
  const metin = row.metin || "";
  return `
Başvuru No: ${row.basvuru_no}

${metin.slice(0, 12000)}

--- HÜKÜM ---
${metin.slice(-6000)}
`;
}

async function main() {
  console.log("🚀 V3 FINAL BAŞLADI");

  let toplam = 0;

  while (true) {
    const result = await pool.query(
      `
      SELECT *
      FROM kararlar
      WHERE cezaevi_mi = true
        AND (
          ai_analiz_durumu IS NULL
          OR ai_analiz_durumu <> 'ok'
        )
      ORDER BY id
      LIMIT $1
      `,
      [BATCH_SIZE]
    );

    const kararlar = result.rows;
    if (kararlar.length === 0) break;

    console.log(`📦 Batch: ${kararlar.length}`);

    for (const row of kararlar) {
      try {
        const input = buildInput(row);

        // 🔹 EXTRACT
        const extractRes = await openai.chat.completions.create({
          model: MODEL,
          temperature: 0,
          messages: [
            { role: "system", content: EXTRACT_PROMPT },
            { role: "user", content: input },
          ],
        });

        const extracted = JSON.parse(
          cleanJsonText(extractRes.choices[0].message.content)
        );

        // 🔹 WRITE
        const writeRes = await openai.chat.completions.create({
          model: MODEL,
          temperature: 0.2,
          messages: [
            { role: "system", content: WRITE_PROMPT },
            {
              role: "user",
              content: JSON.stringify({ extracted }),
            },
          ],
        });

        const parsed = JSON.parse(
          cleanJsonText(writeRes.choices[0].message.content)
        );

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_basvuru_konusu = $1,
            ai_karar_ozeti = $2,
            ai_neden_onemli = $3,
            ai_benzer_basvuruda_dikkat = $4,
            ai_analiz_model = $5,
            ai_prompt_versiyon = $6,
            ai_analiz_at = NOW(),
            ai_analiz_durumu = 'ok',
            ai_analiz_hata = NULL
          WHERE id = $7
          `,
          [
            parsed.ai_basvuru_konusu || "",
            parsed.ai_karar_ozeti || "",
            parsed.ai_neden_onemli || "",
            parsed.ai_benzer_basvuruda_dikkat || "",
            MODEL,
            PROMPT_VERSION,
            row.id,
          ]
        );

        console.log("✅", row.basvuru_no);
        toplam++;
      } catch (err) {
        console.log("❌", row.basvuru_no);

        fs.appendFileSync(
          "hatalar.log",
          `${row.basvuru_no} - ${err.message}\n`
        );

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_analiz_durumu = 'hata',
            ai_analiz_hata = $1,
            ai_prompt_versiyon = $2
          WHERE id = $3
          `,
          [err.message, PROMPT_VERSION, row.id]
        );
      }

      await sleep(400);
    }
  }

  await pool.end();
  console.log("🎉 TAMAMLANDI:", toplam);
}

main();