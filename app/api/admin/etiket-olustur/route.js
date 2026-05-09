import { Pool } from "pg";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

function slugify(value = "") {

    return value
        .toLowerCase()
        .replaceAll("ğ", "g")
        .replaceAll("ü", "u")
        .replaceAll("ş", "s")
        .replaceAll("ı", "i")
        .replaceAll("ö", "o")
        .replaceAll("ç", "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function POST(request) {

    const cookieStore = await cookies();

    const adminAuth =
        cookieStore.get("admin_auth")?.value;

    const yetkili =
        Boolean(process.env.ADMIN_SECRET) &&
        Boolean(adminAuth) &&
        adminAuth === process.env.ADMIN_SECRET;

    if (!yetkili) {
        return Response.json({
            ok: false,
            error: "Yetkisiz",
        });
    }

    const formData =
        await request.formData();

    const ad =
        formData.get("ad");

    const kararId =
        formData.get("karar_id");

    if (!ad) {
        return Response.json({
            ok: false,
            error: "Etiket adı boş",
        });
    }

    const slug = slugify(ad);

    const yeniEtiket = await pool.query(
        `
  INSERT INTO etiketler
  (ad, slug)

  VALUES ($1, $2)

  ON CONFLICT (slug)
  DO UPDATE SET ad = EXCLUDED.ad

  RETURNING id
  `,
        [ad, slug]
    );

    const etiketId =
        yeniEtiket.rows[0].id;

    if (kararId) {

        await pool.query(
            `
    INSERT INTO karar_etiketleri
    (karar_id, etiket_id)

    VALUES ($1, $2)

    ON CONFLICT DO NOTHING
    `,
            [kararId, etiketId]
        );
    }

    return redirect(
        request.headers.get("referer")
    );
}