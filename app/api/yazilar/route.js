import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

function slugify(text = "") {
  return text
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

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      baslik,
      ozet,
      icerik,
      kategori,
      kapakGorseli,
      seoBaslik,
      seoAciklama,
      ilgiliKararlar,
      kaynakMetinler,
    } = body;

    const slug = slugify(baslik);

    const result = await pool.query(
      `
  INSERT INTO yazilar (
    baslik,
    slug,
    ozet,
    icerik,
    kategori,
    kapak_gorseli,
    seo_baslik,
    seo_aciklama
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING id
`,
      [
        baslik,
        slug,
        ozet,
        icerik,
        kategori,
        kapakGorseli,
        seoBaslik,
        seoAciklama,
      ]
    );

    const yaziId = result.rows[0].id;

    if (ilgiliKararlar) {
      const kararlar = ilgiliKararlar
        .split("\n")
        .map((k) => k.trim())
        .filter(Boolean);

      for (const karar of kararlar) {
        await pool.query(
          `
      INSERT INTO yazi_kararlar (
        yazi_id,
        basvuru_no
      )
      VALUES ($1, $2)
    `,
          [yaziId, karar]
        );
      }
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}