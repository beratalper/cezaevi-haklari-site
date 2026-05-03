require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const r = await pool.query(`
    SELECT
      basvuru_no,
      karar_adi,
      karar_tarihi,
      sonuc,
      sonuc_aym
    FROM kararlar
    WHERE cezaevi_mi = true
      AND basvuru_no IS NOT NULL
      AND basvuru_no <> ''
    ORDER BY random()
    LIMIT 20
  `);

  console.log("\nSeçilen 20 cezaevi kararı:\n");
  console.table(r.rows);

  console.log("\nKopyalanacak başvuru numaraları:\n");
  console.log(
    r.rows.map(x => `'${x.basvuru_no}'`).join(",\n")
  );

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
