import { Metadata } from "next";
import QuizClient from "@/components/QuizClient";
import CompareClient from "@/components/CompareClient";
import ToolsPageClient from "@/components/ToolsPageClient";

export const metadata: Metadata = {
    title: "Free OnlyFans Tools — Quiz, Compare, Budget Calculator & More | FindFanz",
    description:
        "Free OnlyFans discovery tools: Creator Quiz, Compare Tool, Budget Calculator, Value Rankings, Watchlist, and Random Discovery. All free, no login required.",
    alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
    return (
        <>
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
                </div>
            </section>
        </>
    );
}
