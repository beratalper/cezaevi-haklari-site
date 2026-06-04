import { supabase } from "../lib/supabase";
import { createUrlSet } from "../lib/sitemapXml";

const siteUrl = "https://cezaevihaklari.com";

export const dynamic = "force-dynamic";

function kararSlug(item) {
  return item.slug || item.basvuru_no?.replace("/", "-");
}

export async function GET() {
  const { data, error } = await supabase
    .from("kararlar")
    .select("slug, basvuru_no, ai_analiz_at")
    .eq("cezaevi_mi", true)
    .limit(50000);

  if (error) console.error("Sitemap kararlar hata:", error);

  const urls = (data || [])
    .filter((item) => kararSlug(item))
    .map((item) => ({
      url: `${siteUrl}/kararlar/${kararSlug(item)}`,
      lastModified: item.ai_analiz_at,
    }));

  return new Response(createUrlSet(urls), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}