import fs from "fs";
import dotenv from "dotenv";
import pg from "pg";

import { chromium }
    from "playwright";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false,
    },
});

function extractKanunNo(title) {

    const match =
        title.match(/^(\d+)/);

    return match
        ? match[1]
        : null;
}

function updateDataJs(
    title,
    newHref
) {

    const path =
        "./app/mevzuat/data.js";

    const raw =
        fs.readFileSync(
            path,
            "utf8"
        );

    const jsonPart =
        raw
            .replace(
                "const mevzuatItems =",
                ""
            )
            .replace(
                "export { mevzuatItems };",
                ""
            )
            .trim();

    const currentItems =
        JSON.parse(jsonPart);

    const updated =
        currentItems.map(item => {

            if (
                item.title === title
            ) {

                return {
                    ...item,
                    href: newHref,
                };
            }

            return item;
        });

    const content =
        `const mevzuatItems = ${JSON.stringify(updated, null, 2)};

export { mevzuatItems };
`;

    fs.writeFileSync(
        path,
        content,
        "utf8"
    );

    console.log(
        `DATA.JS GUNCELLENDI:
${title}`
    );
}

async function searchMevzuat(
    page,
    title
) {

    const kanunNo =
        extractKanunNo(title);

    // KANUNLAR
    // direkt URL üret

    if (kanunNo) {

        const generatedUrl =
            `https://mevzuat.gov.tr/mevzuat?MevzuatNo=${kanunNo}&MevzuatTur=1&MevzuatTertip=5`;

        console.log(
            `KANUN URL:
${generatedUrl}`
        );

        return generatedUrl;
    }

    // YÖNETMELİKLER
    // playwright arama

    try {

        console.log(
            `ARANIYOR:
${title}`
        );

        await page.goto(
            "https://mevzuat.gov.tr/",
            {
                waitUntil:
                    "networkidle",
            }
        );

        await page.waitForTimeout(
            2000
        );

        const input =
            page.locator(
                'input[type=\"search\"]'
            );

        await input.fill(title);

        await input.press("Enter");

        await page.waitForTimeout(
            5000
        );

        const links =
            await page.locator("a")
                .evaluateAll(nodes => {

                    return nodes.map(n => ({
                        href: n.href,
                        text:
                            n.innerText,
                    }));
                });

        const found =
            links.find(link => {

                const text =
                    (link.text || "")
                        .toLowerCase();

                const href =
                    (link.href || "");

                return (

                    href.includes(
                        "MevzuatNo"
                    )

                    &&

                    text.includes(
                        title
                            .split(" ")[0]
                            .toLowerCase()
                    )
                );
            });

        if (found) {

            console.log(
                `BULUNDU:
${found.href}`
            );

            return found.href;
        }

        return null;

    } catch (err) {

        console.error(err);

        return null;
    }
}

async function main() {

    const browser =
        await chromium.launch({
            headless: false,
        });

    const page =
        await browser.newPage();

    const result =
        await pool.query(`
      SELECT *
      FROM mevzuatlar
      WHERE href =
'https://www.mevzuat.gov.tr/'
AND kategori = 'Yönetmelikler'
    `);

    const items =
        result.rows;

    console.log(
        `${items.length} kayıt`
    );

    for (const item of items) {

        const newUrl =
            await searchMevzuat(
                page,
                item.title
            );

        console.log(
            "NEW URL:",
            newUrl
        );

        if (newUrl) {

            // DB UPDATE

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
                `DB GUNCELLENDI:
${item.title}`
            );

            // DATA.JS UPDATE

            updateDataJs(
                item.title,
                newUrl
            );
        }

        await page.waitForTimeout(
            1500
        );
    }

    await browser.close();

    console.log(
        "TAMAMLANDI"
    );

    process.exit(0);
}

main();