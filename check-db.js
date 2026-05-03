require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const res = await pool.query(`
    SELECT id, basvuru_no, karar_adi
    FROM kararlar
    WHERE karar_adi ~ '[a-zçğıöşü]'
    ORDER BY id ASC
    LIMIT 100;
  `);

  console.table(res.rows);
  await pool.end();
}

run();