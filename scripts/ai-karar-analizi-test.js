require("dotenv").config({ path: ".env.local" });

const OpenAI = require("openai");
const Database = require("better-sqlite3");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// DB dosya yolunu kendi projendeki dosya adına göre gerekirse değiştir
const db = new Database("C:/Projects/cezaevi-haklari-site/db/aym_kararlar.db");

const MODEL = "gpt-4.1-mini";
const PROMPT_VERSION = "v5-ultra-net-2026-05-01";

function temizMetinAl(metin = "") {
    const lower = metin.toLocaleLowerCase("tr-TR");

    const basvuruKonusuIndex = lower.indexOf("başvuru konusu");
    const ozetIndex = metin.indexOf("I. BAŞVURUNUN ÖZETİ");

    let start = 0;

    if (basvuruKonusuIndex !== -1) {
        start = basvuruKonusuIndex;
    } else if (ozetIndex !== -1) {
        start = ozetIndex;
    }

    // Çok uzun kararlar için güvenli kırpma
    return metin.slice(start, start + 30000);
}

function jsonAyikla(text) {
    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
}

async function analizUret(karar) {
    const temizMetin = temizMetinAl(karar.metin);

    const prompt = `
Aşağıdaki Anayasa Mahkemesi bireysel başvuru kararını incele.

Amaç:
Bu kararı hukukçu olmayan bir kişinin gerçekten anlayabileceği şekilde açıklamak.

YAZIM TARZI:
- Kısa cümleler kullan.
- Gereksiz resmî ifadelerden kaçın.
- "başvurucu ileri sürmüştür" gibi kalıpları azalt.
- Doğrudan anlat.
- Tekrar yapma.
- Her cümle yeni bir bilgi versin.

YASAKLAR:
- Genel geçer cümle yazma ("önemlidir", "dikkat edilmelidir" gibi boş ifadeler tek başına kullanılamaz)
- Aynı şeyi farklı cümleyle tekrar etme
- Hukuki jargon kullanma (zorunluysa sadeleştir)
- Tahmin yapma / uydurma

---

1. ai_basvuru_konusu:
- Bu kişi ne yaşamış? Somut anlat.
- Hangi haklar etkilenmiş?
- Cezaevi / tutukluluk bağlamını açık yaz.
- 3-4 cümle

---

2. ai_karar_ozeti:
- Olay → iddia → Mahkeme ne dedi → sonuç
- Sonucu NET yaz: ihlal VAR / YOK / kabul edilemez / süre aşımı
- Gereksiz detay verme
- 4-6 cümle

---

3. ai_neden_onemli:
- Bu karar neden gerçekten önemli?
- İnsan bunu neden okumalı?
- Neyi gösteriyor?
- "Bu karar şunu netleştiriyor:" diye başlayabilirsin
- 2-4 cümle (kısa ve vurucu)

---

4. ai_benzer_basvuruda_dikkat:
- Pratik öneri ver
- Somut yaz:
  - "önce şuraya başvur"
  - "şu belgeyi ekle"
  - "şu hatayı yapma"
- Madde gibi yazabilirsin ama düz metin olsun
- 4-5 cümle

EK KURALLAR:

- Aynı kalıpla başlama (her "Bu karar şunu netleştiriyor" kullanma)
- Gerekirse doğrudan başla

- "ai_neden_onemli" alanında:
  Kullanıcıya doğrudan etkiyi yaz:
  - "Bu karara göre..."
  - "Bu durumda..."
  - "Şunu yapmazsan başvurun reddedilir"

- "ai_benzer_basvuruda_dikkat" alanında:
  Daha net ve uyarıcı ol:
  - "Şunu yapmadan başvuru yapma"
  - "Aksi halde başvurun reddedilir"
  - "Mutlaka şu belgeyi ekle"

- Cümleleri mümkün olduğunca kısa tut
- Gereksiz açıklamayı kes

EKSTRA KURALLAR (ÇOK ÖNEMLİ):

- "ai_neden_onemli" alanında:
  Açıklama yapma, SONUÇ yaz:
  - "Süreyi kaçırırsan dosyan incelenmez."
  - "Bu adımı atlamadan başvuru yapamazsın."
  - "Bu durumda ihlal kararı çıkmaz."

- Aynı anlamı tekrar eden cümle yazma
  ("reddedilir" ve "kabul edilmez" birlikte kullanma)

- "ai_benzer_basvuruda_dikkat" alanında:
  Her cümle emir gibi olsun:
  - "Şunu yap"
  - "Şunu yapmadan başvuru yapma"

- Gereksiz açıklama yapma
- Maksimum netlik
---

Sadece JSON döndür.

JSON:
{
  "ai_basvuru_konusu": "...",
  "ai_karar_ozeti": "...",
  "ai_neden_onemli": "...",
  "ai_benzer_basvuruda_dikkat": "..."
}

Karar:
${temizMetin}
`;

    const response = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.2,
        messages: [
            {
                role: "system",
                content:
                    "Sen Anayasa Mahkemesi bireysel başvuru kararlarını sade, doğru ve yapılandırılmış şekilde özetleyen bir hukuk asistanısın.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    return jsonAyikla(response.choices[0].message.content);
}

async function main() {
    const kararlar = db
        .prepare(
            `
    SELECT id, basvuru_no, karar_tarihi, metin
    FROM kararlar
    WHERE cezaevi_mi = 1
      AND metin IS NOT NULL
      AND (
        ai_prompt_versiyon IS NULL
        OR ai_prompt_versiyon != 'v5-ultra-net-2026-05-01'
      )
    ORDER BY karar_tarihi DESC
    LIMIT 200
    `
        )
        .all();

    console.log(`İşlenecek karar sayısı: ${kararlar.length}`);

    const updateOk = db.prepare(`
    UPDATE kararlar
    SET
      ai_basvuru_konusu = @ai_basvuru_konusu,
      ai_karar_ozeti = @ai_karar_ozeti,
      ai_neden_onemli = @ai_neden_onemli,
      ai_benzer_basvuruda_dikkat = @ai_benzer_basvuruda_dikkat,
      ai_analiz_model = @ai_analiz_model,
      ai_prompt_versiyon = @ai_prompt_versiyon,
      ai_analiz_at = datetime('now'),
      ai_analiz_durumu = 'tamamlandi',
      ai_analiz_hata = NULL
    WHERE id = @id
  `);

    const updateError = db.prepare(`
    UPDATE kararlar
    SET
      ai_analiz_durumu = 'hata',
      ai_analiz_hata = @hata,
      ai_analiz_at = datetime('now')
    WHERE id = @id
  `);

    for (const karar of kararlar) {
        console.log(`İşleniyor: ${karar.basvuru_no}`);

        try {
            const analiz = await analizUret(karar);

            updateOk.run({
                id: karar.id,
                ai_basvuru_konusu: analiz.ai_basvuru_konusu || "",
                ai_karar_ozeti: analiz.ai_karar_ozeti || "",
                ai_neden_onemli: analiz.ai_neden_onemli || "",
                ai_benzer_basvuruda_dikkat:
                    analiz.ai_benzer_basvuruda_dikkat || "",
                ai_analiz_model: MODEL,
                ai_prompt_versiyon: PROMPT_VERSION,
            });

            console.log(`Tamamlandı: ${karar.basvuru_no}`);
        } catch (error) {
            console.error(`Hata: ${karar.basvuru_no}`, error.message);

            updateError.run({
                id: karar.id,
                hata: error.message.slice(0, 1000),
            });
        }
    }

    console.log("Test işlem tamamlandı.");
}

main();