import { SITE_URL } from "@/lib/config";

export async function GET() {
  const now = new Date().toISOString().split("T")[0];

  const pages = [
    { url: "", changefreq: "daily", priority: "1.0" },
    { url: "/tools", changefreq: "weekly", priority: "0.9" },
    { url: "/onlyfans/free", changefreq: "weekly", priority: "0.8" },
    { url: "/onlyfans/near-me", changefreq: "weekly", priority: "0.8" },
    { url: "/about", changefreq: "monthly", priority: "0.4" },
    { url: "/terms", changefreq: "monthly", priority: "0.3" },
    { url: "/privacy", changefreq: "monthly", priority: "0.3" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
      .map(
        (entry) => `  <url>
    <loc>${SITE_URL}${entry.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
      )
      .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
