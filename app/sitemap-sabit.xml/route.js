import { createUrlSet } from "../lib/sitemapXml";

const siteUrl = "https://cezaevihaklari.com";

export const dynamic = "force-dynamic";

export async function GET() {
  const urls = [
    { url: siteUrl },
    { url: `${siteUrl}/yazilar` },
    { url: `${siteUrl}/kararlar` },
    { url: `${siteUrl}/ictihatlar` },
    { url: `${siteUrl}/haklar` },
    { url: `${siteUrl}/konular` },
    { url: `${siteUrl}/etiketler` },
    { url: `${siteUrl}/mevzuat` },
  ];

  return new Response(createUrlSet(urls), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}