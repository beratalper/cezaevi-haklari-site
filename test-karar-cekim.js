const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const nos = [
  "2013/1822",
  "2012/969",
  "2014/648",
  "2014/10204",
  "2021/54500",
  "2022/52566",
  "2022/39911",
  "2023/68522",
  "2022/72892",
  "2022/594"
];

async function main() {
  const r = await pool.query(
    "SELECT id, basvuru_no, karar_adi, karar_tarihi, sonuc, basvuru_konusu, mudahale_iddiasi_aym, sonuc_aym, ai_basvuru_konusu, ai_karar_ozeti, ai_neden_onemli, ai_benzer_basvuruda_dikkat FROM kararlar WHERE basvuru_no = ANY($1) ORDER BY basvuru_no",
    [nos]
  );

  console.log(JSON.stringify(r.rows, null, 2));
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
