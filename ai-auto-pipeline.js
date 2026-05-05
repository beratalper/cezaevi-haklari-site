import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

const MODEL = "gpt-4.1-mini";
const PROMPT_VERSION = "cezaevi-ai-auto-pipeline-v1-v5-v6";
const BATCH_SIZE = 10;

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

const OZET_PROMPT = `
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

const NEDEN_DIKKAT_PROMPT = `
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

function buildInput(row, extra = {}) {
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

${extra.ai_karar_ozeti ? `Kalitesi geçti kabul edilen karar özeti:\n${extra.ai_karar_ozeti}` : ""}

--- KARAR METNİ BAŞLANGICI ---
${basMetin}

--- HÜKÜM / KARAR METNİNİN SON KISMI ---
${hukum}
`;
}

async function produceOzet(row) {
  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: OZET_PROMPT },
      { role: "user", content: buildInput(row) },
    ],
  });

  const parsed = JSON.parse(cleanJsonText(res.choices[0].message.content));

  if (!parsed.ai_karar_ozeti) {
    throw new Error("Özet boş döndü");
  }

  return parsed.ai_karar_ozeti;
}

async function produceNedenDikkat(row, ai_karar_ozeti) {
  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: NEDEN_DIKKAT_PROMPT },
      {
        role: "user",
        content: buildInput(row, { ai_karar_ozeti }),
      },
    ],
  });

  const parsed = JSON.parse(cleanJsonText(res.choices[0].message.content));

  if (!parsed.ai_neden_onemli || !parsed.ai_benzer_basvuruda_dikkat) {
    throw new Error("Neden/dikkat alanı boş döndü");
  }

  return parsed;
}

async function main() {
  console.log("🚀 AUTO PIPELINE başladı");

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
        metin
      FROM kararlar
      WHERE cezaevi_mi = true
        AND metin IS NOT NULL
        AND metin <> ''
        AND (
          ai_karar_ozeti IS NULL OR ai_karar_ozeti = ''
          OR ai_neden_onemli IS NULL OR ai_neden_onemli = ''
          OR ai_benzer_basvuruda_dikkat IS NULL OR ai_benzer_basvuruda_dikkat = ''
          OR ai_analiz_durumu IS NULL
          OR ai_analiz_durumu <> 'ok'
          OR ai_karar_ozeti_kalite IS NULL
          OR ai_neden_onemli_kalite IS NULL
          OR ai_benzer_basvuruda_dikkat_kalite IS NULL
        )
      ORDER BY id
      LIMIT $1
      `,
      [BATCH_SIZE]
    );

    const rows = result.rows;

    if (rows.length === 0) break;

    console.log(`📦 İşlenecek batch: ${rows.length}`);

    for (const row of rows) {
      try {
        console.log(`İşleniyor: ${row.basvuru_no}`);

        const ai_karar_ozeti = await produceOzet(row);
        await sleep(300);

        const nedenDikkat = await produceNedenDikkat(row, ai_karar_ozeti);

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_karar_ozeti = $1,
            ai_neden_onemli = $2,
            ai_benzer_basvuruda_dikkat = $3,

            ai_analiz_model = $4,
            ai_prompt_versiyon = $5,
            ai_analiz_at = NOW(),
            ai_analiz_durumu = 'ok',
            ai_analiz_hata = NULL,

            ai_karar_ozeti_kalite = 'geçti',
            ai_neden_onemli_kalite = 'geçti',
            ai_benzer_basvuruda_dikkat_kalite = 'geçti'
          WHERE id = $6
          `,
          [
            ai_karar_ozeti,
            nedenDikkat.ai_neden_onemli,
            nedenDikkat.ai_benzer_basvuruda_dikkat,
            MODEL,
            PROMPT_VERSION,
            row.id,
          ]
        );

        console.log(`✅ ${row.basvuru_no}`);
        toplam++;
      } catch (err) {
        console.log(`❌ HATA: ${row.basvuru_no}`);
        console.error(err.message);

        fs.appendFileSync(
          "auto-pipeline-hatalar.log",
          `${row.basvuru_no} - ${err.message}\n`
        );

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_analiz_durumu = 'hata',
            ai_analiz_hata = $1,
            ai_analiz_model = $2,
            ai_prompt_versiyon = $3,
            ai_analiz_at = NOW()
          WHERE id = $4
          `,
          [
            String(err.message || "").slice(0, 2000),
            MODEL,
            PROMPT_VERSION,
            row.id,
          ]
        );
      }

      await sleep(400);
    }
  }

  await pool.end();
  console.log(`🎉 AUTO PIPELINE tamamlandı. İşlenen: ${toplam}`);
}

main();