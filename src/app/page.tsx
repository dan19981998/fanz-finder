import { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import HeroSearch from "@/components/HeroSearch";
import HomeFaq from "@/components/HomeFaq";
import CreatorCardLink from "@/components/CreatorCardLink";

const PER_PAGE = 24;

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  if (sp.q) {
    return {
      title: `Search results for "${sp.q}" | OF Directory`,
      robots: { index: false, follow: false },
    };
  }
  return {};
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";
  const page = Math.max(1, parseInt(sp.page || "1", 10));

  // If there's a search query, show results
  if (query) {
    const offset = (page - 1) * PER_PAGE;
    let creators: Record<string, unknown>[] = [];
    let totalCount = 0;

    try {
      const searchTerm = `%${query}%`;
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM creators WHERE username ILIKE $1 OR display_name ILIKE $1`,
        [searchTerm]
      );
      totalCount = parseInt(countResult.rows[0].count, 10);

      // If no direct matches, show popular creators instead
      if (totalCount === 0) {
        const fallbackCount = await pool.query(`SELECT COUNT(*) FROM creators`);
        totalCount = parseInt(fallbackCount.rows[0].count, 10);

        const result = await pool.query(
          `SELECT * FROM creators ORDER BY subscriber_count DESC LIMIT $1 OFFSET $2`,
          [PER_PAGE, offset]
        );
        creators = result.rows;
      } else {
        const result = await pool.query(
          `SELECT * FROM creators WHERE username ILIKE $1 OR display_name ILIKE $1 ORDER BY subscriber_count DESC LIMIT $2 OFFSET $3`,
          [searchTerm, PER_PAGE, offset]
        );
        creators = result.rows;
      }
    } catch {
      // DB not connected
    }

    const totalPages = Math.ceil(totalCount / PER_PAGE);

    return (
      <>
        <section className="tag-hero">
          <div className="tag-hero-inner">
            <h1>Search results for &ldquo;{query}&rdquo;</h1>
            <p className="tag-hero-count">{totalCount.toLocaleString()} creators found</p>
            <div style={{ maxWidth: 560, margin: "24px auto 0" }}>
              <HeroSearch />
            </div>
          </div>
        </section>

        <section className="tag-creators">
          <div className="tag-section-label">
            <div className="tag-section-accent" />
            <h2>Creators{page > 1 ? ` — Page ${page}` : ""}</h2>
          </div>

          {creators.length > 0 && (
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
                    source="search"
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
          )}

          {totalPages > 1 && (
            <div className="tag-pagination">
              {page > 1 ? (
                <Link href={`/?q=${encodeURIComponent(query)}${page === 2 ? "" : `&page=${page - 1}`}`} className="tag-pagination-btn">
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="tag-pagination-info">Page {page} of {totalPages}</span>
              {page < totalPages ? (
                <Link href={`/?q=${encodeURIComponent(query)}&page=${page + 1}`} className="tag-pagination-btn">
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </section>

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

  // Normal homepage (no search query)
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            The #1<br />
            <span className="hero-highlight">OnlyFans Search</span> Engine
          </h1>
          <p className="hero-subtitle">
            Search OnlyFans creators by category, appearance, or name
          </p>

          <HeroSearch />

          <div className="hero-categories">
            <a href="/onlyfans/near-me" className="tag-pill">📍 Near Me</a>
            <a href="/onlyfans/free" className="tag-pill">🆓 Free</a>
            <a href="/onlyfans/blonde" className="tag-pill">👱‍♀️ Blonde</a>
            <a href="/onlyfans/big-boobs" className="tag-pill">🍒 Big Boobs</a>
            <a href="/categories" className="tag-pill tag-pill-more">More →</a>
          </div>

          {/* Trust signals */}
          <div className="trust-badges">
            <span className="trust-badge">🔒 100% Free to Browse</span>
            <span className="trust-badge">📅 Updated Weekly</span>
            <span className="trust-badge">✅ 13,000+ Creators</span>
          </div>
        </div>

        {/* Scroll hint */}
        <a href="#about" className="scroll-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </a>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="how-inner">
          <h2 className="how-heading">How It Works</h2>
          <p className="how-subheading">Find your perfect creator in three simple steps</p>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-content">
                <div className="how-step-icon">🔍</div>
                <h3>Search</h3>
                <p>Type a name, category, or keyword — our search covers every creator in the directory</p>
              </div>
            </div>
            <div className="how-step">
              <div className="how-step-content">
                <div className="how-step-icon">⚙️</div>
                <h3>Filter</h3>
                <p>Browse 25 categories to narrow down by niche, price, content type, and more</p>
              </div>
            </div>
            <div className="how-step">
              <div className="how-step-content">
                <div className="how-step-icon">🎯</div>
                <h3>Discover</h3>
                <p>View full profiles with real stats and prices, then visit their OnlyFans page directly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1 */}
      <section id="about" className="feature-section">
        <div className="feature-inner">
          <div className="feature-text">
            <h2 className="feature-heading">
              The Smarter Way to<br />
              <span className="hero-highlight">Search OnlyFans</span>
            </h2>
            <p className="feature-description">
              OF Directory is the most comprehensive OnlyFans search engine on the web.
              Browse over 13,000 creators across 25 categories — with real stats pulled
              directly from OnlyFans including photo counts, video counts, and subscription prices.
            </p>
            <p className="feature-description">
              No more guessing. No more scrolling through Reddit threads. Just search,
              filter, and find exactly what you&apos;re looking for.
            </p>
            <a href="/categories" className="btn-accent">Browse Categories →</a>
          </div>
          <div className="feature-image">
            <img src="/images/feature-discover.png" alt="Discover creators on OF Directory" />
          </div>
        </div>
      </section>

      {/* Feature Section 2 */}
      <section className="feature-section feature-section-alt">
        <div className="feature-inner feature-inner-reverse">
          <div className="feature-text">
            <h2 className="feature-heading">
              25 Categories.<br />
              <span className="hero-highlight">Instant Results.</span>
            </h2>
            <p className="feature-description">
              Browse by category — from Blonde to Latina to Free accounts. Each category
              page shows real creator profiles with verified stats, subscription prices,
              and content counts. No fake profiles, no outdated data.
            </p>
            <p className="feature-description">
              Sort by popularity, newest, or price. Every page is updated weekly with
              fresh data from the platform.
            </p>
            <a href="/categories" className="btn-accent">Browse Categories →</a>
          </div>
          <div className="feature-image">
            <img src="/images/feature-filters.png" alt="Browse categories on OF Directory" />
          </div>
        </div>
      </section>

      {/* Feature Section 3 */}
      <section className="feature-section">
        <div className="feature-inner">
          <div className="feature-text">
            <h2 className="feature-heading">
              Real Stats.<br />
              <span className="hero-highlight">Real Prices.</span>
            </h2>
            <p className="feature-description">
              Every profile on OF Directory includes real data pulled from OnlyFans —
              photo count, video count, total likes, and exact subscription price.
              No guessing, no surprises.
            </p>
            <p className="feature-description">
              Our database is updated weekly so you always see the latest information.
              Over 13,000 verified creators and growing.
            </p>
            <a href="/onlyfans/free" className="btn-accent">Browse Free Creators →</a>
          </div>
          <div className="feature-image">
            <img src="/images/feature-creators.png" alt="Real stats on OF Directory" />
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="tag-deep-content">
        <div className="tag-deep-inner">
          <h2>Why Use an OnlyFans Search Engine?</h2>
          <p>
            OnlyFans has over 3 million creators, but the platform itself has no built-in search functionality worth using. You can&apos;t browse by category, filter by appearance, or compare subscription prices. That&apos;s why dedicated OnlyFans search engines like OF Directory exist — to solve the discovery problem that OnlyFans refuses to fix.
          </p>
          <p>
            Without an OnlyFans search tool, fans are stuck relying on Reddit threads, Twitter promotions, and word of mouth to find new creators. Those methods are disorganised, outdated, and full of self-promotion. An OnlyFans search engine puts every creator in one searchable, filterable directory — so you can find exactly who you&apos;re looking for in seconds.
          </p>
          <p>
            OF Directory pulls real stats directly from OnlyFans — photo counts, video counts, likes, and subscription prices. With 25 category pages and over 13,000 creators, it&apos;s the most comprehensive way to search OnlyFans. Every profile shows real data, so there are no surprises after you subscribe.
          </p>
        </div>
      </section>

      <section className="tag-deep-content">
        <div className="tag-deep-inner">
          <h2>How OnlyFans Search Works on OF Directory</h2>
          <p>
            Searching for OnlyFans creators on OF Directory is simple. Start by typing a name, category, or keyword into the search bar. Results appear instantly. You&apos;ll see matching creators with their real stats and subscription prices.
          </p>
          <p>
            You can also browse by category using the tag pills on the homepage or the full categories page. Each category — from <a href="/onlyfans/blonde">Blonde OnlyFans</a> to <a href="/onlyfans/latina">Latina OnlyFans</a> to <a href="/onlyfans/free">Free OnlyFans</a> — features a grid of verified creators with real data. Click any profile to see their full details, then visit their OnlyFans page directly.
          </p>
          <p>
            Our database is updated weekly with fresh stats from the platform. We add new creators regularly and keep all existing profiles current. The data you see is real — not scraped from social media or made up by third parties.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="faq-inner">
          <h2 className="faq-heading">Frequently Asked Questions</h2>
          <HomeFaq />
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
