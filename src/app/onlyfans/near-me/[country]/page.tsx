import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { LOCATIONS } from "@/lib/locations";
import TagFaq from "@/components/TagFaq";
import CreatorCardLink from "@/components/CreatorCardLink";

const PER_PAGE = 24;

interface Props {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
    return LOCATIONS.map((loc) => ({ country: loc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { country } = await params;
    const loc = LOCATIONS.find((l) => l.slug === country);
    if (!loc) return {};
    const content = LOCATION_CONTENT[country] || getDefaultLocationContent(loc.name);

    return {
        title: content.metaTitle,
        description: content.metaDescription,
    };
}

export const revalidate = 3600;

// ─── Content types ──────────────────────────────────────────────────────────

interface LocationContent {
    metaTitle: string;
    metaDescription: string;
    h1: string;
    intro: string;
    deepTitle: string;
    deepContent: string;
    expectTitle: string;
    expectContent: string;
    faqs: { q: string; a: string }[];
}

function getDefaultLocationContent(name: string): LocationContent {
    return {
        metaTitle: `OnlyFans Creators from ${name} | Best ${name} Accounts 2026`,
        metaDescription: `Discover the best OnlyFans creators from ${name}. Browse verified local profiles with real stats, pricing, and content counts. Updated weekly.`,
        h1: `OnlyFans Creators from ${name}`,
        intro: `Looking for OnlyFans creators based in ${name}? Lush Finder lists every verified creator who has listed ${name} as their location on the platform. Browse real subscriber counts, media uploads, and exact pricing — all pulled directly from OnlyFans and refreshed weekly. Whether you want to support local creators or find someone in your area, this is the most complete directory of ${name}-based OnlyFans accounts available.`,
        deepTitle: `Why ${name} OnlyFans Creators Are Worth Following`,
        deepContent: `${name} has a thriving OnlyFans creator community. Local creators bring unique cultural perspectives, regional aesthetics, and authentic content that resonates with both local subscribers and international audiences. Many ${name}-based creators are active across multiple social media platforms, building strong personal brands that translate into high-quality OnlyFans content.\n\nFinding creators by location is one of the most popular ways to discover new accounts on OnlyFans. Whether you're looking for someone in your city, want to support creators from your country, or are simply attracted to the aesthetics associated with ${name}, browsing by location gives you a curated selection that generic search can't provide.\n\nOur directory pulls location data directly from each creator's OnlyFans profile. Creators who list ${name} as their location appear in this grid with all their real stats — subscriber counts, content volume, and pricing. Everything is refreshed weekly to stay current.`,
        expectTitle: `What to Expect from ${name} OnlyFans Creators`,
        expectContent: `OnlyFans creators from ${name} span every content category — fitness, glamour, lifestyle, cosplay, and more. Location doesn't define content type, so you'll find the full range represented here. What unites them is their base in ${name}, which often means similar time zones for live content and responsive messaging.\n\nPricing among ${name} creators varies based on their niche and popularity rather than location. You'll find free accounts alongside premium subscriptions, with the same value indicators as any other category — check media count for content volume and subscriber count for popularity.\n\nMany ${name}-based creators incorporate local elements into their content — recognisable locations, local fashion, language, and cultural references that add an extra layer of authenticity and connection for subscribers who share their geography.`,
        faqs: [
            { q: `How many OnlyFans creators from ${name} are listed?`, a: `We currently index all verified OnlyFans creators who list ${name} as their location. New profiles are added weekly as our scraper discovers them.` },
            { q: `How is location determined?`, a: `Location is based on what creators list on their OnlyFans profile. We pull this data directly from the platform during our weekly scraping process.` },
            { q: `Are all these creators actually in ${name}?`, a: `Location is self-reported on OnlyFans. Most creators list their accurate location, but some may list a different country. The data reflects what's on their official profile.` },
            { q: `Can I find creators in a specific city?`, a: `Our directory currently groups by country. Some creators include their city in their location data, which is visible on their OnlyFans profile once you visit it.` },
            { q: `How often is this page updated?`, a: `All stats are refreshed weekly. New creators from ${name} are added as they're discovered, and inactive accounts are flagged.` },
        ],
    };
}

// ─── Unique content per location ────────────────────────────────────────────

const LOCATION_CONTENT: Record<string, LocationContent> = {
    "united-states": {
        metaTitle: "OnlyFans Creators from the United States | Best US Accounts 2026",
        metaDescription: "Find the best American OnlyFans creators. Browse US-based profiles from every state with real stats and pricing. Updated weekly.",
        h1: "OnlyFans Creators from the United States",
        intro: "The United States has the largest OnlyFans creator community in the world. From LA-based models to NYC influencers to small-town creators building their brand, American accounts dominate the platform in both numbers and subscriber counts. Lush Finder indexes every verified US creator with real stats so you can browse the best American OnlyFans accounts in one place.",
        deepTitle: "Why US OnlyFans Creators Lead the Platform",
        deepContent: "American creators have been on OnlyFans since the platform's earliest days, and they continue to set the standard for content quality, marketing savvy, and subscriber engagement. The US market benefits from high internet penetration, a culture of content creation, and the strongest creator economy infrastructure in the world.\n\nUS-based creators span every niche imaginable. The sheer size of the American creator community means no matter what content type you're looking for — fitness, cosplay, glamour, lifestyle, or anything else — there are dozens of US creators competing in that space. Competition drives quality, which means American accounts tend to deliver professional-grade content.\n\nGeographically, US creators are concentrated in major cities like Los Angeles, Miami, Las Vegas, and New York — but you'll find active creators from every state. California alone produces more OnlyFans content than most entire countries. The variety across regions adds cultural diversity that keeps the category fresh and interesting.\n\nOur directory tracks all verified US OnlyFans accounts with real platform data. Browse by subscriber count to find the most popular, or page through to discover rising stars at competitive prices.",
        expectTitle: "What to Expect from American OnlyFans Creators",
        expectContent: "American OnlyFans creators set the standard for production quality. Many invest in professional cameras, lighting setups, and even dedicated content studios. The competitive US market means creators who don't maintain high standards quickly lose subscribers to those who do. Expect polished, intentional content from established American accounts.\n\nPricing among US creators spans the full range — from free accounts used as marketing funnels to premium subscriptions up to $50/month. The average sits around $10–$15/month for quality content with full access. Free accounts are plentiful and often high-quality, using PPV and tips for monetisation.\n\nEngagement styles vary regionally and by creator personality. Many American creators maintain active social media presences on Twitter, Instagram, and TikTok that complement their OnlyFans — giving you a sense of their personality before subscribing. DM responsiveness is typically good for creators in the sub-20,000 subscriber range.",
        faqs: [
            { q: "How many US OnlyFans creators are listed?", a: "We index over 1,600 verified US-based OnlyFans creators — the largest country in our directory. New American accounts are added weekly." },
            { q: "Which US cities have the most creators?", a: "Los Angeles leads by a significant margin, followed by Las Vegas, Miami, New York, and other major metros. But creators are spread across all 50 states." },
            { q: "Are US accounts more expensive?", a: "Not necessarily. US creators span every price point from free to premium. The average is $10–$15/month, similar to the global average." },
            { q: "Can I find creators from a specific state?", a: "Our directory groups by country. Many creators include their city and state in their OnlyFans location, which you can see on their profile." },
            { q: "Do US creators offer international subscriptions?", a: "Yes — OnlyFans is global. You can subscribe to US creators from anywhere in the world. Content is accessible regardless of your location." },
        ],
    },
    "united-kingdom": {
        metaTitle: "OnlyFans Creators from the UK | Best British Accounts 2026",
        metaDescription: "Find the best British OnlyFans creators. Browse UK-based profiles from London, Manchester, and beyond. Real stats, updated weekly.",
        h1: "OnlyFans Creators from the United Kingdom",
        intro: "The UK has one of the most active OnlyFans communities outside the US. British creators bring a distinctive style — witty, confident, and unapologetically authentic. From London glamour to northern charm, Lush Finder lists every verified UK-based creator with real stats pulled directly from the platform.",
        deepTitle: "Why British OnlyFans Creators Are So Popular",
        deepContent: "The United Kingdom punches well above its weight on OnlyFans relative to its population. British creators have built some of the most successful accounts on the platform, combining personality-driven content with professional production quality. The UK's strong social media culture and influencer economy feeds directly into OnlyFans success.\n\nLondon dominates UK creator numbers, but you'll find active communities in Manchester, Birmingham, Liverpool, Leeds, Bristol, and across Scotland and Wales. Each region brings its own personality — London creators tend toward polished glamour, while northern creators often lead with humour and authenticity.\n\nBritish creators are known for excellent subscriber engagement. The culture of wit and conversational personality means DM interactions tend to be genuinely entertaining, not just transactional. Many UK creators build real communities around their pages, with subscribers staying for the personality as much as the content.\n\nOur directory tracks all verified UK OnlyFans accounts with real platform data. Browse the grid to find creators from across Britain — subscriber counts, content volumes, and exact pricing all visible at a glance.",
        expectTitle: "What to Expect from UK OnlyFans Creators",
        expectContent: "British OnlyFans accounts combine visual content with personality in ways that feel distinctly British. Expect humour in captions, conversational DMs, and a less over-produced aesthetic compared to American accounts. UK creators tend to favour authenticity over perfection, which many subscribers find more engaging and relatable.\n\nContent quality is high — the UK's competitive creator market ensures standards remain professional. Many British creators have backgrounds in modelling, media, or social media marketing. Production quality is typically excellent but wrapped in a more approachable, personality-first package.\n\nPricing among UK creators tends to be moderate. The British market gravitates toward accessible pricing ($5–$15/month) rather than premium pricing. Free accounts are common, and PPV pricing tends to be reasonable. The value-for-money in the UK creator market is generally excellent.",
        faqs: [
            { q: "How many UK creators are listed?", a: "We index over 400 verified UK-based OnlyFans creators, with new British accounts added weekly as our scraper discovers them." },
            { q: "Which UK cities have the most creators?", a: "London leads significantly, followed by Manchester, Birmingham, and other major cities. All regions of England, Scotland, and Wales are represented." },
            { q: "Are British accounts subscription-only?", a: "Most UK creators offer standard subscriptions. Many also have free accounts with PPV content. Pricing and access models vary by creator." },
            { q: "Is the content different from US creators?", a: "Style-wise, yes. British creators tend to be more personality-driven and conversational. Content quality is equally professional but often feels more authentic and less produced." },
            { q: "Can I subscribe from outside the UK?", a: "Yes — OnlyFans is global. UK creators are accessible from any country. There are no geographic restrictions on content access." },
        ],
    },
    "australia": {
        metaTitle: "OnlyFans Creators from Australia | Best Aussie Accounts 2026",
        metaDescription: "Discover the best Australian OnlyFans creators. Browse Aussie profiles with real stats, transparent pricing, and weekly updates.",
        h1: "OnlyFans Creators from Australia",
        intro: "Australian OnlyFans creators bring sun-kissed aesthetics, laid-back personalities, and high production quality to the platform. From Sydney beach content to Melbourne's creative scene, Aussie creators are known for outdoor lifestyles and confident content. Lush Finder tracks every verified Australian account with real stats.",
        deepTitle: "Why Australian OnlyFans Creators Stand Out",
        deepContent: "Australia's OnlyFans community has grown rapidly, driven by the country's beach culture, fitness focus, and social media savvy population. Australian creators benefit from year-round warm weather and stunning natural landscapes that provide beautiful backdrops for content — beaches, bushland, and city rooftops feature regularly.\n\nThe Aussie content style is distinctive. It combines the polished professionalism of American content with a laid-back, approachable personality that feels uniquely Australian. Creators tend to be confident and direct, with content that feels natural rather than overly staged. The fitness and outdoor lifestyle culture means many Australian creators showcase athletic physiques.\n\nDespite a smaller population than the US or UK, Australia produces a disproportionate number of successful OnlyFans creators. The country's high English proficiency, tech adoption, and liberal attitudes toward content creation create an ideal environment for the platform.\n\nOur directory indexes all verified Australian OnlyFans accounts. Browse the grid for real subscriber counts, content volumes, and pricing — refreshed weekly from the platform.",
        expectTitle: "What to Expect from Australian OnlyFans Creators",
        expectContent: "Australian OnlyFans accounts feature content that often incorporates the country's outdoor lifestyle — beach settings, natural light photography, and athletic aesthetics. Expect high-quality visuals with a more natural, less studio-heavy feel than American or European accounts.\n\nPosting schedules from Aussie creators align with AEST timezone, which means new content often appears in the evening for American subscribers. Many Australian creators post daily, building extensive libraries of content. Time zone differences rarely matter since content is on-demand.\n\nPricing tends to be competitive. Australian creators price similarly to the global average ($8–$15/month for quality content), with many offering free accounts. The value is typically excellent — Aussie creators are known for generous content volume relative to subscription price.",
        faqs: [
            { q: "How many Australian creators are listed?", a: "We index verified Australian OnlyFans creators from across the country, with numbers growing weekly as our scraper discovers new accounts." },
            { q: "Which Australian cities are represented?", a: "Sydney and Melbourne dominate, but creators from Brisbane, Perth, Adelaide, Gold Coast, and regional areas are all represented." },
            { q: "Does the time zone affect content?", a: "Posts are on-demand, so timezone doesn't matter for viewing content. For live interaction and DMs, Australian creators are most responsive during AEST business hours." },
            { q: "What's the content style like?", a: "Typically outdoorsy, natural-looking, and confident. Australian creators often feature beach, fitness, and lifestyle content with a laid-back personality." },
            { q: "Are prices in Australian dollars?", a: "OnlyFans uses USD globally. Prices shown are in US dollars regardless of the creator's home country." },
        ],
    },
    canada: {
        metaTitle: "OnlyFans Creators from Canada | Best Canadian Accounts 2026",
        metaDescription: "Find the best Canadian OnlyFans creators. Browse profiles from Toronto, Vancouver, Montreal and more. Real stats, updated weekly.",
        h1: "OnlyFans Creators from Canada",
        intro: "Canadian OnlyFans creators offer a unique blend of North American production quality with distinctly Canadian charm. From Toronto's diverse creator scene to Vancouver's fitness community to Montreal's artistic flair, Canada produces exceptional content across every niche. Lush Finder lists every verified Canadian account with real platform stats.",
        deepTitle: "Why Canadian OnlyFans Creators Are Growing Fast",
        deepContent: "Canada's OnlyFans community has exploded over the past two years, making it the third-largest English-speaking market on the platform. Canadian creators benefit from proximity to US trends and audience while maintaining their own distinctive content styles. The country's multicultural population means incredible diversity in creator backgrounds and aesthetics.\n\nToronto leads Canadian creator numbers with its massive population and diverse communities. Vancouver's fitness and wellness culture produces a strong contingent of athletic creators. Montreal — with its bilingual, European-influenced culture — offers a creative flair that sets Quebec creators apart from the rest of North America.\n\nCanadian creators are known for consistent quality and reliability. The creator culture in Canada tends toward professionalism — regular posting schedules, responsive communication, and content that delivers on promises. Subscriber retention rates among Canadian creators are typically above the platform average.\n\nOur directory tracks all verified Canadian OnlyFans accounts with real data. Browse subscriber counts, content volumes, and pricing across creators from coast to coast.",
        expectTitle: "What to Expect from Canadian OnlyFans Creators",
        expectContent: "Canadian OnlyFans accounts offer content quality comparable to top US creators, often at more competitive prices. Expect professional photography, consistent posting schedules, and genuine subscriber engagement. Many Canadian creators post 4-7 times per week, building extensive content libraries quickly.\n\nBilingual content is a unique Canadian feature. Montreal and Quebec creators often post in both French and English, catering to both audiences. This bilingual approach gives them access to French-speaking international subscribers as well as the English-speaking majority.\n\nPricing among Canadian creators tends to be slightly lower than US counterparts — the $5–$12/month range is common for quality content. Free accounts are plentiful, and the overall value proposition is strong. Canadian creators compete on quality and engagement rather than marketing hype.",
        faqs: [
            { q: "How many Canadian creators are listed?", a: "We index over 300 verified Canadian OnlyFans creators from across the country, with new accounts added weekly." },
            { q: "Which Canadian cities have the most creators?", a: "Toronto leads, followed by Vancouver and Montreal. Calgary, Edmonton, Ottawa, and other cities are also well-represented." },
            { q: "Do Canadian creators post in French?", a: "Some do — particularly those based in Quebec and Montreal. Many are bilingual and post in both English and French." },
            { q: "Are Canadian accounts cheaper than US?", a: "Often slightly, yes. The competitive Canadian market tends toward accessible pricing ($5–$12/month average). Value for money is typically excellent." },
            { q: "Is payment in Canadian dollars?", a: "No — OnlyFans uses USD globally. All prices shown are in US dollars regardless of creator location." },
        ],
    },
    colombia: {
        metaTitle: "OnlyFans Creators from Colombia | Best Colombian Accounts 2026",
        metaDescription: "Discover the best Colombian OnlyFans creators. Browse passionate profiles from Medellín, Bogotá, and beyond. Real stats, updated weekly.",
        h1: "OnlyFans Creators from Colombia",
        intro: "Colombia has emerged as one of the largest OnlyFans markets in Latin America. Colombian creators are known for their stunning beauty, confident personalities, and incredibly active posting schedules. Lush Finder indexes every verified Colombian account with real stats — subscriber counts, content volumes, and transparent pricing.",
        deepTitle: "Why Colombian OnlyFans Creators Are Thriving",
        deepContent: "Colombia's OnlyFans scene has exploded in recent years, driven by a combination of natural beauty, entrepreneurial spirit, and tech-savvy young populations in cities like Medellín, Bogotá, and Cali. Colombian creators bring warmth, confidence, and incredibly high posting frequency to the platform.\n\nThe Colombian creator community is predominantly female and skews toward glamour, lingerie, and lifestyle content — though fitness and dance content are also strongly represented. Many Colombian creators incorporate dance, music, and cultural elements into their content, creating a distinctive style that's immediately recognisable.\n\nEngagement levels from Colombian creators are among the highest globally. They tend to post multiple times daily, respond actively to messages, and build genuine relationships with subscribers. The cultural emphasis on warmth and personal connection translates directly into the OnlyFans subscriber experience.\n\nOur directory tracks nearly 200 verified Colombian OnlyFans accounts. Browse the grid to compare creators by popularity and pricing — all data refreshed weekly from the platform.",
        expectTitle: "What to Expect from Colombian OnlyFans Creators",
        expectContent: "Colombian OnlyFans accounts feature vibrant, energetic content with exceptionally high posting frequency. Many Colombian creators post multiple times per day — building extensive media libraries faster than creators from most other countries. If content volume matters to you, Colombian accounts deliver.\n\nContent style tends toward confident, sensual material with strong cultural elements. Dance content, reggaeton-influenced aesthetics, and bold styling are common. Production quality ranges from professional studio shoots to authentic, personal smartphone content — both effective in their own way.\n\nPricing among Colombian creators tends to be very accessible. Many offer free subscriptions, and paid accounts rarely exceed $10/month. Given the extremely high posting frequency, the value per dollar is often exceptional. Language is mixed — some post in Spanish only, others in English, and many are bilingual.",
        faqs: [
            { q: "How many Colombian creators are listed?", a: "We index nearly 200 verified Colombian OnlyFans accounts, with new profiles added weekly. Colombia is one of our largest Latin American markets." },
            { q: "Do Colombian creators post in English?", a: "It varies. Some post exclusively in Spanish, others in English, and many are bilingual. Language is usually apparent from their OnlyFans bio." },
            { q: "Are Colombian accounts affordable?", a: "Generally very affordable. Many offer free subscriptions, and paid accounts typically range from $3–$10/month. The value is excellent given high posting frequency." },
            { q: "Which Colombian cities are represented?", a: "Medellín, Bogotá, Cali, and Barranquilla are the most common. Creators from smaller cities and towns are also represented." },
            { q: "How active are Colombian creators?", a: "Extremely. Colombian creators are known for posting multiple times daily and maintaining responsive DM conversations. Activity levels are among the highest of any country." },
        ],
    },
    brazil: {
        metaTitle: "OnlyFans Creators from Brazil | Best Brazilian Accounts 2026",
        metaDescription: "Find the best Brazilian OnlyFans creators. Browse stunning profiles from São Paulo, Rio, and beyond. Real stats, updated weekly.",
        h1: "OnlyFans Creators from Brazil",
        intro: "Brazil produces some of the most stunning and active OnlyFans creators on the platform. Known for their confidence, diverse beauty, and incredibly engaging personalities, Brazilian creators have built massive subscriber bases globally. Lush Finder lists every verified Brazilian account with real stats from OnlyFans.",
        deepTitle: "Why Brazilian OnlyFans Creators Have a Global Following",
        deepContent: "Brazil's OnlyFans community draws from the country's enormous population and deeply embedded culture of body positivity and self-expression. Brazilian creators bring a level of confidence and natural charisma that's hard to find elsewhere — qualities that translate directly into compelling OnlyFans content with high subscriber retention.\n\nThe diversity of Brazilian creators is remarkable. With an ethnically diverse population and creators from major cities like São Paulo, Rio de Janeiro, Belo Horizonte, and beyond, you'll find every body type, aesthetic, and content style represented. This diversity makes Brazil one of the richest creator markets for subscribers with varied tastes.\n\nFitness culture is deeply embedded in Brazilian society, which shows in their OnlyFans community. Many Brazilian creators incorporate fitness, dance (particularly Brazilian styles like samba and funk), and active lifestyles into their content. The result is dynamic, energetic content that stands apart from more static, photo-heavy accounts.\n\nOur directory tracks all verified Brazilian OnlyFans accounts with real platform data. Compare subscriber counts, media volumes, and pricing across the full range of Brazilian creators.",
        expectTitle: "What to Expect from Brazilian OnlyFans Creators",
        expectContent: "Brazilian OnlyFans accounts feature confident, body-positive content with distinctive cultural flair. Expect dance content, fitness material, beach aesthetics, and bold imagery that celebrates Brazilian beauty standards. Content tends to be dynamic — videos and movement-based content are more common here than in photo-dominant markets.\n\nPosting frequency is typically very high. Brazilian creators are known for active, engaging pages with daily content drops. Media libraries build quickly, giving new subscribers extensive back-catalogues from day one. The cultural norm of frequent communication extends to DMs — responsiveness is generally excellent.\n\nPricing is very accessible in the Brazilian market. Most creators charge $5–$12/month, with many offering free accounts. The combination of high posting frequency and low prices makes Brazilian accounts some of the best value on the entire platform. Language is primarily Portuguese, though many popular creators post in English too.",
        faqs: [
            { q: "How many Brazilian creators are listed?", a: "We index nearly 200 verified Brazilian OnlyFans accounts, making it one of our largest Latin American markets. New profiles are added weekly." },
            { q: "Do Brazilian creators post in English?", a: "Many popular Brazilian creators are bilingual or post in English for their international audience. Some post exclusively in Portuguese. Check individual bios for language." },
            { q: "What makes Brazilian creators different?", a: "Cultural confidence, body positivity, high posting frequency, dance/fitness content, and exceptionally engaging personalities. The style is distinctly Brazilian." },
            { q: "Are prices in Brazilian Real?", a: "No — OnlyFans uses USD globally. All prices shown are in US dollars regardless of the creator's home country." },
            { q: "How active are Brazilian accounts?", a: "Very active. Brazilian creators are known for daily posting, responsive messaging, and building genuine subscriber relationships. Activity levels are above the global average." },
        ],
    },
};

// ─── Page component ─────────────────────────────────────────────────────────

export default async function LocationPage({ params, searchParams }: Props) {
    const { country } = await params;
    const sp = await searchParams;

    const loc = LOCATIONS.find((l) => l.slug === country);
    if (!loc) notFound();

    const page = Math.max(1, parseInt(sp.page || "1", 10));
    const offset = (page - 1) * PER_PAGE;
    const content = LOCATION_CONTENT[country] || getDefaultLocationContent(loc.name);

    // Fetch creators from this country with pagination
    let creators: Record<string, unknown>[] = [];
    let totalCount = 0;
    try {
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM creators WHERE country = $1`,
            [country]
        );
        totalCount = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(
            `SELECT * FROM creators WHERE country = $1 ORDER BY subscriber_count DESC LIMIT $2 OFFSET $3`,
            [country, PER_PAGE, offset]
        );
        creators = result.rows;
    } catch {
        // DB not connected yet
    }

    const totalPages = Math.ceil(totalCount / PER_PAGE);

    return (
        <>
            <div className="tag-page-glow" />

            {/* Hero */}
            <section className="tag-hero">
                <div className="tag-hero-inner">
                    <nav className="tag-breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href="/onlyfans/near-me">Near Me</Link>
                        <span>/</span>
                        <span className="tag-breadcrumb-current">{loc.flag} {loc.name}</span>
                    </nav>

                    <h1>{loc.flag} {content.h1}</h1>
                    {totalCount > 0 && (
                        <p className="tag-hero-count">{totalCount.toLocaleString()} creators found</p>
                    )}
                    <p className="tag-hero-intro">{content.intro}</p>
                </div>
            </section>

            {/* Deep Content above grid */}
            <section className="tag-deep-content">
                <div className="tag-deep-inner">
                    <h2>{content.deepTitle}</h2>
                    {content.deepContent.split("\n\n").map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
            </section>

            <section className="tag-deep-content">
                <div className="tag-deep-inner">
                    <h2>{content.expectTitle}</h2>
                    {content.expectContent.split("\n\n").map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
            </section>

            {/* Creators grid */}
            <section className="tag-creators">
                <div className="tag-section-label">
                    <div className="tag-section-accent" />
                    <h2>Browse {loc.name} Creators{page > 1 ? ` — Page ${page}` : ""}</h2>
                </div>

                {creators.length > 0 ? (
                    <div className="tag-grid">
                        {creators.map((creator) => {
                            const username = creator.username as string;
                            const displayName = (creator.display_name as string) || username;
                            const avatarUrl = creator.avatar_url as string;
                            const isFree = creator.is_free as boolean;
                            const price = creator.subscription_price as number;
                            const mediaCount = creator.media_count as number;
                            const likeCount = creator.like_count as number;

                            return (
                                <CreatorCardLink
                                    key={creator.id as number}
                                    href={`https://onlyfans.com/${username}`}
                                    creatorId={creator.id as number}
                                    source={`location-${country}`}
                                    className="tag-card"
                                >
                                    <div className="tag-card-img-wrap">
                                        {avatarUrl ? (
                                            <img className="tag-card-img" src={avatarUrl} alt={displayName} />
                                        ) : (
                                            <div className="tag-card-img-placeholder">
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="tag-card-overlay">
                                            <span className="tag-card-name">{displayName}</span>
                                            <span className={`tag-card-price${isFree ? " tag-card-price-free" : ""}`}>
                                                {isFree ? "FREE" : <>${price}<small>/mo</small></>}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="tag-card-stats">
                                        <span>📸 {mediaCount?.toLocaleString() || "0"}</span>
                                        <span>❤️ {likeCount?.toLocaleString() || "0"}</span>
                                    </div>
                                </CreatorCardLink>
                            );
                        })}
                    </div>
                ) : (
                    <div className="tag-empty">
                        <p>No creators found from {loc.name} yet.</p>
                        <p>Check back soon — we add new profiles every week.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="tag-pagination">
                        {page > 1 ? (
                            <Link href={`/onlyfans/near-me/${country}${page === 2 ? "" : `?page=${page - 1}`}`} className="tag-pagination-btn">
                                ← Previous
                            </Link>
                        ) : (
                            <span />
                        )}
                        <span className="tag-pagination-info">Page {page} of {totalPages}</span>
                        {page < totalPages ? (
                            <Link href={`/onlyfans/near-me/${country}?page=${page + 1}`} className="tag-pagination-btn">
                                Next →
                            </Link>
                        ) : (
                            <span />
                        )}
                    </div>
                )}
            </section>

            {/* FAQ */}
            <section className="faq-section">
                <div className="faq-inner">
                    <h2 className="faq-heading">Frequently Asked Questions</h2>
                    <TagFaq faqs={content.faqs} />
                </div>
            </section>

            {/* Footer */}
            <footer className="site-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <a href="/" className="footer-logo">Lush Finder</a>
                        <p className="footer-tagline">The best OnlyFans search engine for discovering creators.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Browse</h4>
                            <a href="/onlyfans/free">Free OnlyFans</a>
                            <a href="/onlyfans/near-me">Near Me</a>
                            <a href="/onlyfans/blonde">Blonde</a>
                            <a href="/categories">All Categories</a>
                        </div>
                        <div className="footer-col">
                            <h4>Locations</h4>
                            <a href="/onlyfans/near-me/united-states">United States</a>
                            <a href="/onlyfans/near-me/united-kingdom">United Kingdom</a>
                            <a href="/onlyfans/near-me/australia">Australia</a>
                            <a href="/onlyfans/near-me/canada">Canada</a>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <a href="/terms">Terms of Service</a>
                            <a href="/privacy">Privacy Policy</a>
                            <a href="/dmca">DMCA</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Lush Finder. Not affiliated with OnlyFans.</p>
                </div>
            </footer>
        </>
    );
}
