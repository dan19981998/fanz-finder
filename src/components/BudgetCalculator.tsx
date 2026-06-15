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
    like_count: number;
}

export default function BudgetCalculator({ onClose }: { onClose: () => void }) {
    const [budget, setBudget] = useState(25);
    const [category, setCategory] = useState("any");
    const [results, setResults] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(false);
    const [calculated, setCalculated] = useState(false);

    const CATEGORIES = [
        { value: "any", label: "Any Category" },
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

    const calculate = async () => {
        setLoading(true);
        try {
            const tagParam = category !== "any" ? `&tag=${category}` : "";
            const res = await fetch(`/api/budget?amount=${budget}${tagParam}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data.creators || []);
            }
        } catch {
            // ignore
        }
        setLoading(false);
        setCalculated(true);
    };

    const totalCost = results.reduce((sum, c) => sum + (c.is_free ? 0 : c.subscription_price), 0);
    const totalMedia = results.reduce((sum, c) => sum + (c.media_count || 0), 0);

    return (
        <div className="tool-modal-overlay" onClick={onClose}>
            <div className="tool-modal" onClick={(e) => e.stopPropagation()}>
                <button className="tool-modal-close" onClick={onClose}>×</button>
                <div className="tool-modal-header">
                    <span className="tool-modal-icon">💰</span>
                    <h2>Budget Calculator</h2>
                    <p>Enter your monthly budget — we&apos;ll find the best combination of creators to maximize your content.</p>
                </div>

                <div className="budget-controls">
                    <div className="budget-input-group">
                        <label>Monthly Budget</label>
                        <div className="budget-slider-row">
                            <span className="budget-amount">${budget}</span>
                            <input
                                type="range"
                                min={5}
                                max={100}
                                step={5}
                                value={budget}
                                onChange={(e) => setBudget(Number(e.target.value))}
                                className="budget-slider"
                            />
                        </div>
                    </div>

                    <div className="budget-input-group">
                        <label>Category Preference</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="budget-select">
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <button onClick={calculate} disabled={loading} className="budget-btn">
                        {loading ? "Calculating..." : "Find Best Combo"}
                    </button>
                </div>

                {calculated && results.length > 0 && (
                    <div className="budget-results">
                        <div className="budget-summary">
                            <div className="budget-stat">
                                <span className="budget-stat-num">{results.length}</span>
                                <span className="budget-stat-label">Creators</span>
                            </div>
                            <div className="budget-stat">
                                <span className="budget-stat-num">${totalCost.toFixed(0)}</span>
                                <span className="budget-stat-label">Total Cost</span>
                            </div>
                            <div className="budget-stat">
                                <span className="budget-stat-num">{totalMedia.toLocaleString()}</span>
                                <span className="budget-stat-label">Total Media</span>
                            </div>
                        </div>
                        <div className="budget-list">
                            {results.map((c) => (
                                <a key={c.id} href={`/onlyfans/creator/${c.username}`} className="budget-item">
                                    <div className="budget-item-avatar">
                                        {c.avatar_url ? (
                                            <img src={proxyAvatarUrl(c.avatar_url)} alt={c.display_name || c.username} />
                                        ) : (
                                            <div className="budget-item-placeholder">{(c.display_name || c.username).charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="budget-item-info">
                                        <span className="budget-item-name">{c.display_name || c.username}</span>
                                        <span className="budget-item-handle">@{c.username}</span>
                                    </div>
                                    <div className="budget-item-meta">
                                        <span className="budget-item-price">{c.is_free ? "FREE" : `$${c.subscription_price}`}</span>
                                        <span className="budget-item-media">📸 {c.media_count?.toLocaleString()}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {calculated && results.length === 0 && !loading && (
                    <p className="budget-empty">No creators found within this budget. Try increasing your budget or changing category.</p>
                )}
            </div>
        </div>
    );
}
