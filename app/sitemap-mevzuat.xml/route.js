import { supabase } from "../lib/supabase";
import { createUrlSet } from "../lib/sitemapXml";

const siteUrl = "https://cezaevihaklari.com";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("mevzuatlar")
    .select("href, created_at, son_kontrol, aktif_mi")
    .eq("aktif_mi", true)
    .not("href", "is", null)
    .limit(1000);

  if (error) console.error("Sitemap mevzuat hata:", error);

  const urls = (data || [])
    .filter((item) => item.href?.startsWith("/"))
    .map((item) => ({
      url: `${siteUrl}${item.href}`,
      lastModified: item.son_kontrol || item.created_at,
    }));

  return new Response(createUrlSet(urls), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}