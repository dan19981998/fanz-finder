"use client";

import { useState, useEffect } from "react";
import { proxyAvatarUrl } from "@/lib/avatars";

interface WatchlistCreator {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
    subscription_price: number;
    is_free: boolean;
    media_count: number;
    like_count: number;
}

export default function Watchlist({ onClose }: { onClose: () => void }) {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [creators, setCreators] = useState<WatchlistCreator[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [searchResults, setSearchResults] = useState<WatchlistCreator[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("findfanz_watchlist");
        if (saved) {
            const parsed = JSON.parse(saved) as string[];
            setWatchlist(parsed);
            if (parsed.length > 0) loadCreators(parsed);
        }
    }, []);

    const loadCreators = async (usernames: string[]) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/watchlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usernames }),
            });
            if (res.ok) {
                const data = await res.json();
                setCreators(data.creators || []);
            }
        } catch {
            // ignore
        }
        setLoading(false);
    };

    const addToWatchlist = (username: string) => {
        if (watchlist.includes(username)) return;
        const updated = [...watchlist, username];
        setWatchlist(updated);
        localStorage.setItem("findfanz_watchlist", JSON.stringify(updated));
        loadCreators(updated);
        setSearchVal("");
        setSearchResults([]);
    };

    const removeFromWatchlist = (username: string) => {
        const updated = watchlist.filter((u) => u !== username);
        setWatchlist(updated);
        localStorage.setItem("findfanz_watchlist", JSON.stringify(updated));
        setCreators(creators.filter((c) => c.username !== username));
    };

    const searchCreator = async () => {
        if (!searchVal.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchVal.trim())}&limit=5`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.results || []);
            }
        } catch {
            // ignore
        }
        setSearching(false);
    };

    const totalMonthly = creators.reduce((sum, c) => sum + (c.is_free ? 0 : c.subscription_price || 0), 0);

    return (
        <div className="tool-modal-overlay" onClick={onClose}>
            <div className="tool-modal" onClick={(e) => e.stopPropagation()}>
                <button className="tool-modal-close" onClick={onClose}>×</button>
                <div className="tool-modal-header">
                    <span className="tool-modal-icon">⭐</span>
                    <h2>My Watchlist</h2>
                    <p>Save creators to track. Your list is stored locally — no account needed.</p>
                </div>

                <div className="watchlist-search">
                    <div className="watchlist-search-row">
                        <input
                            type="text"
                            placeholder="Search username to add..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && searchCreator()}
                            className="watchlist-input"
                        />
                        <button onClick={searchCreator} disabled={searching} className="watchlist-search-btn">
                            {searching ? "..." : "Search"}
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="watchlist-suggestions">
                            {searchResults.map((c) => (
                                <button key={c.id} className="watchlist-suggestion" onClick={() => addToWatchlist(c.username)}>
                                    <span>@{c.username}</span>
                                    <span className="watchlist-add-icon">+</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading && <div className="tool-loading">Loading watchlist...</div>}

                {!loading && creators.length > 0 && (
                    <>
                        <div className="watchlist-summary">
                            <span>{creators.length} creator{creators.length !== 1 ? "s" : ""} saved</span>
                            <span>Total: ${totalMonthly.toFixed(2)}/mo</span>
                        </div>
                        <div className="watchlist-list">
                            {creators.map((c) => (
                                <div key={c.id} className="watchlist-item">
                                    <a href={`/onlyfans/creator/${c.username}`} className="watchlist-item-link">
                                        <div className="watchlist-avatar">
                                            {c.avatar_url ? (
                                                <img src={proxyAvatarUrl(c.avatar_url)} alt={c.display_name || c.username} />
                                            ) : (
                                                <div className="budget-item-placeholder">{(c.display_name || c.username).charAt(0)}</div>
                                            )}
                                        </div>
                                        <div className="watchlist-info">
                                            <span className="watchlist-name">{c.display_name || c.username}</span>
                                            <span className="watchlist-handle">@{c.username}</span>
                                        </div>
                                        <div className="watchlist-meta">
                                            <span>{c.is_free ? "FREE" : `$${c.subscription_price}/mo`}</span>
                                            <span>📸 {c.media_count?.toLocaleString()}</span>
                                        </div>
                                    </a>
                                    <button className="watchlist-remove" onClick={() => removeFromWatchlist(c.username)}>✕</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!loading && creators.length === 0 && watchlist.length === 0 && (
                    <p className="budget-empty">Your watchlist is empty. Search for creators above to start saving.</p>
                )}
            </div>
        </div>
    );
}
