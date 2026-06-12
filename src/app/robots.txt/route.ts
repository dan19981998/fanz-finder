import { SITE_URL } from "@/lib/config";

export async function GET() {
  const robots = `User-agent: *
Allow: /
Allow: /quiz
Allow: /compare
Allow: /about
Allow: /terms
Allow: /privacy
Disallow: /api/
Disallow: /admin
Disallow: /onlyfans/
Disallow: /categories
Disallow: /dmca

Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(robots, {
    headers: { "Content-Type": "text/plain" },
  });
}
