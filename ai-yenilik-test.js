import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import pkg from "pg";

const { Pool } = pkg;

const MODEL = "gpt-4.1-mini"; // Projede kullanılan varsayılan model

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

const KARAR_ANALIZ_PROMPT = `
Sen Anayasa Mahkemesi (AYM) kararlarını en yüksek standarda göre inceleyen kıdemli bir anayasa hukuku raportörü, içtihat uzmanı ve sadeleştirme editörüsün.

GÖREVİN:
Sana verilen AYM kararını analiz etmeli ve vatandaşların ile hukukçuların kararı en hızlı ve hukuken en doğru şekilde anlamasını sağlayacak 4 temel alanı içeren bir JSON objesi üretmelisin.

BU DÖRT TEMEL ALAN VE KURALLAR:

1. ai_karar_ozeti:
   - Kararın hüküm tabanlı süzülmüş özetidir.
   - SADECE 3 ila 5 cümle olmalıdır.
   - EN KRİTİK KURAL: Nihai sonuç SADECE HÜKÜM bölümünden çıkarılır. Hukuken doğruluğunun teyit edilebilmesi için HÜKÜM ile kararın diğer kısımları çelişirse daima HÜKÜM esas alınır.
   - ZORUNLU İLK CÜMLE KALIPLARI:
     * Sadece ihlal varsa: "Başvurunun ... yönünden ihlal edildiğine karar verilmiştir."
     * Sadece kabul edilemezlik varsa: "Başvurunun ... yönünden kabul edilemez olduğuna karar verilmiştir."
     * Sadece ihlal olmadığı kararı varsa: "Başvurunun ... yönünden ihlal olmadığına karar verilmiştir."
     * Düşme varsa: "Başvurunun düşmesine karar verilmiştir."
     * Karma karar (örn: bir kısmı kabul edilemez, bir kısmı ihlal): "Başvurunun bir kısmında ..., bir kısmında ... kararı verilmiştir."
   - YASAKLAR: Hükümde geçmeyen hiçbir hak ihlali, tazminat veya kişi bilgisini buraya ekleme. Kabul edilemezi ihlal gibi, ihlal olmayanı kabul edilemez gibi anlatma.

2. ai_neden_onemli:
   - Bu kararın emsal ve hukuki neden önemli olduğunu açıklayan 2 ila 4 kısa cümle.
   - "Bu karar şunu gösterir..." formatında başlayabilir.
   - Soyut hukuk terimlerini açıklamadan kullanma (örneğin "silahların eşitliği", "çelişmeli yargılama" gibi kavramları vatandaşın anlayacağı şekilde açıkla).
   - "ai_karar_ozeti" alanındaki cümlelerin tıpatıp kopyası veya tekrarı olmamalıdır. Emsal değerini vurgulamalıdır.

3. ai_benzer_basvuruda_dikkat:
   - Benzer bir hak ihlaliyle karşılaşan vatandaşlar ve hukukçular için pratik, net ve yapıcı bir kılavuz.
   - 3 ila 6 kısa cümle.
   - Pratik ve somut tavsiyeler içermelidir (Örn: Hangi belgeler eklenmeli, hangi süre limitlerine dikkat edilmeli, hangi başvuru yolları tüketilmeli). 
   - "Somut delil" derken örneklendir (kamera kaydı, doktor raporu, disiplin kurulu kararı, tebliğ evrakı vb.).
   - Asla "Kesin ihlal kararı alınır" gibi garantiler verme.

4. ictihat_kurali (En Önemlisi - 1 Cümlelik Kural):
   - kural_adi: Karardan süzülen 2-6 kelimelik çok kısa kural başlığı (Örn: "Soyut gerekçe yeterli değildir", "Risk somutlaştırılmalıdır", "Süre tebliğle başlar").
   - kural_metni: Gelecekteki benzer tüm olaylara uyarlanabilecek, karardaki özel isimlerden, tarih ve dava numaralarından arındırılmış, hukuki ilke koyan tam 1 cümlelik genel kural metni. (Örn: "Kararın sakıncalı olduğu iddia edilen kısımlarının somut gerekçeleri ve yarattığı kamu düzeni riski açıkça ortaya konulmalıdır.")
   - kategori: Kararın doğrudan ilgili olduğu genel hukuk kategorisi (Örn: "Adil Yargılanma Hakkı", "Mülkiyet Hakkı", "Kişi Hürriyeti ve Güvenliği", "İfade Özgürlüğü", "Özel Hayata Saygı Hakkı" vb.)
   - alt_kategori: Bu kategorinin altındaki spesifik konu başlığı (Örn: "Makul sürede yargılanma", "Kamulaştırma bedeli", "Haberleşme hürriyeti", "Gerekçeli karar hakkı" vb.)

SADECE JSON FORMATINDA ÇIKTI ÜRET, JSON dışında hiçbir şey yazma:
{
  "ai_karar_ozeti": "...",
  "ai_neden_onemli": "...",
  "ai_benzer_basvuruda_dikkat": "...",
  "ictihat_kurali": {
    "kural_adi": "...",
    "kural_metni": "...",
    "kategori": "...",
    "alt_kategori": "..."
  }
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

--- KARAR METNİ BAŞLANGICI ---
${basMetin}

--- HÜKÜM / KARAR METNİNİN SON KISMI ---
${hukum}
`;
}

async function startTest() {
  console.log("🚦 YENİ PROMPT VE İÇERİK YAPISI TESTİ BAŞLIYOR\n");

  try {
    // Cezaevi dışı kararlardan 2 farklı örnek seçelim (Farklı kategoriler olması için sonuca göre)
    const selectQuery = `
      SELECT id, basvuru_no, karar_adi, sonuc, sonuc_aym, basvuru_konusu, metin
      FROM kararlar
      WHERE (cezaevi_mi = false OR cezaevi_mi IS NULL)
        AND metin IS NOT NULL
        AND metin <> ''
      ORDER BY RANDOM()
      LIMIT 2;
    `;

    const res = await pool.query(selectQuery);
    const rows = res.rows;

    if (rows.length === 0) {
      console.log("⚠️ Test için hiç cezaevi dışı karar bulunamadı!");
      await pool.end();
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`----------------------------------------`);
      console.log(`📝 TEST ÖRNEĞİ ${i + 1}:`);
      console.log(`ID: ${row.id}`);
      console.log(`Başvuru No: ${row.basvuru_no}`);
      console.log(`Karar Adı: ${row.karar_adi}`);
      console.log(`Sonuç: ${row.sonuc}`);
      console.log(`AYM Sonucu: ${row.sonuc_aym}`);
      console.log(`Konu: ${row.basvuru_konusu}`);
      console.log(`----------------------------------------`);
      console.log("⏳ AI analizi yapılıyor...");

      const response = await openai.chat.completions.create({
        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: KARAR_ANALIZ_PROMPT },
          { role: "user", content: buildInput(row) },
        ],
      });

      const rawResult = response.choices[0].message.content;
      const parsed = JSON.parse(cleanJsonText(rawResult));

      console.log("\n✨ AI ANALİZ ÇIKTISI:");
      console.log(JSON.stringify(parsed, null, 2));
      console.log(`----------------------------------------\n`);
    }

  } catch (error) {
    console.error("❌ Test sırasında bir hata oluştu:", error);
  } finally {
    await pool.end();
    console.log("🏁 Test tamamlandı.");
  }
}

startTest();
