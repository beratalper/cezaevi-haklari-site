import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

const MODEL = "gpt-4.1-mini";
const PROMPT_VERSION = "cezaevi-ai-v5-ozet-final";
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
Sen Anayasa Mahkemesi bireysel başvuru kararlarını analiz eden kıdemli hukuk raportörüsün.

GÖREV:
Sadece "karar özeti" üret.

EN KRİTİK KURAL:
- Nihai sonuç SADECE HÜKÜM bölümünden çıkarılır.
- HÜKÜM ile kararın diğer bölümleri çelişirse HÜKÜM doğrudur.
- Genel sonuç, AYM sonucu veya başvuru konusu tek başına esas alınmaz.

ZORUNLU İLK CÜMLE:
- Eğer sadece ihlal varsa:
"Başvurunun ... yönünden ihlal edildiğine karar verilmiştir."

- Eğer sadece kabul edilemez varsa:
"Başvurunun ... yönünden kabul edilemez olduğuna karar verilmiştir."

- Eğer sadece ihlal olmadığı varsa:
"Başvurunun ... yönünden ihlal olmadığına karar verilmiştir."

- Eğer düşme varsa:
"Başvurunun düşmesine karar verilmiştir."

- Eğer karma karar varsa:
"Başvurunun bir kısmında ..., bir kısmında ... kararı verilmiştir."

KARMA KARAR KURALI:
- Birden fazla hak, iddia veya başvurucu varsa sonucu tekleştirme.
- Her hak/idda/başvurucu grubu için sonucu ayrı yaz.
- Tazminat, yeniden yargılama veya gönderme kararı sadece hükümde varsa yaz.

YASAK:
- Hükümde olmayan hak, tazminat, yeniden yargılama veya kişi ekleme.
- Kabul edilemez kararı ihlal gibi anlatma.
- İhlal olmadığı kararını kabul edilemez gibi anlatma.
- "Reddedilmiştir" gibi belirsiz genel ifadeyi tek başına kullanma.
- Sonuçtan emin değilsen genel sonuç uydurma.

YAZIM:
- 3 ila 5 cümle.
- Kısa, sade, hukuki ama vatandaşın anlayacağı dil.
- İlk cümlede mutlaka nihai sonuç veya karma sonuç açıkça yer alsın.

SADECE JSON üret:

{
  "ai_karar_ozeti": ""
}
`;

function buildInput(row) {
  const metin = row.metin || "";
  const basMetin = metin.slice(0, 12000);
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

Mevcut AI Özeti:
${row.ai_karar_ozeti || ""}

--- KARAR METNİ BAŞLANGICI ---
${basMetin}

--- HÜKÜM / KARAR METNİNİN SON KISMI ---
${hukum}
`;
}

async function main() {
  console.log("🚀 V5 FINAL ÖZET ÜRETİM BAŞLADI");

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
        ai_karar_ozeti_kalite,
        metin
      FROM kararlar
      WHERE cezaevi_mi = true
        AND ai_karar_ozeti_kalite <> 'geçti'
      ORDER BY id
      LIMIT $1
      `,
      [BATCH_SIZE]
    );

    const rows = result.rows;

    if (rows.length === 0) break;

    console.log(`📦 V5 batch: ${rows.length}`);

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

        if (!parsed.ai_karar_ozeti) {
          throw new Error("V5 boş karar özeti döndürdü");
        }

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_karar_ozeti = $1,
            ai_karar_ozeti_kalite = 'geçti',
            ai_karar_ozeti_v4_model = $2,
            ai_karar_ozeti_v4_at = NOW(),
            ai_karar_ozeti_v4_not = 'v5 final özet ile yeniden üretildi'
          WHERE id = $3
          `,
          [
            parsed.ai_karar_ozeti,
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
          "v5-hatalar.log",
          `${row.basvuru_no} - ${err.message}\n`
        );
      }

      await sleep(400);
    }
  }

  await pool.end();
  console.log(`🎉 V5 TAMAMLANDI: ${toplam}`);
}

main();