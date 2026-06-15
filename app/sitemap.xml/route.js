const siteUrl = "https://cezaevihaklari.com";

export const dynamic = "force-dynamic";

function createSitemapIndex(sitemaps = []) {
  const body = sitemaps
    .map((item) => {
      return `
  <sitemap>
    <loc>${item.loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</sitemapindex>`;
}

export async function GET() {
  const sitemaps = [
    { loc: `${siteUrl}/sitemap-sabit.xml` },
    { loc: `${siteUrl}/sitemap-ictihatlar.xml` },
    { loc: `${siteUrl}/sitemap-yazilar.xml` },
    { loc: `${siteUrl}/sitemap-mevzuat.xml` },
    { loc: `${siteUrl}/sitemap-kararlar.xml` },
    { loc: `${siteUrl}/sitemap-bireysel-basvuru.xml` },
  ];

  return new Response(createSitemapIndex(sitemaps), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}