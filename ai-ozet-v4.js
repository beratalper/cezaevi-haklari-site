import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

const MODEL = "gpt-4.1-mini";
const PROMPT_VERSION = "cezaevi-ai-v4-ozet";
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

// 🔥 V4 ULTRA HÜKÜM ODAKLI PROMPT
const PROMPT = `
Sen Anayasa Mahkemesi bireysel başvuru kararlarını analiz eden üst düzey hukuk uzmanısın.

GÖREV:
Sadece "karar özeti" üret.

EN KRİTİK KURAL:
- Kararın sonucu SADECE HÜKÜM bölümüne göre belirlenir.
- Metnin diğer bölümleriyle çelişirse HÜKÜM doğrudur.

YAPILMASI GEREKENLER:

1. İLK CÜMLE:
- Kararın sonucu açıkça yazılmalı:
  - "Başvurunun ... yönünden ihlal kararı verilmiştir."
  - "Başvuru kabul edilemez bulunmuştur."
  - "Başvurunun bir kısmında ihlal, bir kısmında kabul edilemez kararı verilmiştir."

2. KARMA KARAR:
- Eğer hem ihlal hem kabul edilemez varsa:
  → ilk cümlede açıkça belirtmek ZORUNLU

3. ÇOK HAK:
- Her hak için sonucu ayrı belirt

4. ÇOK BAŞVURUCU:
- Eğer ayrım varsa belirt

5. ASLA:
- Uydurma bilgi ekleme
- Hükümde olmayan sonuç yazma
- İhlal yoksa ihlal var gibi yazma
- Kabul edilemez kararı ihlal gibi yazma

6. YAZIM:
- Kısa
- Net
- Hukuki ama sade
- 3-6 cümle

JSON üret:

{
  "ai_karar_ozeti": "..."
}
`;

function buildInput(row) {
    const metin = row.metin || "";

    return `
Başvuru No: ${row.basvuru_no}

Başvuru konusu:
${row.basvuru_konusu || ""}

AYM sonucu:
${row.sonuc_aym || ""}

--- KARAR METNİ ---
${metin.slice(0, 12000)}

--- HÜKÜM ---
${metin.slice(-6000)}
`;
}

async function main() {
    console.log("🚀 V4 ÖZET ÜRETİM BAŞLADI");

    let toplam = 0;

    while (true) {
        const result = await pool.query(
            `
      SELECT *
      FROM kararlar
      WHERE cezaevi_mi = true
  AND ai_karar_ozeti_v4_at IS NOT NULL
  AND ai_karar_ozeti_kalite IS NULL
      ORDER BY id
      LIMIT $1
      `,
            [BATCH_SIZE]
        );

        const rows = result.rows;

        if (rows.length === 0) break;

        console.log(`📦 Batch: ${rows.length}`);

        for (const row of rows) {
            try {
                const input = buildInput(row);

                const res = await openai.chat.completions.create({
                    model: MODEL,
                    temperature: 0,
                    messages: [
                        { role: "system", content: PROMPT },
                        { role: "user", content: input },
                    ],
                });

                const parsed = JSON.parse(
                    cleanJsonText(res.choices[0].message.content)
                );

                await pool.query(
                    `
          UPDATE kararlar
          SET
  ai_karar_ozeti = $1,
  ai_karar_ozeti_kalite = 'v4_yapildi',
  ai_karar_ozeti_v4_model = $2,
  ai_karar_ozeti_v4_at = NOW(),
  ai_karar_ozeti_v4_not = 'v4 ile yeniden üretildi'
          WHERE id = $3
          `,
                    [
                        parsed.ai_karar_ozeti || "",
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
                    "v4-hatalar.log",
                    `${row.basvuru_no} - ${err.message}\n`
                );
            }

            await sleep(400);
        }
    }

    await pool.end();
    console.log(`🎉 V4 TAMAMLANDI: ${toplam}`);
}

main();