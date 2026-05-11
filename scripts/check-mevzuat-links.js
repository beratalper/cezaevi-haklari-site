import dotenv from "dotenv";
import axios from "axios";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function checkLink(item) {

    try {

        const response = await axios.get(
            item.href,
            {
                maxRedirects: 5,
                timeout: 15000,
                validateStatus: () => true,
            }
        );

        const finalUrl =
            response.request?.res?.responseUrl ||
            item.href;

        await pool.query(
            `
      UPDATE mevzuatlar
SET
  aktif_mi = true,
  son_kontrol = now(),
  son_durum = $1,
  son_hata = NULL,
  son_url = $2,
  href = $2
WHERE id = $3
      `,
            [
                response.status,
                finalUrl,
                item.id,
            ]
        );

        console.log(
            `OK: ${item.title}`
        );

        if (finalUrl !== item.href) {

            console.log(
                `REDIRECT:
     ${item.href}
     ->
     ${finalUrl}`
            );
        }

    } catch (err) {

        await pool.query(
            `
      UPDATE mevzuatlar
      SET
        aktif_mi = false,
        son_kontrol = now(),
        son_hata = $1
      WHERE id = $2
      `,
            [
                err.message,
                item.id,
            ]
        );

        console.log(
            `HATA: ${item.title}`
        );
    }
}

async function main() {

    const result = await pool.query(
        `SELECT * FROM mevzuatlar`
    );

    for (const item of result.rows) {

        await checkLink(item);
    }

    process.exit(0);
}

main();