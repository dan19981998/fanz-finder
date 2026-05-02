"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavSearch() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const go = () => {
        if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <div className="nav-search">
            <input
                type="text"
                className="nav-search-input"
                placeholder="Search creators..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
            />
        </div>
    );
}
