import { Pool } from "pg";
import { NextResponse } from "next/server";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export async function POST(req) {

    try {

        const formData =
            await req.formData();

        for (const [key, value] of formData.entries()) {

            if (!key.startsWith("karar_")) {
                continue;
            }

            const id =
                key.replace("karar_", "");

            if (value === "evet") {

                await pool.query(
                    `
                    UPDATE kararlar
                    SET
                        cezaevi_mi = true,
                        cezaevi_incelendi = true
                    WHERE id = $1
                    `,
                    [id]
                );
            }

            if (value === "hayir") {

                await pool.query(
                    `
                    UPDATE kararlar
                    SET
                        cezaevi_mi = false,
                        cezaevi_incelendi = true
                    WHERE id = $1
                    `,
                    [id]
                );
            }
        }

        return NextResponse.redirect(
            new URL(
                "/admin/cezaevi-adaylari",
                req.url
            ),
            {
                status: 303,
            }
        );

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                ok: false,
            },
            {
                status: 500,
            }
        );
    }
}