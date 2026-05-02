'use client'

import { useState, useEffect } from 'react'

interface TagPillsProps {
    tags: { name: string; slug: string }[]
    tagEmojis: Record<string, string>
}

export default function TagPills({ tags, tagEmojis }: TagPillsProps) {
    const [expanded, setExpanded] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    const limit = 10
    const shouldTruncate = isMobile && tags.length > limit && !expanded
    const visible = shouldTruncate ? tags.slice(0, limit) : tags

    return (
        <>
            {visible.map((tag) => (
                <a key={tag.name} href={`/onlyfans/${tag.slug}`} className="tag-pill">
                    {tagEmojis[tag.name] || '🏷️'} {tag.name}
                </a>
            ))}
            {isMobile && tags.length > limit && !expanded && (
                <button
                    className="tag-pill tag-pill-more"
                    onClick={() => setExpanded(true)}
                >
                    +{tags.length - limit} more
                </button>
            )}
        </>
    )
}
