require("dotenv").config();

const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {

  const raw =
    fs.readFileSync(
      "basvurular.json",
      "utf8"
    );

  const basvurular =
    JSON.parse(raw);

  console.log(
    "Toplam:",
    basvurular.length
  );

  for (const no of basvurular) {

    await pool.query(
      `
      INSERT INTO cezaevi_basvurulari
      (basvuru_no)

      VALUES ($1)

      ON CONFLICT DO NOTHING
      `,
      [no]
    );

    console.log(
      "Eklendi:",
      no
    );
  }

  console.log("Tamamlandı.");

  process.exit(0);
}

run();