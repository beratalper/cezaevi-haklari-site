const { Pool } = require("pg");
const natural = require("natural");
const sw = require("stopword");
const fs = require("fs");

const tokenizer = new natural.WordTokenizer();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const blacklist = [
  "başvuru",
  "başvurucu",
  "iddia",
  "ilişkin",
  "nedeniyle",
  "karar",
  "özgürlük",
  "hakkı",
  "hak",
  "mahkeme",
  "ihlali",
  "edildiği",
  "olduğu",
  "kurumu",
  "ceza",
  "infaz",
  "kurumunda",
  "olarak",
  "bulunan",
  "talep",
  "reddedilmesi",
];

async function run() {

  const result = await pool.query(`
    SELECT basvuru_konusu
    FROM kararlar
    WHERE cezaevi_mi = true
      AND basvuru_konusu IS NOT NULL
  `);

  const freq = {};

  for (const row of result.rows) {

    const text = row.basvuru_konusu
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ");

    let words = tokenizer.tokenize(text);

    words = sw.removeStopwords(words, sw.tr);

    words = words.filter(
      (w) =>
        w.length > 2 &&
        !blacklist.includes(w)
    );

    for (let i = 0; i < words.length - 1; i++) {

      const phrase =
        words[i] + " " + words[i + 1];

      freq[phrase] = (freq[phrase] || 0) + 1;
    }
  }

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 500);

  fs.writeFileSync(
    "./etiket-adaylari.json",
    JSON.stringify(sorted, null, 2)
  );

  console.log("Tamamlandı.");
  console.log("etiket-adaylari.json oluşturuldu.");

  await pool.end();
}

run();