import { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { LOCATIONS } from "@/lib/locations";

export const metadata: Metadata = {
    title: "OnlyFans Creators Near Me | Browse by Country | FindFanz",
    description:
        "Find OnlyFans creators by location. Browse verified creators from the United States, United Kingdom, Canada, Australia and 16 more countries. Real stats, updated weekly.",
    alternates: { canonical: "/onlyfans/near-me" },
    robots: { index: false, follow: true },
};

export const revalidate = 3600;

export default async function NearMeIndexPage() {
    // Fetch creator counts per country
    let countryCounts: Record<string, number> = {};
    try {
        const res = await pool.query(
            `SELECT country, COUNT(*) as cnt FROM creators WHERE country IS NOT NULL AND country != '' GROUP BY country`
        );
        for (const row of res.rows) {
            countryCounts[row.country] = parseInt(row.cnt, 10);
        }
    } catch {
        // DB not connected
    }

    const totalByLocation = Object.values(countryCounts).reduce((a, b) => a + b, 0);

    return (
        <>
            <section className="nearme-hero">
                <div className="nearme-hero-inner">
                    <h1>OnlyFans Creators Near Me</h1>
                    <p className="nearme-hero-sub">
                        Browse {totalByLocation > 0 ? totalByLocation.toLocaleString() : "5,000"}+ OnlyFans creators by country.
                        Every location page shows verified profiles with real subscriber counts, media uploads, and pricing — updated weekly.
                    </p>
                    <div className="nearme-hero-stats">
                        <div className="nearme-stat">
                            <span className="nearme-stat-num">{LOCATIONS.length}</span>
                            <span className="nearme-stat-label">Countries</span>
                        </div>
                        <div className="nearme-stat">
                            <span className="nearme-stat-num">{totalByLocation > 0 ? `${Math.floor(totalByLocation / 1000)}K+` : "5K+"}</span>
                            <span className="nearme-stat-label">Creators</span>
                        </div>
                        <div className="nearme-stat">
                            <span className="nearme-stat-num">Weekly</span>
                            <span className="nearme-stat-label">Updates</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="nearme-grid-section">
                <div className="nearme-section-inner">
                    <h2 className="nearme-section-title">Browse by Country</h2>
                    <p className="nearme-section-sub">Select a country to see all verified OnlyFans creators based there.</p>

                    <div className="nearme-grid">
                        {LOCATIONS.map((loc) => {
                            const count = countryCounts[loc.name] || 0;
                            return (
                                <Link
                                    key={loc.slug}
                                    href={`/onlyfans/near-me/${loc.slug}`}
                                    className="nearme-card"
                                >
                                    <span className="nearme-card-flag">{loc.flag}</span>
                                    <div className="nearme-card-info">
                                        <span className="nearme-card-name">{loc.name}</span>
                                        {count > 0 && (
                                            <span className="nearme-card-count">{count.toLocaleString()} creators</span>
                                        )}
                                    </div>
                                    <span className="nearme-card-arrow">→</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="nearme-content">
                <div className="nearme-section-inner">
                    <h2>Why Browse OnlyFans by Location?</h2>
                    <p>
                        Location-based browsing is one of the most popular ways to discover OnlyFans creators. Whether you want to support local creators, find someone in your timezone for live content, or are attracted to the aesthetics of a specific country, filtering by location gives you a curated selection that generic search can&apos;t provide.
                    </p>

                    <h3>Timezone Benefits</h3>
                    <p>
                        Creators in your timezone post during your waking hours, respond to messages faster, and schedule live content when you&apos;re actually available to watch. If interaction matters to you — DMs, live streams, custom requests — finding creators near you makes a real difference to the experience.
                    </p>

                    <h3>How We Determine Location</h3>
                    <p>
                        Location data comes directly from each creator&apos;s OnlyFans profile. Creators self-report their location on the platform, and we index it during our weekly data refresh. Most creators list their accurate location, though some may list a different country for privacy. The data always reflects what&apos;s on their official profile.
                    </p>

                    <h3>What You&apos;ll Find on Each Country Page</h3>
                    <p>
                        Every country page shows a paginated grid of verified creators sorted by popularity. Each card displays their avatar, display name, subscription price, media count, and like count — giving you all the information you need to decide before clicking through to their OnlyFans profile.
                    </p>
                </div>
            </section>
        </>
    );
}
