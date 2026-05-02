import { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { INDEXABLE_TAGS } from "@/lib/config";
import { LOCATIONS } from "@/lib/locations";
import CategoriesFaq from "@/components/CategoriesFaq";

export const metadata: Metadata = {
    title: "All OnlyFans Categories – Browse by Niche | OF Directory",
    description:
        "Browse all OnlyFans categories alphabetically. Find creators by type — free, blonde, brunette, latina, asian, goth, fitness, and 25+ more categories with real stats.",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const TAG_EMOJIS: Record<string, string> = {
    asian: "🌸",
    "big-ass": "🍑",
    "big-boobs": "🍒",
    blonde: "👱‍♀️",
    brunette: "👩",
    cosplay: "🎭",
    curvy: "💃",
    ebony: "👑",
    fitness: "💪",
    free: "🆓",
    goth: "🖤",
    latina: "🌶️",
    lingerie: "👙",
    milf: "🔥",
    "near-me": "📍",
    new: "🆕",
    petite: "🦋",
    popular: "⭐",
    redhead: "🧑‍🦰",
    teen: "✨",
    threesome: "👥",
    trans: "🏳️‍⚧️",
};

export default async function CategoriesPage() {
    const result = await pool.query(
        "SELECT name, slug, creator_count FROM tags ORDER BY name ASC"
    );
    const allTags = result.rows as { name: string; slug: string; creator_count: number }[];
    const tags = allTags.filter((t) => INDEXABLE_TAGS.includes(t.slug));

    const totalCreators = tags.reduce((sum, t) => sum + t.creator_count, 0);

    return (
        <>
            <main className="categories-page">
                <section className="categories-hero">
                    <h1>Search OnlyFans by Category — Discover 25+ Niches</h1>
                    <p className="categories-hero-sub">
                        The most comprehensive OnlyFans directory on the web. Browse creators by appearance, content type, or price — every profile includes real stats pulled directly from OnlyFans.
                    </p>
                </section>

                <section className="categories-list">
                    <a href="/onlyfans/near-me" className="category-row category-row-featured">
                        <span className="category-emoji">📍</span>
                        <span className="category-name">Near Me</span>
                    </a>
                    {tags.filter((t) => t.slug !== "near-me").map((tag) => (
                        <a key={tag.slug} href={`/onlyfans/${tag.slug}`} className="category-row">
                            <span className="category-emoji">{TAG_EMOJIS[tag.slug] || "📂"}</span>
                            <span className="category-name">{tag.name}</span>
                        </a>
                    ))}
                </section>

                {/* SEO Content */}
                <section className="seo-content" style={{ padding: "48px 20px 0" }}>
                    <h2>Browse OnlyFans by Category</h2>
                    <p>
                        OF Directory organises over 13,000 OnlyFans creators into {tags.length} searchable categories.
                        Whether you&apos;re looking for free accounts, specific appearance types, or niche content —
                        every category page shows real stats pulled directly from OnlyFans including photo counts,
                        video counts, likes, and subscription prices.
                    </p>
                    <p>
                        Each category is sorted alphabetically so you can quickly find what you&apos;re looking for.
                        Click any category to see a full grid of creators with their real subscription price,
                        content count, and a direct link to their OnlyFans page. All data is updated weekly.
                    </p>
                    <p>
                        Can&apos;t find what you need? Use the search bar in the hero section to search by name or keyword.
                        Our directory covers every major OnlyFans niche — from <a href="/onlyfans/blonde">Blonde</a> and <a href="/onlyfans/latina">Latina</a> to <a href="/onlyfans/milf">MILF</a> and <a href="/onlyfans/cosplay">Cosplay</a>.
                    </p>
                </section>

                {/* Location flags */}
                <section className="location-flags-section">
                    <h2>Browse OnlyFans by Location</h2>
                    <p>Find creators near you — browse by country to see all OnlyFans accounts from that region.</p>
                    <div className="location-flags">
                        {LOCATIONS.map((loc) => (
                            <Link key={loc.slug} href={`/onlyfans/near-me/${loc.slug}`} className="location-flag-item">
                                <span className="location-flag-emoji">{loc.flag}</span>
                                <span className="location-flag-name">{loc.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            {/* FAQ */}
            <section className="faq-section">
                <div className="faq-inner">
                    <h2 className="faq-heading">Categories FAQ</h2>
                    <CategoriesFaq />
                </div>
            </section>

            {/* Footer */}
            <footer className="site-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <a href="/" className="footer-logo">OF Directory</a>
                        <p className="footer-tagline">The best OnlyFans search engine for discovering creators.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Browse</h4>
                            <a href="/onlyfans/free">Free OnlyFans</a>
                            <a href="/onlyfans/latina">Latina</a>
                            <a href="/onlyfans/blonde">Blonde</a>
                            <a href="/categories">All Categories</a>
                            <a href="/about">About</a>
                        </div>
                        <div className="footer-col">
                            <h4>Popular</h4>
                            <a href="/onlyfans/milf">MILF</a>
                            <a href="/onlyfans/asian">Asian</a>
                            <a href="/onlyfans/ebony">Ebony</a>
                            <a href="/onlyfans/big-boobs">Big Boobs</a>
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
                    <p>&copy; {new Date().getFullYear()} OF Directory. Not affiliated with OnlyFans.</p>
                </div>
            </footer>
        </>
    );
}
