import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function PUT(req, { params }) {
  try {
    const { id } = await params;

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
      tagler,
    } = body;

    await pool.query(
      `
        UPDATE yazilar
        SET
          baslik = $1,
          ozet = $2,
          icerik = $3,
          kategori = $4,
          kapak_gorseli = $5,
          seo_baslik = $6,
          seo_aciklama = $7,
          tagler = $8
        WHERE id = $9
      `,
      [
        baslik,
        ozet,
        icerik,
        kategori,
        kapakGorseli,
        seoBaslik,
        seoAciklama,
        tagler,
        id,
      ]
    );

    await pool.query(
      `
        DELETE FROM yazi_kararlar
        WHERE yazi_id = $1
      `,
      [id]
    );

    const kararlar = ilgiliKararlar
      ?.split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    for (const basvuruNo of kararlar) {
      await pool.query(
        `
          INSERT INTO yazi_kararlar (
            yazi_id,
            basvuru_no
          )
          VALUES ($1, $2)
        `,
        [id, basvuruNo]
      );
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