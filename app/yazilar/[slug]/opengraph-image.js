import { ImageResponse } from "next/og";
import { Pool } from "pg";

export const runtime = "edge";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = params;

  const result = await pool.query(
    `
      SELECT *
      FROM yazilar
      WHERE slug = $1
      LIMIT 1
    `,
    [slug]
  );

  const yazi = result.rows[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#070b14",
          color: "white",
          padding: "70px",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: "9999px",
            background: "rgba(201,169,110,0.12)",
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -250,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "9999px",
            background: "rgba(30,58,138,0.18)",
            filter: "blur(90px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              color: "#d9bd83",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            CezaeviHakları
          </div>

          <div
            style={{
              marginTop: 24,
              width: 120,
              height: 6,
              borderRadius: 9999,
              background: "#d9bd83",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {yazi?.baslik || "AYM Karar Analizi"}
          </div>

          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.5,
            }}
          >
            Cezaevlerinde yaşanan hak ihlallerine ilişkin
            AYM bireysel başvuru karar analizleri
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 24,
            }}
          >
            cezaevihaklari.com
          </div>

          <div
            style={{
              border: "1px solid rgba(217,189,131,0.35)",
              background: "rgba(217,189,131,0.1)",
              padding: "12px 22px",
              borderRadius: 9999,
              color: "#d9bd83",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            AYM İçtihat Arşivi
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}