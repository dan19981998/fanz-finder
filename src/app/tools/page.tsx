import { Metadata } from "next";
import QuizClient from "@/components/QuizClient";
import CompareClient from "@/components/CompareClient";
import ToolsPageClient from "@/components/ToolsPageClient";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
    title: "Free OnlyFans Tools — Quiz, Compare, Budget Calculator & More | FindFanz",
    description:
        "Free OnlyFans discovery tools: Creator Quiz, Compare Tool, Budget Calculator, Value Rankings, Watchlist, and Random Discovery. All free, no login required.",
    alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
    const toolsJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Free OnlyFans Tools",
        description: "Six free tools to help you find, compare, and decide on OnlyFans creators.",
        numberOfItems: 6,
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "OnlyFans Creator Quiz",
                description: "Answer 5 questions and get personalised OnlyFans category recommendations instantly.",
                url: `${SITE_URL}/tools#quiz`,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "OnlyFans Creator Compare Tool",
                description: "Compare two OnlyFans creators side by side — pricing, media count, likes, and engagement.",
                url: `${SITE_URL}/tools#compare`,
            },
            {
                "@type": "ListItem",
                position: 3,
                name: "OnlyFans Budget Calculator",
                description: "Set your monthly budget and find the best combination of OnlyFans creators to subscribe to.",
                url: `${SITE_URL}/tools#budget`,
            },
            {
                "@type": "ListItem",
                position: 4,
                name: "OnlyFans Value Rankings",
                description: "Find the best OnlyFans value for money — creators ranked by content per dollar spent.",
                url: `${SITE_URL}/tools#value`,
            },
            {
                "@type": "ListItem",
                position: 5,
                name: "OnlyFans Watchlist",
                description: "Save and track OnlyFans creators locally without creating an account.",
                url: `${SITE_URL}/tools#watchlist`,
            },
            {
                "@type": "ListItem",
                position: 6,
                name: "Random OnlyFans Discovery",
                description: "Discover a random OnlyFans creator from 50,000+ accounts. Filter by category or free only.",
                url: `${SITE_URL}/tools#random`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsJsonLd) }}
            />
            <section className="quiz-hero">
                <div className="quiz-hero-inner">
                    <h1>OnlyFans Discovery Tools</h1>
                    <p>Six free tools to help you find, compare, and decide on creators. No account needed.</p>
                </div>
            </section>

            {/* ── Quiz ── */}
            <section className="tools-page-section" id="quiz">
                <div className="hp-section-inner">
                    <div className="tools-page-header">
                        <span className="tools-page-icon">🎯</span>
                        <div>
                            <h2>Creator Quiz</h2>
                            <p>Answer 5 quick questions about your preferences and get personalised category recommendations instantly.</p>
                        </div>
                    </div>
                    <div className="hp-tool-card">
                        <QuizClient />
                    </div>
                </div>
            </section>

            {/* ── Compare ── */}
            <section className="tools-page-section" id="compare">
                <div className="hp-section-inner">
                    <div className="tools-page-header">
                        <span className="tools-page-icon">⚖️</span>
                        <div>
                            <h2>Compare Tool</h2>
                            <p>Put two creators side by side — see who has more content, better pricing, and higher engagement.</p>
                        </div>
                    </div>
                    <div className="hp-tool-card">
                        <CompareClient />
                    </div>
                </div>
            </section>

            {/* ── Budget, Value, Watchlist, Random (client-side) ── */}
            <ToolsPageClient />

            <section className="hp-content">
                <div className="hp-section-inner">
                    <h2>Why Use OnlyFans Tools?</h2>
                    <p>
                        OnlyFans has no built-in way to compare creators, plan your spending, or discover new accounts. Our tools fill that gap. The Budget Calculator helps you get maximum content within your price range. Value Rankings show who delivers the most per dollar. The Watchlist lets you save creators without signing up. And Random Discovery is there when you just want to explore.
                    </p>

                    <h3>OnlyFans Creator Quiz — How It Works</h3>
                    <p>
                        The Creator Quiz asks you five questions about the type of content you enjoy, your budget, and your preferences. Based on your answers, it recommends the best OnlyFans categories to explore — not random accounts, but categories matched to what you actually want. It takes about 30 seconds and gives you a tailored starting point instead of scrolling endlessly through thousands of creators.
                    </p>

                    <h3>Compare OnlyFans Creators Side by Side</h3>
                    <p>
                        The Compare Tool pulls real stats for any two creators and displays them side by side. You can compare subscription price, total media count, likes received, and whether they offer a free trial. This is the fastest way to decide between two creators before subscribing. No other OnlyFans tool shows you this data in a direct comparison format.
                    </p>

                    <h3>OnlyFans Budget Calculator</h3>
                    <p>
                        Set your monthly budget and the calculator finds the best combination of creators you can subscribe to within that amount. It uses a greedy algorithm to maximise the total content you receive per dollar spent. If you subscribe to multiple OnlyFans accounts, this tool prevents overspending and helps you get the most media for your money.
                    </p>

                    <h3>Value Rankings — Best OnlyFans Value for Money</h3>
                    <p>
                        Value Rankings score every creator by dividing their total media count by their subscription price. A creator with 5,000 photos and a $5/month subscription scores higher than one with 100 photos at $20/month. This is the simplest way to find OnlyFans creators who deliver the most content relative to what they charge. Filter by category to narrow results.
                    </p>

                    <h3>OnlyFans Watchlist — Save Creators Locally</h3>
                    <p>
                        The Watchlist lets you bookmark OnlyFans creators without creating an account. Your saved list is stored in your browser&apos;s local storage — we never see it, it never leaves your device, and it persists between visits. Use it to track creators you&apos;re interested in and compare them later before committing to a subscription.
                    </p>

                    <h3>Random OnlyFans Discovery</h3>
                    <p>
                        Sometimes you don&apos;t know what you&apos;re looking for. The Random Discovery tool pulls a random creator from our database of 50,000+ accounts. Filter by category or limit results to free accounts only. It&apos;s a quick way to find accounts you&apos;d never discover through search alone — especially smaller creators with great content who don&apos;t appear in trending lists.
                    </p>

                    <h3>All Tools Are Free — No Login Required</h3>
                    <p>
                        Every tool on this page works without an account, without a login, and without paying anything. Your watchlist is stored locally on your device. We don&apos;t track you, sell your data, or require email signups. Just open a tool and use it. FindFanz is funded independently and all features remain free for every visitor.
                    </p>

                    <h3>How Are These Different from Other OnlyFans Finders?</h3>
                    <p>
                        Most OnlyFans directories show you a list of creators sorted by popularity and call it a day. FindFanz gives you actual decision-making tools. The Quiz narrows down categories. The Compare Tool shows objective differences. The Budget Calculator optimises spending. Value Rankings highlight efficiency. These are utilities that help you make informed choices — not just another list of profiles.
                    </p>

                    <h3>How to Find the Best OnlyFans Creators</h3>
                    <p>
                        Start with the Creator Quiz if you&apos;re unsure what you&apos;re looking for — it matches you to categories in 30 seconds. If you already have two creators in mind, use the Compare Tool to see who offers better value. For budget-conscious subscribers, the Budget Calculator finds the optimal combination of accounts within your spending limit. These tools work together to remove the guesswork from OnlyFans.
                    </p>

                    <h3>OnlyFans Worth It Calculator</h3>
                    <p>
                        Wondering if a specific OnlyFans subscription is worth the price? Check their profile in our Value Rankings. We calculate a value score by dividing total media uploads by subscription cost. A high score means you get more content per dollar. A low score means you&apos;re paying premium for minimal content. It&apos;s the simplest way to evaluate whether a creator is worth subscribing to.
                    </p>

                    <h3>Track OnlyFans Creators Without an Account</h3>
                    <p>
                        The Watchlist tool lets you save and track OnlyFans creators without creating any account — on our site or on OnlyFans. Add usernames to your watchlist, and we&apos;ll show you their current stats whenever you return. Everything is stored locally in your browser, so your list is completely private. It&apos;s like bookmarking but with live data.
                    </p>

                    <h3>OnlyFans Random Generator</h3>
                    <p>
                        The Random Discovery tool works like a random OnlyFans generator — click the button and get a creator you&apos;ve never seen before. Filter by category to stay within your interests, or toggle the free-only filter to discover accounts that cost nothing to subscribe to. It pulls from our full database of 50,000+ creators, so you&apos;ll always find something new.
                    </p>

                    <h3>Best Free OnlyFans Tools 2026</h3>
                    <p>
                        Every tool on FindFanz is completely free in 2026 — no premium tier, no paywalled features, no account required. The Quiz, Compare Tool, Budget Calculator, Value Rankings, Watchlist, and Random Discovery all work instantly in your browser. We built these tools because OnlyFans doesn&apos;t offer any discovery features, and we believe fans deserve better.
                    </p>

                    <h3>OnlyFans Subscription Calculator</h3>
                    <p>
                        If you subscribe to multiple OnlyFans accounts, costs add up fast. Our Budget Calculator acts as a subscription calculator — enter your total monthly budget and it shows you the maximum number of creators you can subscribe to while maximising content volume. It prioritises creators who deliver the most media per dollar, so you&apos;re never overpaying.
                    </p>

                    <h3>Compare OnlyFans Prices</h3>
                    <p>
                        OnlyFans doesn&apos;t make it easy to compare prices between creators. Our Compare Tool and Value Rankings solve this. See exact subscription costs, media counts, and engagement side by side. Whether you&apos;re choosing between two specific creators or looking for the cheapest high-quality accounts in a category, these tools give you the data you need.
                    </p>

                    <h3>How to Discover New OnlyFans Accounts</h3>
                    <p>
                        OnlyFans has no explore page, no algorithm, and no recommendations. Discovering new accounts means relying on social media, Reddit threads, or word of mouth. FindFanz changes that with structured discovery tools. Use the Quiz for guided recommendations, Random Discovery for serendipity, or Value Rankings to find hidden gems that deliver exceptional content without the marketing budget of top creators.
                    </p>
                </div>
            </section>
        </>
    );
}
