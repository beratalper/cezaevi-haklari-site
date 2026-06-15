import { supabase } from "../lib/supabase";
import { createUrlSet } from "../lib/sitemapXml";

const siteUrl = "https://cezaevihaklari.com";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("bireysel_basvuru_sss")
    .select("slug")
    .eq("aktif", true)
    .not("slug", "is", null)
    .limit(1000);

  if (error) console.error("Sitemap bireysel başvuru hata:", error);

  const urls = (data || []).map((item) => ({
    url: `${siteUrl}/bireysel-basvuru/${item.slug}`,
  }));

  return new Response(createUrlSet(urls), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}