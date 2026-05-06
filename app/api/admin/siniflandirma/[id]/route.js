import { Pool } from "pg";
import { NextResponse } from "next/server";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req, { params }) {
  try {
    const { id } = await params;

    const formData = await req.formData();

    const cezaevi_mi = formData.get("cezaevi_mi") === "true";

    const ust_kategori = formData.get("ust_kategori") || null;

    const alt_kategori = formData.get("alt_kategori") || null;

    await pool.query(
      `
      UPDATE kararlar
      SET
        cezaevi_mi = $1,
        ust_kategori = $2,
        alt_kategori = $3
      WHERE id = $4
    `,
      [
        cezaevi_mi,
        ust_kategori,
        alt_kategori,
        id,
      ]
    );

    return NextResponse.redirect(
      new URL(req.headers.get("referer"))
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: "Update failed",
      },
      { status: 500 }
    );
  }
}