const siteUrl = "https://cezaevihaklari.com";

export default function sitemap() {
  return [
    {
      url: `${siteUrl}/sitemap-sabit.xml`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/sitemap-ictihatlar.xml`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/sitemap-yazilar.xml`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/sitemap-mevzuat.xml`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/sitemap-kararlar.xml`,
      lastModified: new Date(),
    },
  ];
}