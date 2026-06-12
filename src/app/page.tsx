import pool from "@/lib/db";
import SearchClient from "@/components/SearchClient";
import Link from "next/link";
import { proxyAvatarUrl } from "@/lib/avatars";
import QuizClient from "@/components/QuizClient";
import CompareClient from "@/components/CompareClient";
import { LOCATIONS } from "@/lib/locations";
import HomeFaq from "@/components/HomeFaq";

export default async function HomePage() {
  let featuredCreators: Record<string, unknown>[] = [];
  let freeCreators: Record<string, unknown>[] = [];
  let totalCreatorCount = 0;

  try {
    const featuredResult = await pool.query(
      `SELECT * FROM creators WHERE avatar_url IS NOT NULL AND avatar_url != '' AND like_count > 0 ORDER BY like_count DESC NULLS LAST LIMIT 18`
    );
    featuredCreators = featuredResult.rows;
    const freeResult = await pool.query(
      `SELECT * FROM creators WHERE is_free = true AND avatar_url IS NOT NULL AND avatar_url != '' ORDER BY like_count DESC NULLS LAST LIMIT 12`
    );
    freeCreators = freeResult.rows;
    const countResult = await pool.query(`SELECT COUNT(*) FROM creators`);
    totalCreatorCount = parseInt(countResult.rows[0].count, 10);
  } catch {
    // DB not connected
  }

  const creatorDisplay = totalCreatorCount > 0
    ? `${Math.floor(totalCreatorCount / 1000).toLocaleString()}K+`
    : "50,000+";

  const CATEGORIES = [
    { slug: "free", label: "Free", emoji: "🆓" },
    { slug: "blonde", label: "Blonde", emoji: "👱" },
    { slug: "brunette", label: "Brunette", emoji: "👩" },
    { slug: "redhead", label: "Redhead", emoji: "🧑‍🦰" },
    { slug: "asian", label: "Asian", emoji: "🌸" },
    { slug: "latina", label: "Latina", emoji: "🌶️" },
    { slug: "ebony", label: "Ebony", emoji: "👑" },
    { slug: "milf", label: "MILF", emoji: "🔥" },
    { slug: "teen", label: "Teen (18+)", emoji: "✨" },
    { slug: "big-boobs", label: "Big Boobs", emoji: "🍒" },
    { slug: "petite", label: "Petite", emoji: "🦋" },
    { slug: "curvy", label: "Curvy", emoji: "🍑" },
    { slug: "fitness", label: "Fitness", emoji: "💪" },
    { slug: "cosplay", label: "Cosplay", emoji: "🎭" },
    { slug: "goth", label: "Goth", emoji: "🖤" },
    { slug: "trans", label: "Trans", emoji: "🏳️‍⚧️" },
    { slug: "threesome", label: "Threesome", emoji: "👥" },
    { slug: "lingerie", label: "Lingerie", emoji: "👙" },
  ];

  return (
    <>
      {/* ── Hero with Search ── */}
      <section className="hp-hero">
        <div className="hp-hero-inner">
          <h1 className="hp-hero-title">
            OnlyFans<br />
            <span className="hp-hero-highlight">Search Engine</span>
          </h1>
          <p className="hp-hero-sub">
            Search {creatorDisplay} creators by name, category, price, or location. Free to browse.
          </p>
          <SearchClient />
          <div className="hp-hero-pills">
            <Link href="/onlyfans/near-me" className="hp-pill">📍 Near Me</Link>
            <Link href="/onlyfans/free" className="hp-pill">🆓 Free</Link>
            <Link href="/onlyfans/blonde" className="hp-pill">👱 Blonde</Link>
            <Link href="/onlyfans/latina" className="hp-pill">🌶️ Latina</Link>
            <Link href="/onlyfans/milf" className="hp-pill">🔥 MILF</Link>
            <Link href="/categories" className="hp-pill hp-pill-more">All Categories →</Link>
          </div>
        </div>
      </section>

      {/* ── Featured Creators ── */}
      {featuredCreators.length > 0 && (
        <section className="hp-featured">
          <div className="hp-section-inner">
            <h2 className="hp-section-title">Trending Creators</h2>
            <p className="hp-section-sub">The most popular OnlyFans accounts right now — real stats, updated weekly.</p>
            <div className="hp-featured-grid">
              {featuredCreators.map((creator) => {
                const username = creator.username as string;
                const displayName = (creator.display_name as string) || username;
                const avatarUrl = proxyAvatarUrl(creator.avatar_url as string);
                const isFree = creator.is_free as boolean;
                const price = creator.subscription_price as number;
                const mediaCount = creator.media_count as number;
                const likeCount = creator.like_count as number;

                return (
                  <Link key={creator.id as number} href={`/onlyfans/creator/${username}`} className="hp-featured-card">
                    <div className="hp-featured-img">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} />
                      ) : (
                        <div className="hp-featured-placeholder">{displayName.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <div className="hp-featured-body">
                      <span className="hp-featured-name">{displayName}</span>
                      <span className="hp-featured-handle">@{username}</span>
                      <div className="hp-featured-meta">
                        <span className={`hp-featured-price${isFree ? " hp-featured-price-free" : ""}`}>
                          {isFree ? "FREE" : `$${price}/mo`}
                        </span>
                        <span className="hp-featured-stat">📸 {mediaCount?.toLocaleString() || "0"}</span>
                        <span className="hp-featured-stat">❤️ {likeCount?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Quiz Tool ── */}
      <section className="hp-tool-section" id="quiz">
        <div className="hp-section-inner">
          <div className="hp-tool-header">
            <span className="hp-tool-badge">🎯 Interactive Tool</span>
            <h2 className="hp-section-title">Find Your Perfect Creator</h2>
            <p className="hp-section-sub">Answer 5 quick questions and get personalised recommendations instantly.</p>
          </div>
          <div className="hp-tool-card">
            <QuizClient />
          </div>
        </div>
      </section>

      {/* ── Categories Grid ── */}
      <section className="hp-categories">
        <div className="hp-section-inner">
          <h2 className="hp-section-title">Browse OnlyFans by Category</h2>
          <p className="hp-section-sub">Jump straight into the most popular OnlyFans categories.</p>
          <div className="hp-cat-grid">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/onlyfans/${cat.slug}`} className="hp-cat-card">
                <span className="hp-cat-emoji">{cat.emoji}</span>
                <span className="hp-cat-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free Creators ── */}
      {freeCreators.length > 0 && (
        <section className="hp-free">
          <div className="hp-section-inner">
            <h2 className="hp-section-title">Free OnlyFans Accounts</h2>
            <p className="hp-section-sub">Subscribe without paying a penny. Real stats from the platform.</p>
            <div className="hp-creator-grid">
              {freeCreators.map((creator) => {
                const username = creator.username as string;
                const displayName = (creator.display_name as string) || username;
                const avatarUrl = proxyAvatarUrl(creator.avatar_url as string);
                const mediaCount = creator.media_count as number;
                const likeCount = creator.like_count as number;

                return (
                  <Link key={creator.id as number} href={`/onlyfans/creator/${username}`} className="hp-creator-card">
                    <div className="hp-creator-avatar">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} />
                      ) : (
                        <div className="hp-creator-placeholder">{displayName.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <span className="hp-creator-badge">Free</span>
                    <div className="hp-creator-info">
                      <span className="hp-creator-name">{displayName}</span>
                      <span className="hp-creator-handle">@{username}</span>
                      <div className="hp-creator-stats">
                        <span>📸 {mediaCount?.toLocaleString() || "0"}</span>
                        <span>❤️ {likeCount?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="hp-section-cta">
              <Link href="/onlyfans/free" className="hp-btn">View All Free Accounts →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Compare Tool ── */}
      <section className="hp-tool-section hp-tool-section-alt" id="compare">
        <div className="hp-section-inner">
          <div className="hp-tool-header">
            <span className="hp-tool-badge">⚖️ Compare Tool</span>
            <h2 className="hp-section-title">Compare Two Creators</h2>
            <p className="hp-section-sub">See who offers more content, better pricing, and higher engagement — side by side.</p>
          </div>
          <div className="hp-tool-card">
            <CompareClient />
          </div>
        </div>
      </section>

      {/* ── Browse by Location ── */}
      <section className="hp-locations">
        <div className="hp-section-inner">
          <h2 className="hp-section-title">OnlyFans Creators by Country</h2>
          <p className="hp-section-sub">Find creators near you. Tap any country to explore.</p>
          <div className="hp-location-grid">
            {LOCATIONS.map((loc) => (
              <Link key={loc.slug} href={`/onlyfans/near-me/${loc.slug}`} className="hp-location-card">
                <span className="hp-location-flag">{loc.flag}</span>
                <span className="hp-location-name">{loc.name}</span>
              </Link>
            ))}
          </div>
          <div className="hp-section-cta">
            <Link href="/onlyfans/near-me" className="hp-btn">Browse All Locations →</Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="hp-how">
        <div className="hp-section-inner">
          <h2 className="hp-section-title">How to Find OnlyFans Creators</h2>
          <div className="hp-how-steps">
            <div className="hp-how-step">
              <div className="hp-how-num">1</div>
              <h3>Search or Browse</h3>
              <p>Use the search bar for a specific name, or explore our curated categories and location filters.</p>
            </div>
            <div className="hp-how-step">
              <div className="hp-how-num">2</div>
              <h3>Compare Stats</h3>
              <p>See real subscriber counts, media uploads, pricing, and engagement — no guesswork.</p>
            </div>
            <div className="hp-how-step">
              <div className="hp-how-num">3</div>
              <h3>Subscribe</h3>
              <p>Click through to their OnlyFans profile and subscribe directly on the platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="hp-content">
        <div className="hp-section-inner">
          <h2>OnlyFans Search Engine — Find Creators Fast</h2>
          <p>
            FindFanz is the fastest way to search OnlyFans. The platform itself has no category system, no price filters, and no way to compare creators side by side.
            We solve all three problems. Our search engine indexes {creatorDisplay} verified profiles with real stats pulled weekly from OnlyFans — subscriber counts,
            media uploads, like counts, and exact subscription prices. Browse for free, no account required.
          </p>

          <h3>Why OnlyFans Needs a Search Engine</h3>
          <p>
            OnlyFans doesn&apos;t want you browsing — they want you subscribing to creators you already follow on social media. There&apos;s no explore page, no recommended feed, no way to discover new accounts on the platform itself.
            That&apos;s by design. But for subscribers who want to find the best value, compare options, or explore new categories, it&apos;s a problem. FindFanz bridges that gap with transparent data and real tools.
          </p>

          <h3>Real Data, Not Fake Reviews</h3>
          <p>
            Every stat on FindFanz comes directly from the OnlyFans platform. We don&apos;t accept paid placements, we don&apos;t fabricate subscriber counts, and we don&apos;t write fake reviews.
            What you see is what the creator has — verified weekly. Media counts tell you how much content you&apos;ll get. Like counts tell you how engaged their audience is. Price tells you exactly what you&apos;ll pay.
          </p>

          <h3>Tools That Actually Help You Decide</h3>
          <p>
            Our <Link href="#quiz">Creator Quiz</Link> matches you with categories based on your actual preferences — not random suggestions.
            The <Link href="#compare">Compare Tool</Link> lets you put two creators side by side and see who delivers more content, better engagement, and fairer pricing.
            These aren&apos;t gimmicks — they&apos;re the tools OnlyFans should have built but never will.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hp-faq">
        <div className="hp-section-inner">
          <h2 className="hp-section-title">Frequently Asked Questions</h2>
          <HomeFaq />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="/" className="footer-logo">FindFanz</a>
            <p className="footer-tagline">The free OnlyFans search engine. {creatorDisplay} creators indexed.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Discover</h4>
              <a href="/onlyfans/near-me">Near Me</a>
              <a href="/onlyfans/free">Free OnlyFans</a>
              <a href="/categories">All Categories</a>
              <a href="/about">About</a>
            </div>
            <div className="footer-col">
              <h4>Categories</h4>
              <a href="/onlyfans/latina">Latina</a>
              <a href="/onlyfans/ebony">Ebony</a>
              <a href="/onlyfans/asian">Asian</a>
              <a href="/onlyfans/milf">MILF</a>
              <a href="/onlyfans/blonde">Blonde</a>
            </div>
            <div className="footer-col">
              <h4>Locations</h4>
              <a href="/onlyfans/near-me/united-states">United States</a>
              <a href="/onlyfans/near-me/united-kingdom">United Kingdom</a>
              <a href="/onlyfans/near-me/canada">Canada</a>
              <a href="/onlyfans/near-me/australia">Australia</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/dmca">DMCA</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FindFanz. Not affiliated with OnlyFans.</p>
        </div>
      </footer>
    </>
  );
}
