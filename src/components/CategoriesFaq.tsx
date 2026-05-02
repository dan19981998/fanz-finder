'use client'

import { useState, useRef, useEffect } from 'react'

const FAQS = [
    {
        q: "How are the categories organised?",
        a: "All categories are listed alphabetically so you can quickly scan and find what you're looking for. Each category links to a dedicated page with a full grid of creators.",
    },
    {
        q: "How many categories are there?",
        a: "We currently have 25 categories covering every major OnlyFans niche — from appearance types like Blonde and Redhead, to content types like GFE and Cosplay, to pricing filters like Free.",
    },
    {
        q: "What do I see on a category page?",
        a: "Each category page shows a grid of creators with their profile photo, name, subscription price, and content stats (photos, videos, likes). Click any creator to go directly to their OnlyFans.",
    },
    {
        q: "How often are categories updated?",
        a: "Our database is updated weekly. New creators are added and existing profiles are refreshed with the latest stats from OnlyFans.",
    },
    {
        q: "Can a creator appear in multiple categories?",
        a: "Yes. Creators are tagged based on their content and appearance, so they can appear across several relevant categories.",
    },
    {
        q: "What does the Free category include?",
        a: "The Free category shows OnlyFans creators who offer a free subscription. You can browse their profile without paying — though they may offer paid content or tips within their page.",
    },
]

function FaqItem({ faq, isOpen, onToggle }: { faq: { q: string; a: string }; isOpen: boolean; onToggle: () => void }) {
    const contentRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight)
        }
    }, [isOpen])

    return (
        <div className={`faq-item${isOpen ? ' faq-item-open' : ''}`}>
            <button
                type="button"
                className="faq-summary"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{faq.q}</span>
                <span className="faq-icon">{isOpen ? '−' : '+'}</span>
            </button>
            <div className="faq-answer" style={{ height: isOpen ? height : 0 }}>
                <div ref={contentRef}>
                    <p>{faq.a}</p>
                </div>
            </div>
        </div>
    )
}

export default function CategoriesFaq() {
    const [open, setOpen] = useState<number | null>(null)

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
    )
}
