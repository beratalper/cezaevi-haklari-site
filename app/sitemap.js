import { supabase } from "./lib/supabase";

export const dynamic = "force-dynamic";

const siteUrl = "https://cezaevihaklari.com";

function safeDate(value) {
  return value ? new Date(value) : undefined;
}

export default async function sitemap() {
  const [
    kararlarRes,
    rehberlerRes,
    yazilarRes,
    mevzuatlarRes,
  ] = await Promise.all([
    supabase
      .from("kararlar")
      .select("slug, basvuru_no, ai_analiz_at")
      .eq("cezaevi_mi", true)
      .limit(50000),

    supabase
      .from("ictihat_kategori_haritasi")
      .select("slug")
      .not("slug", "is", null)
      .limit(1000),

    supabase
      .from("yazilar")
      .select("slug, created_at, durum")
      .eq("durum", "yayinda")
      .not("slug", "is", null)
      .limit(1000),

    supabase
      .from("mevzuatlar")
      .select("href, created_at, son_kontrol, aktif_mi")
      .eq("aktif_mi", true)
      .not("href", "is", null)
      .limit(1000),
  ]);

  if (kararlarRes.error) console.error("Sitemap kararlar hata:", kararlarRes.error);
  if (rehberlerRes.error) console.error("Sitemap rehberler hata:", rehberlerRes.error);
  if (yazilarRes.error) console.error("Sitemap yazılar hata:", yazilarRes.error);
  if (mevzuatlarRes.error) console.error("Sitemap mevzuatlar hata:", mevzuatlarRes.error);

  const kararUrls = (kararlarRes.data || []).map((item) => ({
    url: `${siteUrl}/kararlar/${item.slug || item.basvuru_no?.replace("/", "-")}`,
    lastModified: safeDate(item.ai_analiz_at),
  }));

  const rehberUrls = (rehberlerRes.data || []).map((item) => ({
    url: `${siteUrl}/ictihatlar/${item.slug}`,
  }));

  const yaziUrls = (yazilarRes.data || []).map((item) => ({
    url: `${siteUrl}/yazilar/${item.slug}`,
    lastModified: safeDate(item.created_at),
  }));

  const mevzuatUrls = (mevzuatlarRes.data || [])
    .filter((item) => item.href?.startsWith("/"))
    .map((item) => ({
      url: `${siteUrl}${item.href}`,
      lastModified: safeDate(item.son_kontrol || item.created_at),
    }));

  return [
    { url: siteUrl },
    { url: `${siteUrl}/haklar` },
    { url: `${siteUrl}/konular` },
    { url: `${siteUrl}/mevzuat` },
    { url: `${siteUrl}/kararlar` },
    { url: `${siteUrl}/dilekceler` },
    { url: `${siteUrl}/istatistikler` },

    ...rehberUrls,
    ...yaziUrls,
    ...mevzuatUrls,
    ...kararUrls,
  ];
}