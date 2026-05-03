require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function run() {
    try {
        const res = await pool.query(`
  SELECT id, karar_adi, metin
  FROM kararlar
  WHERE cezaevi_mi = true
  LIMIT 5;
`);

        for (const row of res.rows) {
            const text = row.metin.slice(0, 3000); // token kontrol

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
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

Başvuru metni:
${text}
    `,
                    },
                ],
                temperature: 0,
            });

            console.log("------");
            console.log(row.karar_adi);
            console.log(response.choices[0].message.content);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();