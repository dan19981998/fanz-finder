"use client";

import { useState, useEffect } from "react";
import { proxyAvatarUrl } from "@/lib/avatars";

interface Creator {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
    subscription_price: number;
    is_free: boolean;
    media_count: number;
    like_count: number;
    value_score?: number;
}

export default function ValueRanker({ onClose }: { onClose: () => void }) {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("any");
    const [loaded, setLoaded] = useState(false);

    const CATEGORIES = [
        { value: "any", label: "All Categories" },
        { value: "free", label: "Free Only" },
        { value: "blonde", label: "Blonde" },
        { value: "brunette", label: "Brunette" },
        { value: "latina", label: "Latina" },
        { value: "asian", label: "Asian" },
        { value: "ebony", label: "Ebony" },
        { value: "milf", label: "MILF" },
        { value: "fitness", label: "Fitness" },
        { value: "cosplay", label: "Cosplay" },
        { value: "petite", label: "Petite" },
        { value: "curvy", label: "Curvy" },
    ];

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const tagParam = category !== "any" ? `&tag=${category}` : "";
            const res = await fetch(`/api/value-score?${tagParam}`);
            if (res.ok) {
                const data = await res.json();
                setCreators(data.creators || []);
            }
        } catch {
            // ignore
        }
        setLoading(false);
        setLoaded(true);
    };

    useEffect(() => {
        fetchRankings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCategoryChange = (val: string) => {
        setCategory(val);
        setTimeout(() => {
            setLoading(true);
            const tagParam = val !== "any" ? `&tag=${val}` : "";
            fetch(`/api/value-score?${tagParam}`)
                .then(r => r.json())
                .then(data => { setCreators(data.creators || []); setLoading(false); })
                .catch(() => setLoading(false));
        }, 0);
    };

    return (
        <div className="tool-modal-overlay" onClick={onClose}>
            <div className="tool-modal" onClick={(e) => e.stopPropagation()}>
                <button className="tool-modal-close" onClick={onClose}>×</button>
                <div className="tool-modal-header">
                    <span className="tool-modal-icon">📊</span>
                    <h2>Value Score Rankings</h2>
                    <p>Creators ranked by content per dollar. Higher score = more value for your money.</p>
                </div>

                <div className="value-controls">
                    <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="budget-select">
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>

                {loading && <div className="tool-loading">Calculating scores...</div>}

                {!loading && loaded && creators.length > 0 && (
                    <div className="value-list">
                        {creators.map((c, i) => (
                            <a key={c.id} href={`/onlyfans/creator/${c.username}`} className="value-item">
                                <span className="value-rank">#{i + 1}</span>
                                <div className="value-avatar">
                                    {c.avatar_url ? (
                                        <img src={proxyAvatarUrl(c.avatar_url)} alt={c.display_name || c.username} />
                                    ) : (
                                        <div className="budget-item-placeholder">{(c.display_name || c.username).charAt(0)}</div>
                                    )}
                                </div>
                                <div className="value-info">
                                    <span className="value-name">{c.display_name || c.username}</span>
                                    <span className="value-handle">@{c.username}</span>
                                </div>
                                <div className="value-meta">
                                    <span className="value-score-badge">{c.value_score?.toFixed(1)} pts</span>
                                    <span className="value-price">{c.is_free ? "FREE" : `$${c.subscription_price}/mo`}</span>
                                    <span className="value-media">📸 {c.media_count?.toLocaleString()}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {!loading && loaded && creators.length === 0 && (
                    <p className="budget-empty">No creators found for this category.</p>
                )}
            </div>
        </div>
    );
}
