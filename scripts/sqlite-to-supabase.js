require("dotenv").config({ path: ".env.local" });

const Database = require("better-sqlite3");
const { Client } = require("pg");

const sqlite = new Database("db/aym_kararlar.db", { readonly: true });

const pg = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function temizle(value) {
  if (value === undefined) return null;
  return value;
}

async function main() {
  await pg.connect();

  await pg.query(`
    CREATE TABLE IF NOT EXISTS kararlar (
      id BIGSERIAL PRIMARY KEY,
      karar_adi TEXT,
      basvuru_no TEXT UNIQUE,
      karar_tarihi TEXT,
      resmi_gazete_tarihi TEXT,
      basvuru_konusu TEXT,
      sonuc TEXT,
      mudahale_iddiasi_aym TEXT,
      sonuc_aym TEXT,
      metin TEXT,
      ust_kategori TEXT,
      alt_kategori TEXT,
      slug TEXT UNIQUE
    );
  `);

  const rows = sqlite.prepare("SELECT * FROM kararlar").all();

  console.log("Aktarılacak kayıt:", rows.length);

  for (const row of rows) {
    const slug = String(row.basvuru_no || "")
      .trim()
      .replace(/\//g, "-")
      .replace(/\s+/g, "");

    await pg.query(
      `
      INSERT INTO kararlar (
        karar_adi,
        basvuru_no,
        karar_tarihi,
        resmi_gazete_tarihi,
        basvuru_konusu,
        sonuc,
        mudahale_iddiasi_aym,
        sonuc_aym,
        metin,
        ust_kategori,
        alt_kategori,
        slug
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (basvuru_no) DO UPDATE SET
        karar_adi = EXCLUDED.karar_adi,
        karar_tarihi = EXCLUDED.karar_tarihi,
        resmi_gazete_tarihi = EXCLUDED.resmi_gazete_tarihi,
        basvuru_konusu = EXCLUDED.basvuru_konusu,
        sonuc = EXCLUDED.sonuc,
        mudahale_iddiasi_aym = EXCLUDED.mudahale_iddiasi_aym,
        sonuc_aym = EXCLUDED.sonuc_aym,
        metin = EXCLUDED.metin,
        ust_kategori = EXCLUDED.ust_kategori,
        alt_kategori = EXCLUDED.alt_kategori,
        slug = EXCLUDED.slug;
      `,
      [
        temizle(row.karar_adi),
        temizle(row.basvuru_no),
        temizle(row.karar_tarihi),
        temizle(row.resmi_gazete_tarihi),
        temizle(row.basvuru_konusu),
        temizle(row.sonuc),
        temizle(row.mudahale_iddiasi_aym),
        temizle(row.sonuc_aym),
        temizle(row.metin),
        temizle(row.ustKategori || row.ust_kategori),
        temizle(row.altKategori || row.alt_kategori),
        slug,
      ]
    );
  }

  await pg.end();
  sqlite.close();

  console.log("Aktarım tamamlandı.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});