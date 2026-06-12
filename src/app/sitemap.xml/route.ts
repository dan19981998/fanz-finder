import { SITE_URL, INDEXABLE_TAGS } from "@/lib/config";
import { LOCATIONS } from "@/lib/locations";
import pool from "@/lib/db";

export async function GET() {
  const now = new Date().toISOString().split("T")[0];

  // Static pages
  const staticPages = ["", "/about", "/categories", "/terms", "/privacy", "/dmca"];
  const tagPages = INDEXABLE_TAGS.map((tag) => `/onlyfans/${tag}`);
  const locationPages = LOCATIONS.map((loc) => `/onlyfans/near-me/${loc.slug}`);

  // Fetch creator usernames + lastmod from DB
  let creatorEntries: { url: string; lastmod: string }[] = [];
  try {
    const result = await pool.query(
      `SELECT username, last_scraped_at FROM creators WHERE traits IS NOT NULL AND traits != '{}' ORDER BY like_count DESC LIMIT 50000`
    );
    creatorEntries = result.rows.map((row: Record<string, any>) => ({
      url: `/onlyfans/creator/${row.username}`,
      lastmod: row.last_scraped_at
        ? new Date(row.last_scraped_at).toISOString().split("T")[0]
        : now,
    }));
  } catch {
    // DB unavailable — skip creator pages in sitemap
  }

  const staticUrls = [...staticPages, ...tagPages, ...locationPages].map((url) => ({
    url,
    lastmod: now,
    priority: url === "" ? "1.0" : url.startsWith("/onlyfans/") ? "0.8" : "0.4",
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls
      .map(
        (entry) => `  <url>
    <loc>${SITE_URL}${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <priority>${entry.priority}</priority>
  </url>`
      )
      .join("\n")}
${creatorEntries
      .map(
        (entry) => `  <url>
    <loc>${SITE_URL}${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <priority>0.6</priority>
  </url>`
      )
      .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
