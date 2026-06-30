import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import pkg from "pg";
import fs from "fs";
import { kaliteKontrolYeni } from "./ai-yeni-kalite-kontrol.js";

const { Pool } = pkg;

const MODEL = "gpt-4.1-mini";
const PROMPT_VERSION = "genel-ai-v3-olay-arama-self-healing";
const BATCH_SIZE = 15; // Yeni mantık ve RAG benzeri sorgularla işlem yükünü dengeli tutmak için ideal batç boyutu
const MAX_HEAL_ATTEMPTS = 2; // Daha fazla şans tanıyarak başarı oranını zirveye çıkarıyoruz

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

const KARAR_ANALIZ_PROMPT = `
Sen Anayasa Mahkemesi (AYM) kararlarını en yüksek mertebede analiz eden, kıdemli bir anayasa hukuku raportörü, olay-bütünleştirme uzmanı ve kıdemli hukuk editörüsün.

GÖREVİN:
Sana verilen AYM kararını analiz ederek, kullanıcıların (hukukçu veya vatandaş) davanın özünü (başkalarına ne olduğunu), davanın neden önemli olduğunu, dava sonucunda saptanan hukuki kuralı ve akıllı arama yaparken karşılarına çıkacak her dilde süzülmüş kelime kalıplarını tek bir JSON şeklinde üretmektir.

BU ALANLAR VE KESİN KURALLAR:

1. ai_karar_ozeti:
   - Kararın hüküm tabanlı kuru listesi DEĞİLDİR.
   - Kesinlikle OLAY VE OLGULAR ile BAŞVURUNUN KONUSU kısımlarına odaklanarak, başvurucunun başına gelen fiili/beşeri olayı (örn. hangi konuşmasından ötürü ceza aldığı, hangi mülkiyet uyuşmazlığının cereyan ettiği, hangi disiplin cezasına konu eylemi yaptığı vb.) açıkça anlatmalıdır.
   - Ardından, bu olayın hukuk sistemi ve mahkemeler nezdindeki nihai akıbetini (hükmü) de içine alan tam 3 ila 5 cümlelik bir olay hikayesi kurgulamalıdır.
   - ZORUNLU KURAL: Çıkarım yaparken "İLGİLİ HUKUK" başlığı altındaki mevzuat detaylarını KULLANMAYINIZ. Sadece somut "Olay ve Olgular" ve "Hüküm" kısımlarını kullanın.

2. ai_neden_onemli:
   - Bu kararın getirdiği emsal niteliği 2-3 cümleyle açıklayın.
   - "ai_karar_ozeti" kısmında yer alan olgularla tam bir anlatım bütünlüğü kurmalıdır. Özette hiç bahsedilmeyen bir detaya (örn. "konuşma bağlamı" veya "çelişkili delil") burada aniden, arka planı verilmeden değinilmemelidir. Havada kalan hiçbir referans olmamalıdır.

3. ai_benzer_basvuruda_dikkat:
   - Başvurucuya yardımcı olacak 3 ila 5 kısa usuli ve somut pratik tavsiye (örn. eklenmesi elzem deliller, tebliğ evrakları, süre sınırları).

4. ai_arama_onerileri:
   - Kullanıcının bu davanın konusuyla ilgili akıllı tavsiye aramaları yaparken karşısına çıkacak zengin ve profesyonel hukuk terimleri kümesidir.
   - Örn. Kullanıcı "kamu" yazarken sistemin karşısına sunabileceği zengin kelime grupları olmalıdır.
   - Tamamen hukuk dili ve kavramlarıyla süzülmüş en fazla 4-6 terimden oluşan bir dizi (array) üretin.
   - Örnek: ["kamulaştırmasız el atma", "hukuki yarar", "savunma hakkının kısıtlanması", "makul sürede karar"]

5. ai_kural (En Can Alıcı Nokta):
   - Gelecekte çıkabilecek benzer tüm uyuşmazlıklara çözüm sunacak düzeyde kapsayıcı, genel ve güçlü bir içtihat ilkesidir.
   - Karardaki kişi isimleri, tarih, dava numarası veya yıla dair özel ibareleri ASLA İÇERMEMELİDİR.
   - 1 cümle sınırını aşabilirsiniz; yeter ki kurallar arasındaki anlamı, eksikliğe düşmeden, tüm benzer durumları kapsayacak güçte ifade edin.
   - ÖNEMLİ (EMSAL KURAL UYUMU): Sana gönderilen "Mevcut Emsal Kurallar" listesini oku. Eğer bu kararın koyduğu ilke, o listedeki kurallardan biriyle birebir örtüşüyorsa, yeni bir kural uydurma, aynen o kuralı bu alana yaz. Eğer tam örtüşmüyorsa ya da daha kapsayıcı hale getirilmesi gerekiyorsa, eski kuralların anlam bütünlüğünü de kapsayacak geniş, birleştirici ve güçlü yeni bir kural oluşturup yaz.

ÇIKTI FORMATI (SADECE JSON):
{
  "ai_karar_ozeti": "...",
  "ai_neden_onemli": "...",
  "ai_benzer_basvuruda_dikkat": "...",
  "ai_arama_onerileri": ["...", "...", "..."],
  "ai_kural": "..."
}
`;

const SELF_HEAL_PROMPT = `
Sen kıdemli bir anayasa hukuku raportörü, düzeltme uzmanı ve kalite kontrol editörüsün.
Analiz çıktısı kalite kontrol denetlemesini geçemedi.

EDİTÖRÜN DÜZELTME GERİ BİLDİRİMİ:
{{FEEDBACK_NOTE}}

ÖNCEKİ ÜRETİLEN HATALI ÇIKTI:
{{PREVIOUS_OUTPUT}}

GÖREVİN:
1. Geri bildirim notlarını ve hataları çok dikkatli oku.
2. Düzeltilmesi istenen alanları kurallara bütünüyle uyacak şekilde baştan düzenle.
3. ai_karar_ozeti alanının kuru bir hüküm listesi değil, doğrudan somut "Olay ve Olgular"ı yansıtan bir hikaye anlatımı içermesini sağla.
4. "ai_kural" ve "ai_arama_onerileri" alanlarındaki hataları tamamen gider. Kuralın genel geçer, soyut ve kapsayıcı olmasını temin et.

SADECE DÜZELTİLMİŞ JSON ÇIKTISINI ÜRET:
{
  "ai_karar_ozeti": "...",
  "ai_neden_onemli": "...",
  "ai_benzer_basvuruda_dikkat": "...",
  "ai_arama_onerileri": ["...", "...", "..."],
  "ai_kural": "..."
}
`;

async function getEmsalRules(hakOzgurluk, kolaylestiriciIdda) {
  if (!hakOzgurluk && !kolaylestiriciIdda) return [];
  try {
    const res = await pool.query(
      `
      SELECT DISTINCT ai_kural 
      FROM kararlar 
      WHERE ai_kural IS NOT NULL 
        AND ai_kural <> ''
        AND ai_kural_kalite = 'geçti'
        AND (hak_ozgurluk_aym = $1 OR mudahale_iddiasi_aym = $2)
      LIMIT 15
      `,
      [hakOzgurluk, kolaylestiriciIdda]
    );
    return res.rows.map(r => r.ai_kural);
  } catch {
    return [];
  }
}

function buildInput(row, emsalKurallar = []) {
  const metin = row.metin || "";
  
  // İlgili Hukuk bölümlerini temizlemek için akıllı döküman kırpma
  // Genelde ilgili hukuk kısımlarının uzun mevzuat listesi içerdiğini bildiğimiz için
  // OLAY VE OLGULAR (metnin başı, İlgili Hukuk'tan hemen öncesi) kısmını almaya çalışalım
  const basMetin = metin.slice(0, 16000);
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

Hak Özgürlük Kapsamı (AYM):
${row.hak_ozgurluk_aym || ""}

Müdahale İddiası Kapsamı (AYM):
${row.mudahale_iddiasi_aym || ""}

Mevcut Emsal Kurallar Listesi (Benzer konulardaki kurallar):
${emsalKurallar.length > 0 ? emsalKurallar.map((k, i) => `${i + 1}. ${k}`).join("\n") : "Henüz bu kategoriye ait emsal bir kural üretilmemiş."}

--- KARAR METNİNİN BAŞLANGIÇ BÖLÜMÜ (OLAY VE OLGULAR İÇİN) ---
${basMetin}

--- HÜKÜM / SON BÖLÜM ---
${hukum}
`;
}

async function produceAnalysis(row, emsalKurallar) {
  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: KARAR_ANALIZ_PROMPT },
      { role: "user", content: buildInput(row, emsalKurallar) },
    ],
  });

  return JSON.parse(cleanJsonText(res.choices[0].message.content));
}

async function healAnalysis(row, previousOutput, feedbackNote, emsalKurallar) {
  const healSystemPrompt = SELF_HEAL_PROMPT
    .replace("{{FEEDBACK_NOTE}}", feedbackNote)
    .replace("{{PREVIOUS_OUTPUT}}", JSON.stringify(previousOutput, null, 2));

  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.3, // Temperature değerini 0.3 yaparak modelin deterministik döngülerden sıyrılıp hatasını düzeltmesini kolaylaştırıyoruz
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: healSystemPrompt },
      { role: "user", content: buildInput(row, emsalKurallar) },
    ],
  });

  return JSON.parse(cleanJsonText(res.choices[0].message.content));
}

async function main() {
  console.log("🚀 YENİ NESİL OLAY ODAKLI & SELF-HEALING GÜÇLÜ PIPELINE BAŞLADI");
  console.log(`Model: ${MODEL} | Batch: ${BATCH_SIZE}`);

  let toplam = 0;
  let sifaBulan = 0;

  while (true) {
    // ai_analiz_durumu boş veya hatalı veya ai_kural alanı doldurulmamış olan kararları çekiyoruz.
    const result = await pool.query(
      `
      SELECT
        id,
        basvuru_no,
        karar_adi,
        sonuc,
        sonuc_aym,
        basvuru_konusu,
        hak_ozgurluk_aym,
        mudahale_iddiasi_aym,
        metin
      FROM kararlar
      WHERE metin IS NOT NULL
        AND metin <> ''
        AND (
          ai_analiz_durumu IS NULL 
          OR ai_analiz_durumu <> 'ok'
          OR ai_kural IS NULL
          OR ai_prompt_versiyon <> $1
        )
      ORDER BY id ASC
      LIMIT $2
      `,
      [PROMPT_VERSION, BATCH_SIZE]
    );

    const rows = result.rows;

    if (rows.length === 0) {
      console.log("🎉 İşlenecek döküman kalmadı! Süreç başarıyla nihayete erdi.");
      break;
    }

    console.log(`\n📦 Yeni batç başladı. Sırada bekleyen ${rows.length} kayıt işleniyor...`);

    for (const row of rows) {
      try {
        console.log(`----------------------------------------`);
        console.log(`⏳ Başvuru No: ${row.basvuru_no} | Karar: ${row.karar_adi}`);

        // Emsal Kuralları RAG benzeri yapıyla tablodan çekiyoruz
        const emsalKurallar = await getEmsalRules(row.hak_ozgurluk_aym, row.mudahale_iddiasi_aym);
        console.log(`🔍 Benzer konular için ${emsalKurallar.length} adet emsal kural getirildi.`);

        // 1. Aşama: İlk Analiz Üretimi
        let data = await produceAnalysis(row, emsalKurallar);
        await sleep(200);

        let attempt = 0;
        let q;
        let needsHeal = true;

        // İyileştirme Döngüsü (Self-Healing Loop)
        while (needsHeal && attempt <= MAX_HEAL_ATTEMPTS) {
          // Kalite kontrol testi yapısı oluşturuluyor
          const tempRow = {
            ...row,
            ai_karar_ozeti: data.ai_karar_ozeti,
            ai_neden_onemli: data.ai_neden_onemli,
            ai_benzer_basvuruda_dikkat: data.ai_benzer_basvuruda_dikkat,
            ai_kural: data.ai_kural,
            ai_arama_onerileri: JSON.stringify(data.ai_arama_onerileri)
          };

          q = await kaliteKontrolYeni(tempRow);

          const ozetOk = q.ai_karar_ozeti_kalite === "geçti";
          const nedenOk = q.ai_neden_onemli_kalite === "geçti";
          const dikkatOk = q.ai_benzer_basvuruda_dikkat_kalite === "geçti";
          const kuralOk = q.ai_kural_kalite === "geçti";

          if (ozetOk && nedenOk && dikkatOk && kuralOk) {
            needsHeal = false;
            console.log(`👍 Kalite Testinden Doğrudan GEÇTİ.`);
          } else {
            attempt++;
            if (attempt <= MAX_HEAL_ATTEMPTS) {
              console.log(`⚠️ Kalite Sorunu Saptandı (Deneme: ${attempt}): ${q.not || "Detay yok"}`);
              console.log(`🔧 Kendini İyileştirme Çemberi (Self-Healing) devreye giriyor...`);
              
              data = await healAnalysis(row, data, q.not || "Hüküm uyumuna ve olay odaklılığa yüksek özen gösterilmeli.", emsalKurallar);
              sifaBulan++;
              await sleep(300);
            } else {
              console.log(`🚨 Düzeltme deneme limiti doldu. Mevcut kaliteyle kaydedilecek.`);
              needsHeal = false;
            }
          }
        }

        // 2. Aşama: Veritabanına Yazma
        const ai_karar_ozeti = data.ai_karar_ozeti;
        const ai_neden_onemli = data.ai_neden_onemli;
        const ai_benzer_basvuruda_dikkat = data.ai_benzer_basvuruda_dikkat;
        const ai_kural = data.ai_kural;
        const ai_arama_onerileri = data.ai_arama_onerileri;

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_karar_ozeti = $1,
            ai_neden_onemli = $2,
            ai_benzer_basvuruda_dikkat = $3,
            ai_kural = $4,
            ai_arama_onerileri = $5,

            ai_analiz_model = $6,
            ai_prompt_versiyon = $7,
            ai_analiz_at = NOW(),
            ai_analiz_durumu = 'ok',
            ai_analiz_hata = NULL,

            ai_karar_ozeti_kalite = $8,
            ai_neden_onemli_kalite = $9,
            ai_benzer_basvuruda_dikkat_kalite = $10,
            ai_kural_kalite = $11,
            ai_kalite_kontrol_model = $12,
            ai_kalite_kontrol_at = NOW(),
            ai_kalite_kontrol_notu = $13
          WHERE id = $14
          `,
          [
            ai_karar_ozeti,
            ai_neden_onemli,
            ai_benzer_basvuruda_dikkat,
            ai_kural,
            JSON.stringify(ai_arama_onerileri),
            MODEL,
            PROMPT_VERSION,
            q.ai_karar_ozeti_kalite || "kontrol_edilecek",
            q.ai_neden_onemli_kalite || "kontrol_edilecek",
            q.ai_benzer_basvuruda_dikkat_kalite || "kontrol_edilecek",
            q.ai_kural_kalite || "kontrol_edilecek",
            `${MODEL} / genel-ai-quality-v2`,
            String(q.not || "").slice(0, 2000),
            row.id,
          ]
        );

        console.log(`🎯 ${row.basvuru_no} Tamamlandı | Özet:${q.ai_karar_ozeti_kalite} Kural:${q.ai_kural_kalite}`);
        toplam++;

      } catch (err) {
        console.error(`❌ Kritik Hata (${row.basvuru_no}):`, err.message);

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

      await sleep(300);
    }

    console.log(`\n🎉 Batç tamamlandı! ${toplam} döküman başarılı şekilde dönüştürüldü.`);
    // Tüm kararlar için sürekli üretime geçmek için break kaldırıldı!
    await sleep(400);
  }

  await pool.end();
  console.log(`\n🏁 PIPELINE SONLANDI. Toplam Üretilen: ${toplam} | Şifa Bulan: ${sifaBulan}`);
}

main().catch(console.error);
