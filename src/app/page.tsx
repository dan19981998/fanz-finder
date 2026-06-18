import pool from "@/lib/db";
import SearchClient from "@/components/SearchClient";
import Link from "next/link";
import { proxyAvatarUrl } from "@/lib/avatars";
import QuizClient from "@/components/QuizClient";
import CompareClient from "@/components/CompareClient";
import ToolsHub from "@/components/ToolsHub";
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

      {/* ── More Tools ── */}
      <section className="hp-tool-section" id="tools">
        <div className="hp-section-inner">
          <div className="hp-tool-header">
            <span className="hp-tool-badge">🛠️ More Tools</span>
            <h2 className="hp-section-title">OnlyFans Discovery Tools</h2>
            <p className="hp-section-sub">Budget planning, value rankings, watchlists, and random discovery — all free.</p>
          </div>
          <ToolsHub />
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
            Our <Link href="/tools#quiz">Creator Quiz</Link> matches you with categories based on your actual preferences — not random suggestions.
            The <Link href="/tools#compare">Compare Tool</Link> lets you put two creators side by side and see who delivers more content, better engagement, and fairer pricing.
            The <Link href="/tools#budget">Budget Calculator</Link> optimises your monthly spending across multiple subscriptions.
            These aren&apos;t gimmicks — they&apos;re the tools OnlyFans should have built but never will.
          </p>

          <h3>Search OnlyFans by Category</h3>
          <p>
            Browse creators by niche — from <Link href="/onlyfans/blonde">blonde</Link> and <Link href="/onlyfans/brunette">brunette</Link> to <Link href="/onlyfans/fitness">fitness</Link>, <Link href="/onlyfans/cosplay">cosplay</Link>, and <Link href="/onlyfans/goth">goth</Link>.
            Each category page shows creators ranked by engagement with real like counts and media totals. Filter further by price or free-only accounts.
            We index over 18 popular categories with thousands of verified creators in each.
          </p>

          <h3>Find OnlyFans Creators Near You</h3>
          <p>
            Our <Link href="/onlyfans/near-me">location-based search</Link> lets you find OnlyFans creators by country. Browse accounts from the <Link href="/onlyfans/near-me/united-states">United States</Link>, <Link href="/onlyfans/near-me/united-kingdom">United Kingdom</Link>, <Link href="/onlyfans/near-me/canada">Canada</Link>, <Link href="/onlyfans/near-me/australia">Australia</Link>, and dozens of other countries.
            Location data comes from creator profiles and is updated weekly. Find local creators or discover accounts from anywhere in the world.
          </p>

          <h3>Free OnlyFans Accounts</h3>
          <p>
            Not ready to pay? Browse our curated list of <Link href="/onlyfans/free">free OnlyFans accounts</Link> — creators who charge $0/month to subscribe.
            Free accounts still post regular content and many offer premium pay-per-view messages for exclusive material. It&apos;s a zero-risk way to explore the platform and find creators worth following long-term.
          </p>

          <h3>How to Search OnlyFans Without an Account</h3>
          <p>
            You don&apos;t need an OnlyFans account to use FindFanz. Our entire database is searchable without signing up or logging in. Type a name, category, or keyword into the search bar and browse results instantly.
            Creator profiles show public stats — media count, likes, subscription price, and bio. You only need an OnlyFans account when you decide to subscribe to someone.
          </p>

          <h3>Updated Weekly with Verified Stats</h3>
          <p>
            Our database refreshes every week with the latest creator stats from OnlyFans. New accounts get added, inactive ones get flagged, and prices stay current.
            Unlike Reddit lists or outdated blog posts, FindFanz shows you what&apos;s happening right now — not what was popular six months ago.
          </p>

          <h3>Best OnlyFans Creators 2026</h3>
          <p>
            Finding the best OnlyFans creators in 2026 means looking at real engagement, not just follower counts. FindFanz ranks creators by likes, media uploads, and subscriber activity — giving you a data-driven view of who&apos;s actually delivering quality content right now. Our trending section highlights the top-performing accounts updated weekly.
          </p>

          <h3>OnlyFans Finder — Search by Username</h3>
          <p>
            Know a creator&apos;s name but can&apos;t find them on OnlyFans? Type their username or display name into the FindFanz search bar and we&apos;ll pull up their profile with full stats. This works even if OnlyFans search doesn&apos;t return results — our database is independently indexed and searchable.
          </p>

          <h3>Is OnlyFans Worth It?</h3>
          <p>
            That depends entirely on which creator you subscribe to. Some accounts post daily with thousands of photos and videos for under $10/month — incredible value. Others charge $50/month for minimal content. FindFanz lets you see exactly what you&apos;re getting before you pay by showing real media counts, pricing, and engagement stats. Use our Value Rankings tool to find the best content-per-dollar ratio.
          </p>

          <h3>OnlyFans Alternatives for Discovery</h3>
          <p>
            Reddit, Twitter, and Instagram are where most people discover OnlyFans creators — but they&apos;re inefficient. You can&apos;t filter by price, compare stats, or verify content volume on social media. FindFanz replaces that guesswork with a structured search engine built specifically for OnlyFans discovery. Search, filter, compare, and decide — all in one place.
          </p>

          <h3>How Much Does OnlyFans Cost?</h3>
          <p>
            OnlyFans subscription prices range from free to $50/month per creator, with most accounts charging between $5 and $15. Some creators offer free subscriptions and monetise through pay-per-view messages instead. FindFanz shows the exact price on every creator card so there are no surprises. Use our Budget Calculator to plan your spending across multiple subscriptions.
          </p>

          <h3>OnlyFans Search Without Signing Up</h3>
          <p>
            OnlyFans requires an account and payment method just to browse. FindFanz doesn&apos;t. Search our entire database of {creatorDisplay} creators without creating an account, without entering payment details, and without any registration. See full profiles, stats, and pricing before deciding whether to visit OnlyFans at all.
          </p>

          <h3>Top OnlyFans Models by Likes</h3>
          <p>
            Like count is the best proxy for subscriber satisfaction on OnlyFans. Creators with tens of thousands of likes have proven audiences who genuinely enjoy their content. Our trending section sorts by like count so you can see which creators have the most engaged subscribers — not just the most followers.
          </p>

          <h3>OnlyFans Creator Comparison Tool</h3>
          <p>
            Can&apos;t decide between two creators? Our <Link href="/tools#compare">Compare Tool</Link> puts them side by side with real stats — price, media count, likes, and subscription type. It&apos;s the only OnlyFans comparison tool that uses verified platform data instead of opinions or paid reviews.
          </p>

          <h3>Cheapest OnlyFans Subscriptions</h3>
          <p>
            The cheapest OnlyFans subscriptions start at $3/month, but free accounts are even better for trying the platform. FindFanz lets you sort by price and filter for free accounts across every category. Whether you&apos;re on a budget or just exploring, you can find quality creators at any price point.
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
