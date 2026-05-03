require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function cleanTitle(title) {
    return title
        .replace(/^TÜRKİYE CUMHURİYETİ ANAYASA MAHKEMESİ\s+/i, "")
        .replace(/^(BİRİNCİ BÖLÜM|İKİNCİ BÖLÜM|GENEL KURUL)\s+/i, "")
        .replace(/^KARAR\s+/i, "")
        .trim();
}

async function run() {
    const res = await pool.query(`
    SELECT id, karar_adi
    FROM kararlar
    WHERE karar_adi ILIKE 'TÜRKİYE CUMHURİYETİ ANAYASA MAHKEMESİ%'
  `);

    console.log("Temizlenecek kayıt:", res.rows.length);

    for (const row of res.rows) {
        const temizBaslik = cleanTitle(row.karar_adi);

        console.log(`${row.id} → ${temizBaslik}`);

        await pool.query(
            `UPDATE kararlar SET karar_adi = $1 WHERE id = $2`,
            [temizBaslik, row.id]
        );
    }

    await pool.end();
    console.log("Bitti");
}

run();