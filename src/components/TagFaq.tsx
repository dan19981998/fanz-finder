'use client'

import { useState, useRef, useEffect } from 'react'

interface TagFaqProps {
    faqs: { q: string; a: string }[]
}

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

export default function TagFaq({ faqs }: TagFaqProps) {
    const [open, setOpen] = useState<number | null>(null)

    return (
        <div className="faq-grid">
            {faqs.map((faq, i) => (
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
