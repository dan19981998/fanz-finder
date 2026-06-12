import { SITE_URL } from "@/lib/config";

export async function GET() {
  const now = new Date().toISOString().split("T")[0];

  // Tool-first approach: only index the application pages
  const pages = [
    { url: "", changefreq: "daily", priority: "1.0" },
    { url: "/quiz", changefreq: "weekly", priority: "0.9" },
    { url: "/compare", changefreq: "weekly", priority: "0.9" },
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
