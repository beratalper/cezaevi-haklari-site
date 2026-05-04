import { supabase } from "./lib/supabase";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const siteUrl = "https://cezaevihaklari.com";

  const { data, error } = await supabase
    .from("kararlar")
    .select("slug, basvuru_no, ai_analiz_at")
    .eq("cezaevi_mi", true)
    .limit(50000);

  if (error) {
    console.error("Sitemap hata:", error);
    return [];
  }

  const kararUrls = (data || []).map((item) => ({
    url: `${siteUrl}/kararlar/${item.slug || item.basvuru_no?.replace("/", "-")}`,
    lastModified: item.ai_analiz_at
      ? new Date(item.ai_analiz_at)
      : new Date(),
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/kararlar`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/dilekceler`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/istatistikler`,
      lastModified: new Date(),
    },
    ...kararUrls,
  ];
}