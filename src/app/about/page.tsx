import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About - FindFanz",
    description:
        "Learn about FindFanz, the free OnlyFans search engine helping fans discover creators by category, appearance, and price.",
};

export default function AboutPage() {
    return (
        <main className="about-page">
            <section className="about-hero">
                <h1>About FindFanz</h1>
                <p className="about-hero-sub">The smarter way to discover OnlyFans creators.</p>
            </section>

            <section className="about-content">
                <div className="about-card about-card-accent">
                    <h2>What We Do</h2>
                    <p>FindFanz is a free OnlyFans search engine that helps fans discover creators by category, appearance, and content type. We make it easy to find exactly the type of creator you&apos;re looking for — without scrolling through social media for hours.</p>
                    <p>Think of us as a search engine built specifically for OnlyFans. Browse by tag, filter by price, or explore categories. Every profile is real, with accurate stats pulled directly from the platform.</p>
                </div>

                <div className="about-grid">
                    <div className="about-card">
                        <div className="about-card-icon">🔍</div>
                        <h3>For Fans</h3>
                        <p>Browse 50,000+ creators across 25 categories. Filter by content type, price, and popularity — all completely free. No sign-up required.</p>
                    </div>
                    <div className="about-card">
                        <div className="about-card-icon">📊</div>
                        <h3>Real Data</h3>
                        <p>Every listing shows real stats — photo count, video count, likes, and subscription price. No guesswork, no outdated info. Updated weekly.</p>
                    </div>
                </div>

                <div className="about-card">
                    <h2>How It Works</h2>
                    <div className="about-steps">
                        <div className="about-step">
                            <span className="about-step-num">01</span>
                            <div>
                                <h4>Browse Categories</h4>
                                <p>Pick a category — free, latina, blonde, goth, fitness, or any of our 25 tags. Each category page shows creators sorted by popularity.</p>
                            </div>
                        </div>
                        <div className="about-step">
                            <span className="about-step-num">02</span>
                            <div>
                                <h4>Compare Creators</h4>
                                <p>See stats at a glance — media count, likes, and price. Every card shows you exactly what to expect before you click.</p>
                            </div>
                        </div>
                        <div className="about-step">
                            <span className="about-step-num">03</span>
                            <div>
                                <h4>Visit OnlyFans</h4>
                                <p>Found someone you like? Click their card to go directly to their OnlyFans page. No middleman, no sign-up walls.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="about-card">
                    <h2>Why We Built This</h2>
                    <p>OnlyFans doesn&apos;t have a built-in search or proper category browser. Fans rely on Reddit threads, Twitter promotions, and word of mouth — which is slow, random, and unreliable.</p>
                    <p>We built FindFanz to fix that. Our goal is simple: connect fans with creators they&apos;ll love, using real data instead of hype.</p>
                </div>

                <div className="about-card">
                    <h2>Not Affiliated With OnlyFans</h2>
                    <p>FindFanz is an independent third-party directory. We are not affiliated with, endorsed by, or connected to OnlyFans or Fenix International Limited in any way.</p>
                </div>

                <div className="about-card about-cta-card">
                    <h2>Ready to Explore?</h2>
                    <p>50,000+ verified creators across 25 categories. Start browsing now — it&apos;s free.</p>
                    <div className="about-cta-buttons">
                        <a href="/" className="about-cta-btn about-cta-primary">Browse Creators</a>
                    </div>
                </div>
            </section>
        </main>
    );
}
