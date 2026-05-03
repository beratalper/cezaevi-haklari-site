import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// KAÇAR KAÇAR İŞLESİN
const BATCH_SIZE = 20;

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function aiUret(karar) {
    const prompt = `
Aşağıdaki Anayasa Mahkemesi kararını analiz et:

Başvuru konusu:
${karar.basvuru_konusu}

Müdahale:
${karar.mudahale_iddiasi_aym}

Sonuç:
${karar.sonuc_aym}

Kurallar:
- HÜKÜM esas alınmalı
- Karma karar varsa açıkça belirt
- Kullanıcı dostu yaz
- Hukuki ama sade anlat

JSON olarak üret:
{
  "basvuru_konusu": "...",
  "karar_ozeti": "...",
  "neden_onemli": "...",
  "dikkat": "..."
}
`;

    const res = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
    });

    return JSON.parse(res.choices[0].message.content);
}

async function main() {
    console.log("🚀 TOPLU ÜRETİM BAŞLADI");

    let offset = 0;
    let toplam = 0;

    while (true) {
        const result = await pool.query(
            `
  SELECT *
  FROM kararlar
  WHERE cezaevi_mi = true
    AND metin IS NOT NULL
    AND metin <> ''
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

        console.log(`\n📦 Batch: ${offset} - ${offset + kararlar.length}`);

        for (const karar of kararlar) {
            try {
                const ai = await aiUret(karar);

                await pool.query(
                    `
          UPDATE kararlar
          SET
            ai_basvuru_konusu = $1,
            ai_karar_ozeti = $2,
            ai_neden_onemli = $3,
            ai_benzer_basvuruda_dikkat = $4,
            ai_prompt_versiyon = 'v2'
          WHERE id = $5
          `,
                    [
                        ai.basvuru_konusu,
                        ai.karar_ozeti,
                        ai.neden_onemli,
                        ai.dikkat,
                        karar.id,
                    ]
                );

                console.log(`✅ ${karar.basvuru_no}`);
                toplam++;
            } catch (err) {
                console.log(`❌ HATA: ${karar.basvuru_no}`);
                console.error(err.message);

                fs.appendFileSync("hatalar.log", karar.basvuru_no + "\n");
            }

            // RATE LIMIT KORUMA
            await sleep(500);
        }

        offset += BATCH_SIZE;
    }

    console.log(`\n🎉 TAMAMLANDI: ${toplam} karar işlendi`);
}

main();