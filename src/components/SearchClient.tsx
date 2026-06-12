"use client";

import { useState, useCallback } from "react";

interface Creator {
    username: string;
    display_name: string;
    avatar_url: string;
    subscription_price: number;
    is_free: boolean;
    media_count: number;
    photo_count: number;
    video_count: number;
    like_count: number;
    subscriber_count: number;
    country: string;
    bio: string;
    tags: string[];
}

interface SearchResponse {
    results: Creator[];
    total: number;
    page: number;
    pages: number;
    filters: {
        tags: string[];
        country: string | null;
        maxPrice: number | null;
        isFree: boolean;
        query: string;
        sort: string;
    } | null;
}

export default function SearchClient() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Creator[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [filters, setFilters] = useState<SearchResponse["filters"]>(null);

    const search = useCallback(async (q: string, p: number = 1) => {
        if (!q.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${p}&limit=24`);
            const data: SearchResponse = await res.json();
            setResults(data.results);
            setTotal(data.total);
            setPage(data.page);
            setPages(data.pages);
            setFilters(data.filters);
        } catch {
            setResults([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        search(query, 1);
    };

    const handleExample = (example: string) => {
        setQuery(example);
        search(example, 1);
    };

    return (
        <div className="search-page">
            <form className="search-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Try: curvy blonde under $10, free latina, petite asian..."
                    className="search-input-large"
                    autoFocus
                />
                <button type="submit" className="search-btn-large" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {!searched && (
                <div className="search-examples">
                    <p className="search-examples-label">Try these searches:</p>
                    <div className="search-example-chips">
                        {[
                            "free blonde",
                            "curvy latina",
                            "petite asian under $5",
                            "milf uk",
                            "redhead goth",
                            "fit brunette",
                            "bbw free",
                            "trans",
                            "couple",
                            "cosplay",
                            "colombian",
                            "australian",
                        ].map((ex) => (
                            <button key={ex} className="search-chip" onClick={() => handleExample(ex)}>
                                {ex}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {searched && filters && (
                <div className="search-meta">
                    <p className="search-result-count">
                        {total.toLocaleString()} creator{total !== 1 ? "s" : ""} found
                    </p>
                    {filters.tags.length > 0 && (
                        <div className="search-active-filters">
                            {filters.tags.map((t) => (
                                <span key={t} className="filter-badge">{t}</span>
                            ))}
                            {filters.country && <span className="filter-badge">{filters.country}</span>}
                            {filters.isFree && <span className="filter-badge">Free</span>}
                            {filters.maxPrice && !filters.isFree && (
                                <span className="filter-badge">Under ${filters.maxPrice}</span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {results.length > 0 && (
                <>
                    <div className="search-results-grid">
                        {results.map((creator) => (
                            <a
                                key={creator.username}
                                href={`https://onlyfans.com/${creator.username}`}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="search-result-card"
                            >
                                <div className="src-avatar-wrap">
                                    {creator.avatar_url ? (
                                        <img
                                            src={creator.avatar_url.replace("https://cdn.nearbyonly.com", "/img-proxy")}
                                            alt={creator.display_name || creator.username}
                                            className="src-avatar"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="src-avatar src-avatar-placeholder">
                                            {(creator.display_name || creator.username).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="src-price-badge">
                                        {creator.is_free ? "FREE" : `$${creator.subscription_price}/mo`}
                                    </span>
                                </div>
                                <div className="src-info">
                                    <h3 className="src-name">{creator.display_name || creator.username}</h3>
                                    <p className="src-username">@{creator.username}</p>
                                    <div className="src-stats">
                                        {creator.media_count > 0 && (
                                            <span>{creator.media_count.toLocaleString()} media</span>
                                        )}
                                        {creator.like_count > 0 && (
                                            <span>{creator.like_count.toLocaleString()} likes</span>
                                        )}
                                    </div>
                                    {creator.tags.length > 0 && (
                                        <div className="src-tags">
                                            {creator.tags.slice(0, 4).map((tag) => (
                                                <span key={tag} className="src-tag">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>

                    {pages > 1 && (
                        <div className="search-pagination">
                            <button
                                onClick={() => search(query, page - 1)}
                                disabled={page <= 1 || loading}
                                className="pagination-btn"
                            >
                                ← Previous
                            </button>
                            <span className="pagination-info">
                                Page {page} of {pages}
                            </span>
                            <button
                                onClick={() => search(query, page + 1)}
                                disabled={page >= pages || loading}
                                className="pagination-btn"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}

            {searched && !loading && results.length === 0 && (
                <div className="search-empty">
                    <p>No creators found for &ldquo;{query}&rdquo;</p>
                    <p className="search-empty-hint">Try different keywords or fewer filters.</p>
                </div>
            )}
        </div>
    );
}
