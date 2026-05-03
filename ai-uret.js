require("dotenv").config();
const { Pool } = require("pg");
const OpenAI = require("openai");

const MODEL = "gpt-4.1-mini";
const BATCH_LIMIT = 50;
const PROMPT_VERSION = "cezaevi-ai-v2-hukum-oncelikli";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const EXTRACT_PROMPT = `
Sen bir hukuk veri çıkarım uzmanısın.

Görevin:
Aşağıdaki Anayasa Mahkemesi karar metninden SADECE açıkça yazan bilgileri çıkarmak.

KESİN KURALLAR:
- Yorum yapma.
- Tahmin yapma.
- Eksik bilgiyi tamamlama.
- Metinde yoksa yazma.
- Emin değilsen "belirtilmemiş" yaz.
- Tazminat miktarı, para cezası, gün sayısı, süre gibi sayısal değerleri yalnızca karar metninde açıkça yazıyorsa kullan.

HÜKÜM ÖNCELİK KURALI:
- Kararın sonucu belirlenirken öncelikle "HÜKÜM" bölümü esas alınmalıdır.
- HÜKÜM ile diğer alanlar çelişirse HÜKÜM doğrudur.
- HÜKÜM bölümünde birden fazla bent varsa her bendi ayrı değerlendir.
- Sonucu tekleştirme.
- "KABUL EDİLEMEZ", "İHLAL", "REDDİNE", "DÜŞME", "İNCELENMESİNE YER OLMADIĞI" ifadelerini aynen dikkate al.

BİRLEŞTİRİLMİŞ / ÇOK BAŞVURUCULU DOSYA KURALI:
- Karar birden fazla başvurucu veya birleştirilmiş dosya içeriyorsa sonucu tek cümleyle genelleme.
- Başvurucu gruplarına göre sonucu ayrı yaz.
- "Bazı başvurucular yönünden..." ve "diğer başvurucular yönünden..." ayrımını koru.
- Kabul edilemez bulunan başvurucular ile ihlal verilen başvurucuları karıştırma.
- Tazminat veya yeniden yargılama kararı sadece hangi başvurucular için verilmişse o şekilde yaz.

ÇOK HAK İDDİASI KURALI:
- Başvuruda birden fazla hak ihlali iddiası varsa her hak yönünden sonucu ayrı ayrı belirle.
- Örnek: haberleşme hürriyeti → ihlal; adil yargılanma hakkı → kabul edilemez.
- Eğer ayrım net değilse "kısmen ihlal / kısmen kabul edilemez" gibi belirt.

TEDBİR / ARA KARAR KURALI:
- Tedbir, ara karar veya geçici kararları nihai sonuç gibi yazma.
- Tedbir kararları varsa idari_yargisal_surec alanına yaz.
- aym_sonucu alanına sadece nihai sonucu yaz.

ÇIKTI SADECE JSON OLACAK:

{
  "basvurucunun_iddiasi": "",
  "idari_yargisal_surec": "",
  "aym_gerekcesi": "",
  "aym_sonucu": "",
  "riskli_belirsiz_noktalar": ""
}
`;

const WRITE_PROMPT = `
Sen sade anlatım konusunda uzman bir hukuk yazarı­sın.

Sana verilen veri yapısına SADIK KALARAK yaz.

ASLA:
- yeni bilgi ekleme
- tahmin yapma
- veri dışına çıkma
- HÜKÜM dışında yorum yaparak sonuç üretme

JSON formatında yaz:

{
  "ai_basvuru_konusu": "...",
  "ai_karar_ozeti": "...",
  "ai_neden_onemli": "...",
  "ai_benzer_basvuruda_dikkat": "..."
}

BAŞVURU KONUSU:
- Kısa ve net yaz.
- Son cümle mutlaka şöyle bitsin:
"Anayasa Mahkemesine bireysel başvuruda bulunmuştur."

KARAR ÖZETİ:
- Olay + süreç + AYM değerlendirmesi + sonuç şeklinde yaz.
- Nihai sonucu mutlaka HÜKÜM / extracted.aym_sonucu verisine göre yaz.
- Tedbir varsa ayrı belirt, nihai sonuç gibi yazma.

ÇOK BAŞVURUCULU DOSYA YAZIM KURALI:
- Başvurucu gruplarına göre farklı sonuçlar varsa bunu açıkça yaz.
- Örnek: "Bazı başvurucular yönünden başvuru yolları tüketilmediği için kabul edilemez; diğer başvurucular yönünden ise ihlal kararı verilmiştir."
- Tazminat ve yeniden yargılama kararını herkes için verilmiş gibi yazma.

ÇOK HAKLI KARAR YAZIM KURALI:
- Birden fazla hak varsa sonucu tekleştirme.
- Her hak için sonucu açıkça belirt.
- "Tüm haklar ihlal edilmiştir" gibi genelleyici ifadelerden kaçın.
- Hangi hak ihlal edilmişse onu açıkça yaz.

SONUÇLA UYUM KURALI:
- Karar kabul edilemez ise "Bu karar hak ihlali olduğunu gösterir" gibi yazma.
- Kabul edilemez kararlarda dersi şu şekilde kur:
"Bu karar, başvurunun kabul edilebilmesi için somut, güncel ve ciddi bir mağduriyetin gösterilmesi gerektiğini gösterir."
- İhlal kararlarında ihlalin nedenini açıkla.
- Düşme kararlarında güncel inceleme nedeni kalmadığını açıkla.
- Neden önemli bölümü mutlaka sonuçla uyumlu olmalı.

BENZER BAŞVURULARDA DİKKAT:
- Yol gösterici yaz.
- Somut öneriler ver.
- Süre, delil, başvuru yolları, somut mağduriyet gibi noktaları kararın sonucuna göre vurgula.

KARMA KARAR NETLİK KURALI:

- Eğer bazı iddialar kabul edilemez, bazıları ihlal ise:
  → bunu açıkça belirt:

"Başvurunun bir kısmı kabul edilemez bulunmuş, bir kısmı ise ihlal olarak değerlendirilmiştir."

- "Bu karar hak ihlali olduğunu gösterir" gibi genelleme yapma.

- Karma karar varsa, ilk 2 cümlede bunu belirt.

GENEL SONUÇ GÜVENİLMEZLİK KURALI:

- "Genel Sonuç" alanı ile HÜKÜM çelişiyorsa:
  → HÜKÜM doğrudur

- "Genel Sonuç = KABUL EDİLEMEZ" olsa bile:
  → HÜKÜM'de ihlal varsa bunu yaz

- Sonucu sadece HÜKÜM'e göre anlat

KRİTİK:
- Sayısal değerleri aynen koru.
- Emin değilsen yazma.
- Vatandaşın anlayacağı sade dil kullan.
`;

function buildInput(row) {
  const tamMetin = row.metin || "";
  const basMetin = tamMetin.slice(0, 14000);
  const sonMetin = tamMetin.slice(-8000);

  return `
Başvuru No: ${row.basvuru_no}
Başvuru Konusu: ${row.basvuru_konusu || ""}
Genel Sonuç: ${row.sonuc || ""}
Hak / Müdahale İddiası: ${row.mudahale_iddiasi_aym || ""}
AYM Sonucu: ${row.sonuc_aym || ""}

Karar Metni Başlangıcı:
${basMetin}

--- KARAR METNİNİN SON KISMI / HÜKÜM BÖLÜMÜ ---
${sonMetin}
`;
}

async function markError(client, rowId, errorMessage) {
  await client.query(
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
      String(errorMessage || "").slice(0, 2000),
      MODEL,
      PROMPT_VERSION,
      rowId,
    ]
  );
}

async function run() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT
        id,
        basvuru_no,
        karar_adi,
        karar_tarihi,
        sonuc,
        basvuru_konusu,
        mudahale_iddiasi_aym,
        sonuc_aym,
        metin
      FROM kararlar
      WHERE cezaevi_mi = true
        AND metin IS NOT NULL
        AND metin <> ''
        AND (
          ai_analiz_durumu IS NULL
          OR ai_analiz_durumu <> 'ok'
        )
      ORDER BY id
      LIMIT ${BATCH_LIMIT}
    `);

    console.log("Batch için seçilen kayıt sayısı:", result.rows.length);

    if (result.rows.length === 0) {
      console.log("İşlenecek cezaevi kararı kalmadı.");
      return;
    }

    for (const row of result.rows) {
      console.log("İşleniyor:", row.basvuru_no);

      try {
        const input = buildInput(row);

        const extractRes = await openai.chat.completions.create({
          model: MODEL,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: EXTRACT_PROMPT },
            { role: "user", content: input },
          ],
        });

        let extracted;
        try {
          extracted = JSON.parse(extractRes.choices[0].message.content);
        } catch {
          throw new Error(`Extract parse hatası`);
        }

        const writeRes = await openai.chat.completions.create({
          model: MODEL,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: WRITE_PROMPT },
            {
              role: "user",
              content: JSON.stringify({
                extracted,
                basvuru_konusu: row.basvuru_konusu,
                genel_sonuc: row.sonuc,
                sonuc: row.sonuc_aym,
              }),
            },
          ],
        });

        let parsed;
        try {
          parsed = JSON.parse(writeRes.choices[0].message.content);
        } catch {
          throw new Error(`Write parse hatası`);
        }

        if (
          !parsed.ai_basvuru_konusu ||
          !parsed.ai_karar_ozeti ||
          !parsed.ai_neden_onemli ||
          !parsed.ai_benzer_basvuruda_dikkat
        ) {
          throw new Error("Eksik AI çıktısı");
        }

        await client.query(
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

        console.log("✔ Kaydedildi:", row.basvuru_no);
      } catch (err) {
        console.error("✖ Hata:", row.basvuru_no, err.message);
        await markError(client, row.id, err.message);
        throw err;
      }
    }
  } catch (err) {
    console.error("Batch durduruldu:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();