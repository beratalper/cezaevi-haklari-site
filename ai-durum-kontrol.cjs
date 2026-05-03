require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const r = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE cezaevi_mi = true) AS cezaevi_toplam,
      COUNT(*) FILTER (WHERE cezaevi_mi = true AND ai_analiz_durumu = 'ok') AS ai_ok,
      COUNT(*) FILTER (
        WHERE cezaevi_mi = true 
        AND (ai_analiz_durumu IS NULL OR ai_analiz_durumu <> 'ok')
      ) AS islenecek,
      COUNT(*) FILTER (
        WHERE cezaevi_mi = true 
        AND (ai_karar_ozeti IS NULL OR ai_karar_ozeti = '')
      ) AS ozeti_bos
    FROM kararlar
  `);

  console.table(r.rows);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
