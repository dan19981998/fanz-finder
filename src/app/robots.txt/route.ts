import { SITE_URL } from "@/lib/config";

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(robots, {
    headers: { "Content-Type": "text/plain" },
  });
}
