require("dotenv").config({
  path: ".env",
});

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const etiketler = [

  {
    ad: "çıplak arama",
    terms: ["çıplak arama"],
  },

  {
    ad: "disiplin cezası",
    terms: [
      "disiplin cezası",
      "disiplin kurulu",
      "cezalandırılması",
      "disiplin",
    ],
  },

  {
    ad: "telefon görüşmesi",
    terms: [
      "telefon görüş",
      "telefonla görüş",
      "telefon hakkı",
      "telefonla konuş",
    ],
  },

  {
    ad: "sakıncalı mektup",
    terms: [
      "sakıncalı mektup",
      "sakıncalı bulunarak",
      "mektuba el konulması",
      "sakıncalı",
    ],
  },

  {
    ad: "mektup",
    terms: [
      "mektup",
      "mektuba",
      "mektubun",
    ],
  },

  {
    ad: "ziyaret hakkı",
    terms: [
      "ziyaret",
      "kapalı görüş",
      "açık görüş",
    ],
  },

  {
    ad: "avukat görüşü",
    terms: [
      "avukat",
      "müdafi",
      "savunma hakkı",
    ],
  },

  {
    ad: "kitap yasağı",
    terms: [
      "kitap",
      "yayın",
      "basılı eser",
    ],
  },

  {
    ad: "süreli yayın",
    terms: [
      "süreli yayın",
      "gazete",
      "dergi",
    ],
  },

  {
    ad: "tek kişilik oda",
    terms: [
      "tek kişilik oda",
      "tek kişilik",
    ],
  },

  {
    ad: "kalabalık oda",
    terms: [
      "kalabalık oda",
      "kalabalık koğuş",
      "aşırı kalabalık",
    ],
  },

  {
    ad: "havalandırma",
    terms: [
      "havalandırma",
    ],
  },

  {
    ad: "ring aracı",
    terms: [
      "ring aracı",
      "nakil aracı",
      "ring",
    ],
  },

  {
    ad: "nakil",
    terms: [
      "nakil",
      "sevk",
    ],
  },

  {
    ad: "sağlık hizmeti",
    terms: [
      "sağlık",
      "tedavi",
      "hastane",
      "doktor",
      "revir",
    ],
  },

  {
    ad: "hastane sevki",
    terms: [
      "hastane sevki",
      "hastaneye sevk",
    ],
  },

  {
    ad: "revir",
    terms: [
      "revir",
    ],
  },

  {
    ad: "açlık grevi",
    terms: [
      "açlık grevi",
      "ölüm orucu",
    ],
  },

  {
    ad: "koşullu salıverme",
    terms: [
      "koşullu salıverme",
      "şartlı tahliye",
    ],
  },

  {
    ad: "denetimli serbestlik",
    terms: [
      "denetimli serbestlik",
    ],
  },

  {
    ad: "kamera kaydı",
    terms: [
      "kamera",
      "görüntü kaydı",
    ],
  },

  {
    ad: "ses kaydı",
    terms: [
      "ses kaydı",
      "kayda alınması",
      "dinlenmesi",
    ],
  },

  {
    ad: "posta",
    terms: [
      "posta",
      "kargo",
    ],
  },

  {
    ad: "telefon yasağı",
    terms: [
      "telefon yasağı",
      "telefon hakkının kısıtlanması",
    ],
  },

  {
    ad: "covid tedbirleri",
    terms: [
      "covid",
      "koronavirüs",
      "pandemi",
      "salgın",
    ],
  },
];

async function run() {

  console.log("Başladı...");

  const kararlar = await pool.query(`
    SELECT
      id,
      basvuru_konusu
    FROM kararlar
    WHERE cezaevi_mi = true
      AND basvuru_konusu IS NOT NULL
  `);

  const etiketRes = await pool.query(`
    SELECT
      id,
      ad
    FROM etiketler
  `);

  const etiketMap = {};

  for (const e of etiketRes.rows) {
    etiketMap[e.ad] = e.id;
  }

  let toplam = 0;

  for (const karar of kararlar.rows) {

    const text =
      karar.basvuru_konusu.toLowerCase();

    for (const etiket of etiketler) {

      const matched = etiket.terms.some(
        (term) => text.includes(term)
      );

      if (!matched) continue;

      const etiketId =
        etiketMap[etiket.ad];

      if (!etiketId) continue;

      await pool.query(
        `
        INSERT INTO karar_etiketleri
        (karar_id, etiket_id)

        VALUES ($1, $2)

        ON CONFLICT DO NOTHING
        `,
        [karar.id, etiketId]
      );

      toplam++;
    }
  }

  console.log("Tamamlandı.");
  console.log("Eklenen ilişki:", toplam);

  await pool.end();
}

run();