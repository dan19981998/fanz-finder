import { SITE_URL, INDEXABLE_TAGS } from "@/lib/config";
import { LOCATIONS } from "@/lib/locations";

export async function GET() {
  const staticPages = ["", "/about", "/categories", "/terms", "/privacy", "/dmca"];
  const tagPages = INDEXABLE_TAGS.map((tag) => `/onlyfans/${tag}`);
  const locationPages = LOCATIONS.map((loc) => `/onlyfans/near-me/${loc.slug}`);

  const allUrls = [...staticPages, ...tagPages, ...locationPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
      .map(
        (url) => `  <url>
    <loc>${SITE_URL}${url}</loc>
    <changefreq>daily</changefreq>
    <priority>${url === "" ? "1.0" : url.startsWith("/onlyfans/") ? "0.8" : "0.4"}</priority>
  </url>`
      )
      .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
