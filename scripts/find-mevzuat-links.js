import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function searchMevzuat(title) {

    try {

        const searchUrl =
            `https://www.mevzuat.gov.tr/arama?search=${encodeURIComponent(title)}`;

        console.log(
            `ARANIYOR: ${title}`
        );

        const response =
            await axios.get(searchUrl, {
                timeout: 20000,
            });

        const $ = cheerio.load(response.data);

        let foundUrl = null;

        $("a").each((i, el) => {

            if (foundUrl) return;

            const href =
                $(el).attr("href");

            const text =
                $(el).text().trim();

            if (!href || !text) {
                return;
            }

            const lowerTitle =
                title.toLowerCase();

            const lowerText =
                text.toLowerCase();

            if (lowerText.includes(lowerTitle)) {
                foundUrl = href;
            }
        });

        return foundUrl;
    } catch (err) {
        console.error(
            `HATA:
       ${title}`
        );
        console.error(err.message);
        return null;
    }
}

async function main() {

    console.log(
        "ARAMA BASLADI"
    );

    const result =
        await pool.query(`
      SELECT *
      FROM mevzuatlar
      WHERE href =
      'https://www.mevzuat.gov.tr/'
    `);

    const items =
        result.rows;

    console.log(
        `${items.length} kayıt aranacak`
    );

    for (const item of items) {

        const newUrl =
            await searchMevzuat(
                item.title
            );

        if (newUrl) {

            await pool.query(
                `
        UPDATE mevzuatlar
        SET href = $1
        WHERE id = $2
        `,
                [
                    newUrl,
                    item.id,
                ]
            );

            console.log(
                `GUNCELLENDI:
${item.title}
${newUrl}`
            );

        } else {

            console.log(
                `BULUNAMADI:
${item.title}`
            );
        }

        await new Promise(
            resolve =>
                setTimeout(resolve, 1500)
        );
    }

    console.log(
        "TAMAMLANDI"
    );

    process.exit(0);
}

main();