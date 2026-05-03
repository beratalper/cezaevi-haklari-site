require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const nos = [
  "2019/25687",
  "2021/5835",
  "2016/43840",
  "2020/34535",
  "2021/564",
  "2021/58670",
  "2013/5545",
  "2014/16310",
  "2015/16870",
  "2016/79321",
  "2016/67737",
  "2023/9144",
  "2018/24924",
  "2020/17510",
  "2020/34659",
  "2015/10703",
  "2020/31336",
  "2019/10519",
  "2020/39604",
  "2014/1390",
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
