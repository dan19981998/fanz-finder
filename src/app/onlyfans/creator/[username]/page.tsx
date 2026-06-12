import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { proxyAvatarUrl } from "@/lib/avatars";
import CreatorCardLink from "@/components/CreatorCardLink";

interface Props {
    params: Promise<{ username: string }>;
}

interface Creator {
    id: number;
    username: string;
    display_name: string;
    bio: string;
    avatar_url: string;
    banner_url: string;
    subscription_price: number;
    is_free: boolean;
    post_count: number;
    media_count: number;
    photo_count: number;
    video_count: number;
    like_count: number;
    subscriber_count: number;
    location: string;
    country: string;
    city: string;
    last_scraped_at: string;
    created_at: string;
    traits: Record<string, string> | null;
}

const TRAIT_LABELS: Record<string, string> = {
    ethnicity: "Ethnicity",
    bodyType: "Body Type",
    breasts: "Breasts",
    hairColor: "Hair Color",
    hairLength: "Hair Length",
    style: "Style",
    age: "Age",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function calculatePopularity(creator: Creator): number {
    const likeScore = Math.min(creator.like_count / 100000, 4);
    const mediaScore = Math.min(creator.media_count / 1000, 3);
    const subScore = Math.min(creator.subscriber_count / 10000, 2);
    const postScore = Math.min(creator.post_count / 500, 1);
    const raw = likeScore + mediaScore + subScore + postScore;
    return Math.min(Math.round(raw * 10) / 10, 10);
}

function formatCount(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return n.toLocaleString();
}

function generateAbout(creator: Creator, tags: { name: string; slug: string }[]): string {
    const name = creator.display_name || creator.username;
    const parts: string[] = [];

    // Opening line
    let opening = `${name} is an OnlyFans creator`;
    if (creator.location || creator.city || creator.country) {
        const loc = creator.city || creator.location || creator.country;
        opening += ` based in ${loc}`;
    }
    opening += ".";
    parts.push(opening);

    // Price info
    if (creator.is_free) {
        parts.push(`Their OnlyFans subscription is free to join.`);
    } else if (creator.subscription_price > 0) {
        parts.push(`Their OnlyFans subscription costs $${creator.subscription_price} per month.`);
    }

    // Content stats
    if (creator.photo_count > 0 || creator.video_count > 0) {
        const contentParts: string[] = [];
        if (creator.photo_count > 0) contentParts.push(`${formatCount(creator.photo_count)} photos`);
        if (creator.video_count > 0) contentParts.push(`${formatCount(creator.video_count)} videos`);
        parts.push(`${name} has posted ${contentParts.join(" and ")} on their OnlyFans page.`);
    }

    // Likes
    if (creator.like_count > 0) {
        parts.push(`Their content has received ${formatCount(creator.like_count)} likes from subscribers.`);
    }

    // Categories
    if (tags.length > 0) {
        const tagNames = tags.map(t => t.name).join(", ");
        parts.push(`${name} is categorised under ${tagNames}.`);
    }

    // Join date
    if (creator.created_at) {
        const date = new Date(creator.created_at);
        const month = date.toLocaleString("en-US", { month: "long" });
        const year = date.getFullYear();
        parts.push(`${name} was added to our directory in ${month} ${year}.`);
    }

    return parts.join(" ");
}

function generateFaqs(creator: Creator, tags: { name: string; slug: string }[]): { q: string; a: string }[] {
    const name = creator.display_name || creator.username;
    const faqs: { q: string; a: string }[] = [];

    // Location
    if (creator.location || creator.country) {
        const loc = creator.city || creator.location || creator.country;
        faqs.push({
            q: `Where is @${creator.username} from?`,
            a: `${name} (@${creator.username}) is based in ${loc}.`,
        });
    }

    // Price
    faqs.push({
        q: `How much does @${creator.username} cost on OnlyFans?`,
        a: creator.is_free
            ? `@${creator.username}'s OnlyFans is completely free to subscribe to.`
            : `@${creator.username}'s OnlyFans subscription costs $${creator.subscription_price} per month.`,
    });

    // Worth it
    const popScore = calculatePopularity(creator);
    faqs.push({
        q: `Is @${creator.username}'s OnlyFans worth it?`,
        a: `@${creator.username} has a Popularity Score of ${popScore} / 10 on ${SITE_NAME}, based on combined likes, subscribers and content volume. @${creator.username}'s OnlyFans has ${formatCount(creator.like_count)} total likes and ${formatCount(creator.media_count)} media posts priced at ${creator.is_free ? "free" : `$${creator.subscription_price}/mo`}. Browse their stats above and similar creators below to decide whether their content matches your taste before subscribing.`,
    });

    // Content count
    if (creator.photo_count > 0 || creator.video_count > 0) {
        faqs.push({
            q: `How many photos and videos does @${creator.username} post?`,
            a: `@${creator.username} has ${creator.photo_count.toLocaleString()} photos and ${creator.video_count.toLocaleString()} videos on their OnlyFans page.`,
        });
    }

    // Categories
    if (tags.length > 0) {
        const tagNames = tags.map(t => t.name).join(", ");
        faqs.push({
            q: `What categories does @${creator.username} belong to?`,
            a: `@${creator.username} is listed under the following categories: ${tagNames}. Browse these categories to find similar creators.`,
        });
    }

    // Similar creators
    faqs.push({
        q: `How can I find creators similar to @${creator.username}?`,
        a: `Scroll down to the "Similar Creators" section below — ${SITE_NAME} matches creators to @${creator.username} by category${creator.country ? ", location" : ""} and content style. You can also explore the category tags on this profile to browse matching creators.`,
    });

    // Free question
    if (creator.is_free) {
        faqs.push({
            q: `Is @${creator.username} really free on OnlyFans?`,
            a: `Yes, @${creator.username} offers a free OnlyFans subscription. You can follow and browse their content without entering payment details. Some content may be available via pay-per-view messages.`,
        });
    }

    return faqs;
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    const result = await pool.query(
        `SELECT display_name, username, bio, subscription_price, is_free, location, country, traits FROM creators WHERE username = $1`,
        [username]
    );
    if (result.rows.length === 0) return {};
    const c = result.rows[0] as Creator;
    const name = c.display_name || c.username;
    const price = c.is_free ? "Free" : `$${c.subscription_price}/mo`;
    const loc = c.location || c.country || "";
    const hasTraits = c.traits && Object.keys(c.traits).length > 1;

    return {
        title: `${name} OnlyFans — ${price}${loc ? ` | ${loc}` : ""} | ${SITE_NAME}`,
        description: `${name} (@${c.username}) OnlyFans profile — ${price}. View stats, content count, photos, videos, and similar creators.${loc ? ` Based in ${loc}.` : ""}`,
        alternates: { canonical: `/onlyfans/creator/${c.username}` },
        ...(hasTraits ? {} : { robots: { index: false, follow: true } }),
    };
}

export const revalidate = 3600;

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function CreatorProfilePage({ params }: Props) {
    const { username } = await params;

    // Fetch creator
    const result = await pool.query(
        `SELECT * FROM creators WHERE username = $1`,
        [username]
    );
    if (result.rows.length === 0) notFound();
    const creator = result.rows[0] as Creator;

    // Fetch tags for this creator
    const tagsResult = await pool.query(
        `SELECT t.name, t.slug FROM tags t
     JOIN creator_tags ct ON ct.tag_id = t.id
     WHERE ct.creator_id = $1`,
        [creator.id]
    );
    const tags = tagsResult.rows as { name: string; slug: string }[];

    // Fetch similar creators
    let similarCreators: Record<string, unknown>[] = [];
    if (tags.length > 0) {
        const simResult = await pool.query(
            `SELECT DISTINCT c.* FROM creators c
       JOIN creator_tags ct ON ct.creator_id = c.id
       WHERE ct.tag_id IN (SELECT tag_id FROM creator_tags WHERE creator_id = $1)
       AND c.id != $1
       ORDER BY c.like_count DESC
       LIMIT 12`,
            [creator.id]
        );
        similarCreators = simResult.rows;
    }

    if (similarCreators.length === 0 && creator.country) {
        const simResult = await pool.query(
            `SELECT * FROM creators WHERE country = $1 AND id != $2 ORDER BY like_count DESC LIMIT 12`,
            [creator.country, creator.id]
        );
        similarCreators = simResult.rows;
    }

    if (similarCreators.length === 0) {
        const simResult = await pool.query(
            `SELECT * FROM creators WHERE id != $1 ORDER BY like_count DESC LIMIT 12`,
            [creator.id]
        );
        similarCreators = simResult.rows;
    }

    const displayName = creator.display_name || creator.username;
    const price = creator.is_free ? "Free" : `$${creator.subscription_price}/mo`;
    const popScore = calculatePopularity(creator);
    const aboutText = generateAbout(creator, tags);
    const faqs = generateFaqs(creator, tags);

    // JSON-LD structured data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
            "@type": "Person",
            name: displayName,
            url: `${SITE_URL}/onlyfans/creator/${creator.username}`,
            image: proxyAvatarUrl(creator.avatar_url) || undefined,
            description: aboutText,
            sameAs: `https://onlyfans.com/${creator.username}`,
        },
    };

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            {/* Banner */}
            <section className="profile-banner">
                {creator.banner_url && (
                    <img src={creator.banner_url} alt="" className="profile-banner-img" />
                )}
                <div className="profile-banner-overlay" />
            </section>

            {/* Profile Header */}
            <section className="profile-header">
                <div className="profile-header-inner">
                    <div className="profile-avatar-wrap">
                        {creator.avatar_url ? (
                            <img src={proxyAvatarUrl(creator.avatar_url)} alt={displayName} className="profile-avatar" />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="profile-info">
                        <h1>{displayName}</h1>
                        <p className="profile-username">@{creator.username}</p>

                        {(creator.location || creator.country) && (
                            <p className="profile-location">
                                📍 <Link href={creator.country ? `/onlyfans/near-me/${creator.country.toLowerCase().replace(/\s+/g, "-")}` : "#"}>
                                    {creator.location || creator.country}
                                </Link>
                            </p>
                        )}

                        <div className="profile-price-badge-wrap">
                            <span className={`profile-price-badge${creator.is_free ? " profile-price-free" : ""}`}>
                                {creator.is_free ? "FREE" : `$${creator.subscription_price}/mo`}
                            </span>
                        </div>

                        {/* Popularity Score */}
                        <div className="profile-popularity">
                            <span className="profile-popularity-score">{popScore}</span>
                            <span className="profile-popularity-label">/ 10 Popularity Score</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="profile-stats">
                <div className="profile-stats-inner">
                    <div className="profile-stat">
                        <span className="profile-stat-value">{formatCount(creator.photo_count)}</span>
                        <span className="profile-stat-label">Photos</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-value">{formatCount(creator.video_count)}</span>
                        <span className="profile-stat-label">Videos</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-value">{formatCount(creator.like_count)}</span>
                        <span className="profile-stat-label">Likes</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-value">{formatCount(creator.media_count)}</span>
                        <span className="profile-stat-label">Media</span>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="profile-bio">
                <div className="profile-bio-inner">
                    <h2>About @{creator.username}</h2>
                    <p>{aboutText}</p>
                    {creator.bio && (
                        <>
                            <h3>Creator Bio</h3>
                            <p className="profile-bio-raw">{creator.bio}</p>
                        </>
                    )}
                </div>
            </section>

            {/* Body Type & Traits */}
            {creator.traits && Object.keys(creator.traits).length > 1 && (
                <section className="profile-traits">
                    <div className="profile-traits-inner">
                        <h2>Body Type &amp; Traits</h2>
                        <div className="profile-traits-grid">
                            {Object.entries(creator.traits).map(([key, value]) => {
                                const label = TRAIT_LABELS[key] || key;
                                if (!value || value === '') return null;
                                return (
                                    <div key={key} className="profile-trait">
                                        <span className="profile-trait-label">{label}</span>
                                        <span className="profile-trait-value">{value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Tags / Categories */}
            {tags.length > 0 && (
                <section className="profile-tags">
                    <div className="profile-tags-inner">
                        <h2>Categories</h2>
                        <div className="profile-tags-list">
                            {tags.map((tag) => (
                                <Link key={tag.slug} href={`/onlyfans/${tag.slug}`} className="profile-tag-pill">
                                    {tag.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="profile-cta">
                <div className="profile-cta-inner">
                    <CreatorCardLink
                        href={`https://onlyfans.com/${creator.username}`}
                        creatorId={creator.id}
                        source="profile"
                        className="profile-cta-btn"
                        external
                    >
                        Visit {displayName} on OnlyFans →
                    </CreatorCardLink>
                    <p className="profile-cta-sub">
                        {creator.is_free
                            ? "Free to subscribe — no payment required"
                            : `Subscribe for ${price}`}
                    </p>
                </div>
            </section>

            {/* FAQs */}
            <section className="profile-faq">
                <div className="profile-faq-inner">
                    <h2>Frequently Asked Questions about @{creator.username}&apos;s OnlyFans</h2>
                    <div className="profile-faq-list">
                        {faqs.map((faq, i) => (
                            <details key={i} className="profile-faq-item">
                                <summary>{`${i + 1}. ${faq.q}`}</summary>
                                <p>{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Similar Creators */}
            {similarCreators.length > 0 && (
                <section className="profile-similar">
                    <div className="profile-similar-inner">
                        <h2>Similar Creators</h2>
                        <div className="tag-grid">
                            {similarCreators.map((sim) => {
                                const sUsername = sim.username as string;
                                const sDisplayName = (sim.display_name as string) || sUsername;
                                const sAvatarUrl = proxyAvatarUrl(sim.avatar_url as string);
                                const sIsFree = sim.is_free as boolean;
                                const sPrice = sim.subscription_price as number;
                                const sMediaCount = sim.media_count as number;
                                const sLikeCount = sim.like_count as number;
                                const sBio = sim.bio as string;

                                return (
                                    <Link
                                        key={sim.id as number}
                                        href={`/onlyfans/creator/${sUsername}`}
                                        className="tag-card tag-card-with-bio"
                                    >
                                        <div className="tag-card-img-wrap">
                                            {sAvatarUrl ? (
                                                <img className="tag-card-img" src={sAvatarUrl} alt={sDisplayName} />
                                            ) : (
                                                <div className="tag-card-img-placeholder">
                                                    {sDisplayName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="tag-card-overlay">
                                                <span className="tag-card-name">{sDisplayName}</span>
                                                <span className={`tag-card-price${sIsFree ? " tag-card-price-free" : ""}`}>
                                                    {sIsFree ? "FREE" : <>${sPrice}<small>/mo</small></>}
                                                </span>
                                            </div>
                                        </div>
                                        {sBio && (
                                            <p className="tag-card-bio">{sBio.slice(0, 120)}{sBio.length > 120 ? "..." : ""}</p>
                                        )}
                                        <div className="tag-card-stats">
                                            <span>📸 {sMediaCount?.toLocaleString() || "0"}</span>
                                            <span>❤️ {sLikeCount?.toLocaleString() || "0"}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Related Links */}
            <section className="profile-related-links">
                <div className="profile-related-links-inner">
                    <p>
                        Looking for more creators like @{creator.username}? Browse{" "}
                        {creator.country && (
                            <><Link href={`/onlyfans/near-me/${creator.country.toLowerCase().replace(/\s+/g, "-")}`}>{creator.country} OnlyFans creators</Link> · </>
                        )}
                        {tags.slice(0, 3).map((tag, i) => (
                            <span key={tag.slug}>
                                <Link href={`/onlyfans/${tag.slug}`}>{tag.name} OnlyFans</Link>
                                {i < Math.min(tags.length, 3) - 1 ? " · " : ""}
                            </span>
                        ))}
                        {tags.length > 0 && " · "}
                        <Link href="/onlyfans/free">Free OnlyFans creators</Link>
                        {" · "}
                        <Link href="/categories">All Categories</Link>
                    </p>
                </div>
            </section>

            {/* Breadcrumb */}
            <section className="profile-breadcrumb">
                <div className="profile-breadcrumb-inner">
                    <Link href="/">Home</Link>
                    <span>›</span>
                    {tags.length > 0 && (
                        <>
                            <Link href={`/onlyfans/${tags[0].slug}`}>{tags[0].name}</Link>
                            <span>›</span>
                        </>
                    )}
                    <span>{displayName}</span>
                </div>
            </section>
        </>
    );
}
