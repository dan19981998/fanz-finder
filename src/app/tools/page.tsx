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
                    <h3>All Tools Are Free</h3>
                    <p>
                        Every tool on this page works without an account, without a login, and without paying anything. Your watchlist is stored locally on your device. We don&apos;t track you, sell your data, or require email signups. Just open a tool and use it.
                    </p>
                </div>
            </section>
        </>
    );
}
