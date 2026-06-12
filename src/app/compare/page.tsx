import { Metadata } from "next";
import CompareClient from "@/components/CompareClient";

export const metadata: Metadata = {
    title: "Compare OnlyFans Creators Side by Side | FindFanz",
    description:
        "Compare two OnlyFans creators side by side. See who has more content, better pricing, and higher engagement — all in one view.",
    alternates: { canonical: "/compare" },
};

export default function ComparePage() {
    return (
        <>
            <section className="quiz-hero">
                <div className="quiz-hero-inner">
                    <h1>Compare OnlyFans Creators</h1>
                    <p>Enter two usernames to compare stats, pricing, and content volume side by side. Make better subscription decisions.</p>
                </div>
            </section>

            <section className="compare-section">
                <CompareClient />
            </section>

            <section className="hp-content">
                <div className="hp-section-inner">
                    <h2>How to Compare OnlyFans Creators</h2>
                    <p>
                        Can&apos;t decide between two OnlyFans creators? Our comparison tool shows you the numbers side by side — subscription price, total content, likes, photos, and videos. The creator with better stats in each category gets highlighted in green.
                    </p>
                    <p>
                        Just enter two OnlyFans usernames (without the @) and hit Find. We&apos;ll pull their latest stats from our database of 50,000+ indexed creators. No OnlyFans account needed to compare.
                    </p>
                    <h3>What Can You Compare?</h3>
                    <p>
                        Subscription price, total likes (a measure of subscriber satisfaction), total media posts, photo count, and video count. More content at a lower price usually means better value — but high likes relative to subscriber count is the real indicator of quality.
                    </p>
                </div>
            </section>
        </>
    );
}
