import { supabase } from "../lib/supabase";
import { createUrlSet } from "../lib/sitemapXml";

const siteUrl = "https://cezaevihaklari.com";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("yazilar")
    .select("slug, created_at, durum")
    .eq("durum", "yayinda")
    .not("slug", "is", null)
    .limit(1000);

  if (error) console.error("Sitemap yazılar hata:", error);

  const urls = (data || []).map((item) => ({
    url: `${siteUrl}/yazilar/${item.slug}`,
    lastModified: item.created_at,
  }));

  return new Response(createUrlSet(urls), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}