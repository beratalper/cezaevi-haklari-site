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
    } = body;

    await pool.query(
      `
        UPDATE yazilar
        SET
          baslik = $1,
          ozet = $2
        WHERE id = $3
      `,
      [
        baslik,
        ozet,
        id,
      ]
    );

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