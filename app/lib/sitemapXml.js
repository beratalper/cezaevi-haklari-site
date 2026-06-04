export function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export function createUrlSet(urls = []) {
  const body = urls
    .map((item) => {
      const lastmod = item.lastModified
        ? `<lastmod>${formatDate(item.lastModified)}</lastmod>`
        : "";

      return `
  <url>
    <loc>${escapeXml(item.url)}</loc>
    ${lastmod}
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</urlset>`;
}