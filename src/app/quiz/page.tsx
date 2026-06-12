import { Metadata } from "next";
import QuizClient from "@/components/QuizClient";

export const metadata: Metadata = {
    title: "OnlyFans Quiz — Who Should I Subscribe To? | FindFanz",
    description:
        "Take our free quiz to find the perfect OnlyFans creator for you. Answer 5 quick questions about your preferences and get personalized recommendations.",
    alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
    return (
        <>
            <section className="quiz-hero">
                <div className="quiz-hero-inner">
                    <h1>Who Should I Subscribe To?</h1>
                    <p>Answer 5 quick questions and we&apos;ll recommend the best OnlyFans categories for your taste. Takes 30 seconds.</p>
                </div>
            </section>

            <section className="quiz-section">
                <QuizClient />
            </section>

            <section className="hp-content">
                <div className="hp-section-inner">
                    <h2>How the OnlyFans Quiz Works</h2>
                    <p>
                        Not sure where to start on OnlyFans? Our recommendation quiz asks about your preferences — body type, appearance, budget, and content style — then matches you with the best categories from our directory of 50,000+ creators.
                    </p>
                    <p>
                        Unlike scrolling through endless profiles, the quiz narrows down your options in seconds. Whether you want free accounts, specific aesthetics, or creators who post daily, we&apos;ll point you in the right direction.
                    </p>
                    <h3>Why Use a Recommendation Quiz?</h3>
                    <p>
                        OnlyFans has over 3 million creators and no useful search or recommendation system. Most people find creators through social media promotion, which is hit-or-miss. Our quiz uses your stated preferences to recommend categories where you&apos;re most likely to find creators you&apos;ll actually enjoy subscribing to.
                    </p>
                </div>
            </section>
        </>
    );
}
