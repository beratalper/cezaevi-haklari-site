import dotenv from "dotenv";
import pg from "pg";

import { mevzuatItems }
from "../app/mevzuat/data.js";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function syncItem(item) {

  try {

    await pool.query(
      `
      INSERT INTO mevzuatlar
      (
        title,
        description,
        href,
        kategori
      )
      VALUES ($1,$2,$3,$4)

      ON CONFLICT (title)

      DO UPDATE SET

        description =
          EXCLUDED.description,

        href =
          EXCLUDED.href,

        kategori =
          EXCLUDED.kategori
      `,
      [
        item.title,
        item.desc,
        item.href,
        item.kategori,
      ]
    );

    console.log(
      `SYNC:
       ${item.title}`
    );

  } catch (err) {

    console.error(
      `HATA:
       ${item.title}`
    );

    console.error(err.message);
  }
}

async function main() {

  console.log(
    "SYNC BASLADI"
  );

  for (const item of mevzuatItems) {

    await syncItem(item);
  }

  console.log(
    "SYNC TAMAMLANDI"
  );

  process.exit(0);
}

main();