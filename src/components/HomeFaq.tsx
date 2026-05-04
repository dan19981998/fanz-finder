"use client";

import { useState, useRef, useEffect } from "react";

const FAQS = [
    {
        q: "What is Lush Finder?",
        a: "Lush Finder is a free OnlyFans search engine. We help fans discover creators by category, appearance, price, and content type — with real stats from the platform.",
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
        q: "Can I search by name?",
        a: "Yes. Use the search bar to find creators by name, username, or keyword. You can also browse by category using our 25 tag pages.",
    },
    {
        q: "Is Lush Finder affiliated with OnlyFans?",
        a: "No. We are an independent third-party directory. We are not affiliated with, endorsed by, or connected to OnlyFans or Fenix International Limited.",
    },
    {
        q: "How many creators are listed?",
        a: "Over 13,000 verified creators across 25 categories — from free accounts to niche content types. We add new creators every week.",
    },
    {
        q: "Can I filter by price?",
        a: "Yes. Each category page shows whether a creator is free or paid, along with their exact subscription price. Browse the Free category to see only free accounts.",
    },
    {
        q: "How do I get a creator removed?",
        a: "If you're a creator and want your profile removed, contact us and we'll take it down within 24 hours. No questions asked.",
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
