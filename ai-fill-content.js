require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");
const OpenAI = require("openai");

const MODEL = "gpt-4o-mini";
const LIMIT = 20;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function parse(content) {
    const get = (label) => {
        const match = content.match(new RegExp(label + ":(.*)", "i"));
        return match ? match[1].trim() : "";
    };

    return {
        konu: get("KONU"),
        ozet: get("OZET"),
        neden: get("ONEM"),
        dikkat: get("DIKKAT"),
    };
}

async function run() {
    try {
        const res = await pool.query(`
      SELECT id, karar_adi, metin
      FROM kararlar
      WHERE cezaevi_mi = true
  AND (
    ai_karar_ozeti IS NULL
    OR ai_karar_ozeti = ''
  )
      LIMIT $1;
    `, [LIMIT]);

        console.log(`${res.rows.length} kayıt işlenecek`);

        for (const row of res.rows) {
            const text = (row.metin || "").slice(0, 5000);

            const response = await openai.chat.completions.create({
                model: MODEL,
                temperature: 0.3,
                messages: [
                    {
                        role: "system",
                        content: `
Sen hukukçu gibi değil, vatandaşın anlayacağı şekilde yazan bir uzmansın.

Kısa, net ve sade yaz.
Abartı yok.
Teknik jargon minimum.
            `,
                    },
                    {
                        role: "user",
                        content: `
Bu AYM kararını analiz et.

Format:
KONU: ...
OZET: ...
ONEM: ...
DIKKAT: ...

Kurallar:
- Her alan max 2-3 cümle
- Basit Türkçe
- Cezaevi bağlamını vurgula

Karar:
${text}
            `,
                    },
                ],
            });

            const parsed = parse(response.choices[0].message.content);

            await pool.query(`
        UPDATE kararlar
        SET
          ai_basvuru_konusu = $1,
          ai_karar_ozeti = $2,
          ai_neden_onemli = $3,
          ai_benzer_basvuruda_dikkat = $4,
          ai_analiz_model = $5,
          ai_analiz_at = NOW()
        WHERE id = $6;
      `, [
                parsed.konu,
                parsed.ozet,
                parsed.neden,
                parsed.dikkat,
                MODEL,
                row.id
            ]);

            console.log("✔", row.karar_adi);
        }

        console.log("Tamamlandı");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();