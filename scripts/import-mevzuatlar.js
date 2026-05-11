import dotenv from "dotenv";
import pg from "pg";
import { mevzuatItems } from "../app/mevzuat/data.js";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

const mevzuatlar = mevzuatItems;

async function main() {

    for (const item of mevzuatlar) {

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
      `,
            [
                item.title,
                item.description,
                item.href,
                item.kategori,
            ]
        );

        console.log(
            "Eklendi:",
            item.title
        );
    }

    process.exit(0);
}

main();