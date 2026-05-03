require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");
const OpenAI = require("openai");

const MODEL = "gpt-4o-mini";
const LIMIT = 2000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const KATEGORILER = [
  "Sağlık ve tedavi",
  "Kötü muamele / işkence",
  "Yaşam hakkı / ölüm / intihar",
  "Disiplin cezaları",
  "Ziyaret ve aile hayatı",
  "Telefon, mektup ve haberleşme",
  "Avukat görüşü ve savunma",
  "Yayın, kitap, ifade özgürlüğü",
  "Nakil, sevk, infaz koşulları",
  "Tahliye, infaz hesabı, koşullu salıverilme",
  "Arama, mahremiyet ve özel hayat",
  "Diğer cezaevi hakları",
];

function parse(content) {
  const match = content.match(/KATEGORI:\s*(.+)/i);
  const kategori = match ? match[1].trim() : "Diğer cezaevi hakları";

  if (KATEGORILER.includes(kategori)) return kategori;

  return "Diğer cezaevi hakları";
}

async function run() {
  try {
    const res = await pool.query(
      `
      SELECT
        id,
        karar_adi,
        ai_basvuru_konusu,
        ai_karar_ozeti,
        ai_neden_onemli,
        ai_benzer_basvuruda_dikkat
      FROM kararlar
      WHERE cezaevi_mi = true
        AND ust_kategori IS NULL
      ORDER BY id ASC
      LIMIT $1;
      `,
      [LIMIT]
    );

    console.log(`${res.rows.length} kayıt kategorilendirilecek.`);

    for (const row of res.rows) {
      const response = await openai.chat.completions.create({
        model: MODEL,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `
Sen AYM cezaevi hak ihlali kararlarını sınıflandıran hukuk asistanısın.

Aşağıdaki kategorilerden sadece birini seç:

- Sağlık ve tedavi
- Kötü muamele / işkence
- Yaşam hakkı / ölüm / intihar
- Disiplin cezaları
- Ziyaret ve aile hayatı
- Telefon, mektup ve haberleşme
- Avukat görüşü ve savunma
- Yayın, kitap, ifade özgürlüğü
- Nakil, sevk, infaz koşulları
- Tahliye, infaz hesabı, koşullu salıverilme
- Arama, mahremiyet ve özel hayat
- Diğer cezaevi hakları

Sadece şu formatta cevap ver:
KATEGORI: ...
            `,
          },
          {
            role: "user",
            content: `
Karar adı:
${row.karar_adi}

Başvuru konusu:
${row.ai_basvuru_konusu || ""}

Karar özeti:
${row.ai_karar_ozeti || ""}

Neden önemli:
${row.ai_neden_onemli || ""}

Benzer başvuruda dikkat:
${row.ai_benzer_basvuruda_dikkat || ""}
            `,
          },
        ],
      });

      const raw = response.choices[0].message.content || "";
      const kategori = parse(raw);

      await pool.query(
        `
        UPDATE kararlar
        SET
          ust_kategori = $1,
          alt_kategori = $1
        WHERE id = $2;
        `,
        [kategori, row.id]
      );

      console.log("------");
      console.log(`${row.id} | ${row.karar_adi}`);
      console.log(`KATEGORI: ${kategori}`);
    }

    console.log("Test kategorilendirme tamamlandı.");
  } catch (err) {
    console.error("HATA:", err);
  } finally {
    await pool.end();
  }
}

run();