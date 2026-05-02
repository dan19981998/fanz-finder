"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const go = () => {
        if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <div className="search-row">
            <div className="search-wrapper">
                <form onSubmit={(e) => { e.preventDefault(); go(); }} className="search-form">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, category, or keyword..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoComplete="off"
                    />
                    <button type="submit" className="search-btn" aria-label="Search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
