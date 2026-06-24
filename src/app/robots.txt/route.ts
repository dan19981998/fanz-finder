import { SITE_URL } from "@/lib/config";

export async function GET() {
  const robots = `User-agent: *
Allow: /
Allow: /tools
Allow: /onlyfans/free
Allow: /onlyfans/near-me
Allow: /about
Allow: /terms
Allow: /privacy
Disallow: /api/
Disallow: /admin
Disallow: /onlyfans/creator/
Disallow: /onlyfans/blonde
Disallow: /onlyfans/brunette
Disallow: /onlyfans/redhead
Disallow: /onlyfans/asian
Disallow: /onlyfans/latina
Disallow: /onlyfans/ebony
Disallow: /onlyfans/milf
Disallow: /onlyfans/teen
Disallow: /onlyfans/big-boobs
Disallow: /onlyfans/big-ass
Disallow: /onlyfans/petite
Disallow: /onlyfans/curvy
Disallow: /onlyfans/goth
Disallow: /onlyfans/cosplay
Disallow: /onlyfans/trans
Disallow: /onlyfans/fitness
Disallow: /onlyfans/lingerie
Disallow: /onlyfans/new
Disallow: /onlyfans/popular
Disallow: /onlyfans/threesome
Disallow: /onlyfans/near-me/
Disallow: /categories
Disallow: /dmca
Disallow: /quiz
Disallow: /compare

Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(robots, {
    headers: { "Content-Type": "text/plain" },
  });
}
