"use client";

import { useState, useRef, useEffect } from "react";

const FAQS = [
    {
        q: "What is FindFanz?",
        a: "FindFanz is a free OnlyFans search engine. We help fans discover creators by category, appearance, price, and content type — with real stats from the platform.",
    },
    {
        q: "Is it free to use?",
        a: "Yes, completely free. Browse, search, and explore as much as you want. No sign-up required, no hidden fees. You only pay if you choose to subscribe to a creator on OnlyFans itself.",
    },
    {
        q: "How do you get the creator data?",
        a: "We pull real stats directly from OnlyFans — including photo counts, video counts, likes, and subscription prices. Our database is updated weekly to keep everything accurate.",
    },
    {
        q: "Can I search OnlyFans by name?",
        a: "Yes. Use the search bar to find creators by name, username, or keyword. You can also browse by category using our 25 tag pages.",
    },
    {
        q: "Is FindFanz affiliated with OnlyFans?",
        a: "No. We are an independent third-party directory. We are not affiliated with, endorsed by, or connected to OnlyFans or Fenix International Limited.",
    },
    {
        q: "How many creators are listed?",
        a: "Over 50,000 verified creators across 25 categories — from free accounts to niche content types. We add new creators every week.",
    },
    {
        q: "Can I filter OnlyFans creators by price?",
        a: "Yes. Each category page shows whether a creator is free or paid, along with their exact subscription price. Browse the Free category to see only free accounts.",
    },
    {
        q: "How do I get a creator removed?",
        a: "If you're a creator and want your profile removed, contact us and we'll take it down within 24 hours. No questions asked.",
    },
    {
        q: "Can I search OnlyFans without an account?",
        a: "Yes. FindFanz lets you search, browse, and compare all 50,000+ OnlyFans creators without creating any account — not on our site or on OnlyFans. No payment method required.",
    },
    {
        q: "How do I find the best OnlyFans creators?",
        a: "Use our Creator Quiz for personalised recommendations, the Compare Tool to evaluate two creators side by side, or the Value Rankings to find who delivers the most content per dollar. All tools are free.",
    },
    {
        q: "What are the best free OnlyFans accounts?",
        a: "Our free category lists every verified creator who charges $0/month. Many top-earning creators offer free subscriptions and monetise through tips and PPV content instead. Browse them all with real stats.",
    },
    {
        q: "How much does OnlyFans cost?",
        a: "OnlyFans subscription prices range from free to $50/month per creator. Most accounts charge between $5 and $15 per month. FindFanz shows exact pricing on every creator card so you know the cost before visiting OnlyFans.",
    },
    {
        q: "Can I compare two OnlyFans creators?",
        a: "Yes. Our Compare Tool lets you put two creators side by side and see who has more content, better pricing, and higher engagement. Just enter two usernames and get an instant comparison with verified data.",
    },
    {
        q: "Is there an OnlyFans search engine?",
        a: "OnlyFans has no built-in search or discovery features. FindFanz is the free alternative — a dedicated search engine that indexes 50,000+ creator profiles with real stats, pricing, and category filters.",
    },
    {
        q: "How do I find OnlyFans creators near me?",
        a: "Use our location-based search to browse OnlyFans creators by country. We support over 30 countries including the US, UK, Canada, and Australia. Location data comes from creator profiles and is updated weekly.",
    },
    {
        q: "What OnlyFans tools does FindFanz offer?",
        a: "Six free tools: Creator Quiz (personalised recommendations), Compare Tool (side-by-side stats), Budget Calculator (optimise spending), Value Rankings (content per dollar), Watchlist (save creators locally), and Random Discovery (find new accounts).",
    },
];

function FaqItem({ faq, isOpen, onToggle }: { faq: { q: string; a: string }; isOpen: boolean; onToggle: () => void }) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [isOpen]);

    return (
        <div className={`faq-item${isOpen ? " faq-item-open" : ""}`}>
            <button
                type="button"
                className="faq-summary"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{faq.q}</span>
                <span className="faq-icon">{isOpen ? "−" : "+"}</span>
            </button>
            <div className="faq-answer" style={{ height: isOpen ? height : 0 }}>
                <div ref={contentRef}>
                    <p>{faq.a}</p>
                </div>
            </div>
        </div>
    );
}

export default function HomeFaq() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <div className="faq-grid">
            {FAQS.map((faq, i) => (
                <FaqItem
                    key={i}
                    faq={faq}
                    isOpen={open === i}
                    onToggle={() => setOpen(open === i ? null : i)}
                />
            ))}
        </div>
    );
}
