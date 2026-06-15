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

export default function RandomSpinner({ onClose }: { onClose: () => void }) {
    const [category, setCategory] = useState("any");
    const [freeOnly, setFreeOnly] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<Creator | null>(null);
    const [spins, setSpins] = useState(0);

    const CATEGORIES = [
        { value: "any", label: "Any Category" },
        { value: "blonde", label: "Blonde" },
        { value: "brunette", label: "Brunette" },
        { value: "redhead", label: "Redhead" },
        { value: "latina", label: "Latina" },
        { value: "asian", label: "Asian" },
        { value: "ebony", label: "Ebony" },
        { value: "milf", label: "MILF" },
        { value: "fitness", label: "Fitness" },
        { value: "cosplay", label: "Cosplay" },
        { value: "petite", label: "Petite" },
        { value: "curvy", label: "Curvy" },
        { value: "goth", label: "Goth" },
    ];

    const spin = async () => {
        setSpinning(true);
        setResult(null);
        // Simulate spinning delay for effect
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
        try {
            const params = new URLSearchParams();
            if (category !== "any") params.set("tag", category);
            if (freeOnly) params.set("free", "1");
            const res = await fetch(`/api/random?${params}`);
            if (res.ok) {
                const data = await res.json();
                setResult(data.creator || null);
            }
        } catch {
            // ignore
        }
        setSpinning(false);
        setSpins((s) => s + 1);
    };

    return (
        <div className="tool-modal-overlay" onClick={onClose}>
            <div className="tool-modal" onClick={(e) => e.stopPropagation()}>
                <button className="tool-modal-close" onClick={onClose}>×</button>
                <div className="tool-modal-header">
                    <span className="tool-modal-icon">🎰</span>
                    <h2>Random Discovery</h2>
                    <p>Can&apos;t decide? Set your filters and spin the wheel. Find someone new every time.</p>
                </div>

                <div className="spinner-controls">
                    <div className="spinner-row">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="budget-select">
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>

                        <label className="spinner-toggle">
                            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
                            <span>Free only</span>
                        </label>
                    </div>

                    <button onClick={spin} disabled={spinning} className={`spinner-btn${spinning ? " spinner-btn-active" : ""}`}>
                        {spinning ? "🎰 Spinning..." : "🎲 Spin"}
                    </button>

                    {spins > 0 && <span className="spinner-count">{spins} spin{spins !== 1 ? "s" : ""} today</span>}
                </div>

                {spinning && (
                    <div className="spinner-animation">
                        <div className="spinner-reel">🎰</div>
                    </div>
                )}

                {result && !spinning && (
                    <div className="spinner-result">
                        <a href={`/onlyfans/creator/${result.username}`} className="spinner-result-card">
                            <div className="spinner-result-avatar">
                                {result.avatar_url ? (
                                    <img src={proxyAvatarUrl(result.avatar_url)} alt={result.display_name || result.username} />
                                ) : (
                                    <div className="budget-item-placeholder">{(result.display_name || result.username).charAt(0)}</div>
                                )}
                            </div>
                            <div className="spinner-result-info">
                                <span className="spinner-result-name">{result.display_name || result.username}</span>
                                <span className="spinner-result-handle">@{result.username}</span>
                                <div className="spinner-result-stats">
                                    <span>{result.is_free ? "FREE" : `$${result.subscription_price}/mo`}</span>
                                    <span>📸 {result.media_count?.toLocaleString()}</span>
                                    <span>❤️ {result.like_count?.toLocaleString()}</span>
                                </div>
                            </div>
                        </a>
                        <button onClick={spin} className="spinner-again">Spin Again →</button>
                    </div>
                )}
            </div>
        </div>
    );
}
