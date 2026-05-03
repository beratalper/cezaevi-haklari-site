require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");
const OpenAI = require("openai");

const MODEL = "gpt-4o-mini";
const LIMIT = 2000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function parseResult(content) {
  const sonucMatch = content.match(/SONUC:\s*(EVET|HAYIR|SUPHELI|ŞÜPHELİ)/i);
  const gerekceMatch = content.match(/GEREKCE:\s*(.+)/is);

  const sonuc = sonucMatch
    ? sonucMatch[1].toUpperCase().replace("ŞÜPHELİ", "SUPHELI")
    : "SUPHELI";

  const gerekce = gerekceMatch ? gerekceMatch[1].trim() : content.trim();

  return { sonuc, gerekce };
}

async function classify(row) {
  const text = (row.metin || "").slice(0, 5000);

  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
Sen Anayasa Mahkemesi bireysel başvuru kararlarını sınıflandıran hukuk uzmanısın.

Görevin:
Bir kararın SADECE ceza infaz kurumu / cezaevi / tutukevi yaşamında meydana gelen hak ihlaliyle ilgili olup olmadığını belirlemek.

EVET de:
- olay ceza infaz kurumu, cezaevi, tutukevi, kampüs cezaevi içinde yaşanmışsa
- cezaevi idaresinin işlemiyle ilgiliyse
- hükümlü/tutuklunun cezaevindeki ziyaret, mektup, telefon, sağlık, disiplin, koğuş, avukat görüşü, çıplak arama, kötü muamele, sevk, nakil, oda/koğuş, yayın, kitap, dilekçe, infaz koşulları gibi konuları varsa

HAYIR de:
- sadece yakalama, gözaltı, kolluk müdahalesi, polis/jandarma kötü muamelesi varsa
- sadece tutuklamanın hukuki olup olmadığı tartışılıyorsa
- sadece ceza yargılaması, mahkûmiyet, adil yargılanma, ifade özgürlüğü, masumiyet karinesi, sınır dışı, idari gözetim varsa
- ceza veya infaz kelimesi geçse bile olay cezaevi yaşamına ait değilse

SUPHELI de:
- metin çok kısa ise
- cezaevi bağlantısı olabilir ama açık değilse

Sadece istenen formatta cevap ver.
        `,
      },
      {
        role: "user",
        content: `
Bu karar ceza infaz kurumunda/cezaevinde yaşanan hak ihlali kararı mı?

Format:
SONUC: EVET / HAYIR / SUPHELI
GEREKCE: 1 cümle

Karar adı:
${row.karar_adi}

Başvuru konusu:
${row.basvuru_konusu || ""}

Karar metni:
${text}
        `,
      },
    ],
  });

  return parseResult(response.choices[0].message.content || "");
}

async function run() {
  try {
    const res = await pool.query(`
      SELECT id, karar_adi, basvuru_no, basvuru_konusu, metin
      FROM kararlar
      WHERE cezaevi_mi = false
        AND ai_cezaevi_siniflandirma IS NULL
        AND (
          (
            metin ILIKE '%ceza infaz kurumu%'
            OR metin ILIKE '%cezaevi%'
            OR metin ILIKE '%infaz kurumu%'
          )
          AND (
            metin ILIKE '%ziyaret%'
            OR metin ILIKE '%mektup%'
            OR metin ILIKE '%telefon%'
            OR metin ILIKE '%görüş%'
            OR metin ILIKE '%koğuş%'
            OR metin ILIKE '%sağlık%'
            OR metin ILIKE '%disiplin%'
            OR metin ILIKE '%kötü muamele%'
            OR metin ILIKE '%işkence%'
          )
        )
      ORDER BY id ASC
      LIMIT $1;
    `, [LIMIT]);

    console.log(`${res.rows.length} kayıt işlenecek.`);

    for (const row of res.rows) {
      try {
        const result = await classify(row);

        await pool.query(
          `
          UPDATE kararlar
          SET
            ai_cezaevi_siniflandirma = $1,
            ai_cezaevi_gerekce = $2,
            ai_cezaevi_model = $3,
            ai_cezaevi_at = NOW()
          WHERE id = $4;
          `,
          [result.sonuc, result.gerekce, MODEL, row.id]
        );

        console.log("------");
        console.log(`${row.id} | ${row.karar_adi}`);
        console.log(`SONUC: ${result.sonuc}`);
        console.log(`GEREKCE: ${result.gerekce}`);
      } catch (err) {
        console.error(`Kayıt hatası ID ${row.id}:`, err.message);
      }
    }

    console.log("2000 kayıt test sınıflandırması tamamlandı.");
  } catch (err) {
    console.error("GENEL HATA:", err);
  } finally {
    await pool.end();
  }
}

run();