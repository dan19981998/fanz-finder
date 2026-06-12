"use client";

import { useState } from "react";
import { proxyAvatarUrl } from "@/lib/avatars";

interface Creator {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
    subscription_price: number;
    is_free: boolean;
    media_count: number;
    photo_count: number;
    video_count: number;
    like_count: number;
}

export default function CompareClient() {
    const [search1, setSearch1] = useState("");
    const [search2, setSearch2] = useState("");
    const [creator1, setCreator1] = useState<Creator | null>(null);
    const [creator2, setCreator2] = useState<Creator | null>(null);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [error1, setError1] = useState("");
    const [error2, setError2] = useState("");

    const fetchCreator = async (username: string, slot: 1 | 2) => {
        const setLoading = slot === 1 ? setLoading1 : setLoading2;
        const setCreator = slot === 1 ? setCreator1 : setCreator2;
        const setError = slot === 1 ? setError1 : setError2;

        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/creator/${encodeURIComponent(username.trim().toLowerCase().replace("@", ""))}`);
            if (!res.ok) {
                setError("Creator not found");
                setCreator(null);
            } else {
                const data = await res.json();
                setCreator(data);
            }
        } catch {
            setError("Failed to load");
            setCreator(null);
        }
        setLoading(false);
    };

    const renderStat = (label: string, val1: number | string | null, val2: number | string | null, higher: "better" | "lower" | "neutral" = "better") => {
        const n1 = typeof val1 === "number" ? val1 : 0;
        const n2 = typeof val2 === "number" ? val2 : 0;
        let winner: 0 | 1 | 2 = 0;
        if (creator1 && creator2 && n1 !== n2) {
            if (higher === "better") winner = n1 > n2 ? 1 : 2;
            else if (higher === "lower") winner = n1 < n2 ? 1 : 2;
        }

        return (
            <div className="compare-stat-row">
                <div className={`compare-stat-val ${winner === 1 ? "compare-winner" : ""}`}>
                    {typeof val1 === "number" ? val1.toLocaleString() : val1 || "—"}
                </div>
                <div className="compare-stat-label">{label}</div>
                <div className={`compare-stat-val ${winner === 2 ? "compare-winner" : ""}`}>
                    {typeof val2 === "number" ? val2.toLocaleString() : val2 || "—"}
                </div>
            </div>
        );
    };

    return (
        <div className="compare-container">
            {/* Search inputs */}
            <div className="compare-inputs">
                <div className="compare-input-col">
                    <form onSubmit={(e) => { e.preventDefault(); if (search1.trim()) fetchCreator(search1, 1); }}>
                        <input
                            type="text"
                            placeholder="Enter username..."
                            value={search1}
                            onChange={(e) => setSearch1(e.target.value)}
                            className="compare-input"
                        />
                        <button type="submit" className="compare-search-btn" disabled={loading1}>
                            {loading1 ? "..." : "Find"}
                        </button>
                    </form>
                    {error1 && <p className="compare-error">{error1}</p>}
                </div>
                <div className="compare-vs">VS</div>
                <div className="compare-input-col">
                    <form onSubmit={(e) => { e.preventDefault(); if (search2.trim()) fetchCreator(search2, 2); }}>
                        <input
                            type="text"
                            placeholder="Enter username..."
                            value={search2}
                            onChange={(e) => setSearch2(e.target.value)}
                            className="compare-input"
                        />
                        <button type="submit" className="compare-search-btn" disabled={loading2}>
                            {loading2 ? "..." : "Find"}
                        </button>
                    </form>
                    {error2 && <p className="compare-error">{error2}</p>}
                </div>
            </div>

            {/* Comparison table */}
            {(creator1 || creator2) && (
                <div className="compare-table">
                    {/* Avatars */}
                    <div className="compare-header-row">
                        <div className="compare-header-col">
                            {creator1 && (
                                <>
                                    <div className="compare-avatar">
                                        {creator1.avatar_url ? (
                                            <img src={proxyAvatarUrl(creator1.avatar_url)} alt={creator1.display_name} />
                                        ) : (
                                            <div className="compare-avatar-placeholder">{(creator1.display_name || creator1.username).charAt(0)}</div>
                                        )}
                                    </div>
                                    <span className="compare-name">{creator1.display_name || creator1.username}</span>
                                    <span className="compare-handle">@{creator1.username}</span>
                                </>
                            )}
                        </div>
                        <div className="compare-header-col">
                            {creator2 && (
                                <>
                                    <div className="compare-avatar">
                                        {creator2.avatar_url ? (
                                            <img src={proxyAvatarUrl(creator2.avatar_url)} alt={creator2.display_name} />
                                        ) : (
                                            <div className="compare-avatar-placeholder">{(creator2.display_name || creator2.username).charAt(0)}</div>
                                        )}
                                    </div>
                                    <span className="compare-name">{creator2.display_name || creator2.username}</span>
                                    <span className="compare-handle">@{creator2.username}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="compare-stats">
                        {renderStat("Price", creator1?.is_free ? "Free" : creator1 ? `$${creator1.subscription_price}/mo` : null, creator2?.is_free ? "Free" : creator2 ? `$${creator2.subscription_price}/mo` : null, "lower")}
                        {renderStat("Total Likes", creator1?.like_count ?? null, creator2?.like_count ?? null)}
                        {renderStat("Total Media", creator1?.media_count ?? null, creator2?.media_count ?? null)}
                        {renderStat("Photos", creator1?.photo_count ?? null, creator2?.photo_count ?? null)}
                        {renderStat("Videos", creator1?.video_count ?? null, creator2?.video_count ?? null)}
                    </div>
                </div>
            )}
        </div>
    );
}
