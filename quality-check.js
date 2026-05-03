require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function count(label, sql) {
  const res = await pool.query(sql);
  return {
    kontrol: label,
    adet: Number(res.rows[0].adet || 0),
  };
}

async function list(label, sql) {
  const res = await pool.query(sql);
  console.log("\n===", label, "===");
  console.table(res.rows);
}

async function run() {
  const summary = [];

  summary.push(
    await count(
      "Toplam karar",
      `SELECT COUNT(*) AS adet FROM kararlar`
    )
  );

  summary.push(
    await count(
      "Cezaevi kararı",
      `SELECT COUNT(*) AS adet FROM kararlar WHERE cezaevi_mi = true`
    )
  );

  summary.push(
    await count(
      "Cezaevi olup AI özeti eksik",
      `
      SELECT COUNT(*) AS adet
      FROM kararlar
      WHERE cezaevi_mi = true
        AND (
          ai_karar_ozeti IS NULL
          OR ai_karar_ozeti = ''
        )
      `
    )
  );

  summary.push(
    await count(
      "Cezaevi olup kategori eksik",
      `
      SELECT COUNT(*) AS adet
      FROM kararlar
      WHERE cezaevi_mi = true
        AND (
          ust_kategori IS NULL
          OR ust_kategori = ''
        )
      `
    )
  );

  summary.push(
    await count(
      "Başvuru no eksik",
      `
      SELECT COUNT(*) AS adet
      FROM kararlar
      WHERE basvuru_no IS NULL
         OR basvuru_no = ''
      `
    )
  );

  summary.push(
    await count(
      "Karar adı eksik",
      `
      SELECT COUNT(*) AS adet
      FROM kararlar
      WHERE karar_adi IS NULL
         OR karar_adi = ''
      `
    )
  );

  summary.push(
    await count(
      "Hatalı DİĞERLERİ başlığı",
      `
      SELECT COUNT(*) AS adet
      FROM kararlar
      WHERE karar_adi = 'DİĞERLERİ BAŞVURUSU'
      `
    )
  );

  summary.push(
    await count(
      "Mahkeme üst başlığı kalmış",
      `
      SELECT COUNT(*) AS adet
      FROM kararlar
      WHERE karar_adi ILIKE '%ANAYASA MAHKEMESİ%'
         OR karar_adi ILIKE '%BİRİNCİ BÖLÜM KARAR%'
         OR karar_adi ILIKE '%İKİNCİ BÖLÜM KARAR%'
         OR karar_adi ILIKE '%GENEL KURUL KARAR%'
      `
    )
  );

  summary.push(
    await count(
      "Slug eksik",
      `
      SELECT COUNT(*) AS adet
      FROM kararlar
      WHERE slug IS NULL
         OR slug = ''
      `
    )
  );

  summary.push(
    await count(
      "Aynı başvuru no tekrarları",
      `
      SELECT COUNT(*) AS adet
      FROM (
        SELECT basvuru_no
        FROM kararlar
        WHERE basvuru_no IS NOT NULL
        GROUP BY basvuru_no
        HAVING COUNT(*) > 1
      ) t
      `
    )
  );

  console.log("\n=== KALİTE ÖZETİ ===");
  console.table(summary);

  await list(
    "Hatalı başlık örnekleri",
    `
    SELECT id, basvuru_no, karar_adi
    FROM kararlar
    WHERE karar_adi = 'DİĞERLERİ BAŞVURUSU'
       OR karar_adi ILIKE '%ANAYASA MAHKEMESİ%'
       OR karar_adi ILIKE '%BİRİNCİ BÖLÜM KARAR%'
       OR karar_adi ILIKE '%İKİNCİ BÖLÜM KARAR%'
       OR karar_adi ILIKE '%GENEL KURUL KARAR%'
    LIMIT 20
    `
  );

  await list(
    "Cezaevi olup AI/kategori eksik örnekleri",
    `
    SELECT id, basvuru_no, karar_adi, ai_karar_ozeti, ust_kategori
    FROM kararlar
    WHERE cezaevi_mi = true
      AND (
        ai_karar_ozeti IS NULL
        OR ai_karar_ozeti = ''
        OR ust_kategori IS NULL
        OR ust_kategori = ''
      )
    LIMIT 20
    `
  );

  await list(
    "Tekrarlı başvuru no örnekleri",
    `
    SELECT basvuru_no, COUNT(*) AS adet
    FROM kararlar
    WHERE basvuru_no IS NOT NULL
    GROUP BY basvuru_no
    HAVING COUNT(*) > 1
    ORDER BY adet DESC
    LIMIT 20
    `
  );

  await pool.end();
}

run().catch(async (err) => {
  console.error("HATA:", err);
  await pool.end();
});