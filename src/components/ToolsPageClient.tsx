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
    value_score?: number;
}

export default function ToolsPageClient() {
    return (
        <>
            <BudgetSection />
            <ValueSection />
            <WatchlistSection />
            <RandomSection />
        </>
    );
}

/* ═══════ Budget Calculator ═══════ */
function BudgetSection() {
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
        } catch { /* ignore */ }
        setLoading(false);
        setCalculated(true);
    };

    const totalCost = results.reduce((sum, c) => sum + (c.is_free ? 0 : Number(c.subscription_price)), 0);
    const totalMedia = results.reduce((sum, c) => sum + (c.media_count || 0), 0);

    return (
        <section className="tools-page-section" id="budget">
            <div className="hp-section-inner">
                <div className="tools-page-header">
                    <span className="tools-page-icon">💰</span>
                    <div>
                        <h2>Budget Calculator</h2>
                        <p>Enter your monthly budget and we&apos;ll find the best combination of creators — maximized content per dollar.</p>
                    </div>
                </div>
                <div className="tools-page-body">
                    <div className="budget-controls">
                        <div className="budget-input-group">
                            <label>Monthly Budget</label>
                            <div className="budget-slider-row">
                                <span className="budget-amount">${budget}</span>
                                <input type="range" min={5} max={100} step={5} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="budget-slider" />
                            </div>
                        </div>
                        <div className="budget-input-group">
                            <label>Category Preference</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="budget-select">
                                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <button onClick={calculate} disabled={loading} className="budget-btn">
                            {loading ? "Calculating..." : "Find Best Combo"}
                        </button>
                    </div>

                    {calculated && results.length > 0 && (
                        <div className="budget-results">
                            <div className="budget-summary">
                                <div className="budget-stat"><span className="budget-stat-num">{results.length}</span><span className="budget-stat-label">Creators</span></div>
                                <div className="budget-stat"><span className="budget-stat-num">${totalCost.toFixed(0)}</span><span className="budget-stat-label">Total Cost</span></div>
                                <div className="budget-stat"><span className="budget-stat-num">{totalMedia.toLocaleString()}</span><span className="budget-stat-label">Total Media</span></div>
                            </div>
                            <div className="budget-list">
                                {results.map((c) => (
                                    <a key={c.id} href={`/onlyfans/creator/${c.username}`} className="budget-item">
                                        <div className="budget-item-avatar">
                                            {c.avatar_url ? <img src={proxyAvatarUrl(c.avatar_url)} alt={c.display_name || c.username} /> : <div className="budget-item-placeholder">{(c.display_name || c.username).charAt(0)}</div>}
                                        </div>
                                        <div className="budget-item-info"><span className="budget-item-name">{c.display_name || c.username}</span><span className="budget-item-handle">@{c.username}</span></div>
                                        <div className="budget-item-meta"><span className="budget-item-price">{c.is_free ? "FREE" : `$${c.subscription_price}`}</span><span className="budget-item-media">📸 {c.media_count?.toLocaleString()}</span></div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    {calculated && results.length === 0 && !loading && <p className="budget-empty">No creators found within this budget. Try increasing or changing category.</p>}
                </div>
            </div>
        </section>
    );
}

/* ═══════ Value Rankings ═══════ */
function ValueSection() {
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

    const fetchRankings = async (tag: string) => {
        setLoading(true);
        try {
            const tagParam = tag !== "any" ? `&tag=${tag}` : "";
            const res = await fetch(`/api/value-score?${tagParam}`);
            if (res.ok) {
                const data = await res.json();
                setCreators(data.creators || []);
            }
        } catch { /* ignore */ }
        setLoading(false);
        setLoaded(true);
    };

    const handleLoad = () => { if (!loaded) fetchRankings(category); };
    const handleCategoryChange = (val: string) => { setCategory(val); fetchRankings(val); };

    return (
        <section className="tools-page-section" id="value">
            <div className="hp-section-inner">
                <div className="tools-page-header">
                    <span className="tools-page-icon">📊</span>
                    <div>
                        <h2>Value Score Rankings</h2>
                        <p>Creators ranked by content per dollar. Higher score = more value for your money.</p>
                    </div>
                </div>
                <div className="tools-page-body">
                    <div className="value-controls" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="budget-select" style={{ maxWidth: "250px" }}>
                            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        {!loaded && <button onClick={handleLoad} className="budget-btn" style={{ maxWidth: "200px" }}>Load Rankings</button>}
                    </div>

                    {loading && <div className="tool-loading">Calculating scores...</div>}

                    {!loading && loaded && creators.length > 0 && (
                        <div className="value-list">
                            {creators.map((c, i) => (
                                <a key={c.id} href={`/onlyfans/creator/${c.username}`} className="value-item">
                                    <span className="value-rank">#{i + 1}</span>
                                    <div className="value-avatar">
                                        {c.avatar_url ? <img src={proxyAvatarUrl(c.avatar_url)} alt={c.display_name || c.username} /> : <div className="budget-item-placeholder">{(c.display_name || c.username).charAt(0)}</div>}
                                    </div>
                                    <div className="value-info"><span className="value-name">{c.display_name || c.username}</span><span className="value-handle">@{c.username}</span></div>
                                    <div className="value-meta">
                                        <span className="value-score-badge">{Number(c.value_score || 0).toFixed(0)} pts</span>
                                        <span className="value-price">{c.is_free ? "FREE" : `$${c.subscription_price}/mo`}</span>
                                        <span className="value-media">📸 {c.media_count?.toLocaleString()}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                    {!loading && loaded && creators.length === 0 && <p className="budget-empty">No creators found for this category.</p>}
                </div>
            </div>
        </section>
    );
}

/* ═══════ Watchlist ═══════ */
function WatchlistSection() {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [searchResults, setSearchResults] = useState<Creator[]>([]);
    const [searching, setSearching] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const init = () => {
        if (initialized) return;
        setInitialized(true);
        const saved = localStorage.getItem("findfanz_watchlist");
        if (saved) {
            const parsed = JSON.parse(saved) as string[];
            setWatchlist(parsed);
            if (parsed.length > 0) loadCreators(parsed);
        }
    };

    const loadCreators = async (usernames: string[]) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/watchlist`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usernames }) });
            if (res.ok) { const data = await res.json(); setCreators(data.creators || []); }
        } catch { /* ignore */ }
        setLoading(false);
    };

    const addToWatchlist = (username: string) => {
        if (watchlist.includes(username)) return;
        const updated = [...watchlist, username];
        setWatchlist(updated);
        localStorage.setItem("findfanz_watchlist", JSON.stringify(updated));
        loadCreators(updated);
        setSearchVal(""); setSearchResults([]);
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
            if (res.ok) { const data = await res.json(); setSearchResults(data.results || []); }
        } catch { /* ignore */ }
        setSearching(false);
    };

    const totalMonthly = creators.reduce((sum, c) => sum + (c.is_free ? 0 : Number(c.subscription_price) || 0), 0);

    return (
        <section className="tools-page-section" id="watchlist">
            <div className="hp-section-inner">
                <div className="tools-page-header">
                    <span className="tools-page-icon">⭐</span>
                    <div>
                        <h2>My Watchlist</h2>
                        <p>Save creators you&apos;re interested in. Track your total monthly spend. Stored locally — no account needed.</p>
                    </div>
                </div>
                <div className="tools-page-body">
                    {!initialized ? (
                        <button onClick={init} className="budget-btn" style={{ maxWidth: "200px" }}>Load My Watchlist</button>
                    ) : (
                        <>
                            <div className="watchlist-search">
                                <div className="watchlist-search-row">
                                    <input type="text" placeholder="Search username to add..." value={searchVal} onChange={(e) => setSearchVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchCreator()} className="watchlist-input" />
                                    <button onClick={searchCreator} disabled={searching} className="watchlist-search-btn">{searching ? "..." : "Search"}</button>
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="watchlist-suggestions">
                                        {searchResults.map((c) => <button key={c.id} className="watchlist-suggestion" onClick={() => addToWatchlist(c.username)}>@{c.username} <span className="watchlist-add-icon">+</span></button>)}
                                    </div>
                                )}
                            </div>

                            {loading && <div className="tool-loading">Loading watchlist...</div>}

                            {!loading && creators.length > 0 && (
                                <>
                                    <div className="watchlist-summary"><span>{creators.length} creator{creators.length !== 1 ? "s" : ""} saved</span><span>Total: ${totalMonthly.toFixed(2)}/mo</span></div>
                                    <div className="watchlist-list">
                                        {creators.map((c) => (
                                            <div key={c.id} className="watchlist-item">
                                                <a href={`/onlyfans/creator/${c.username}`} className="watchlist-item-link">
                                                    <div className="watchlist-avatar">{c.avatar_url ? <img src={proxyAvatarUrl(c.avatar_url)} alt={c.display_name || c.username} /> : <div className="budget-item-placeholder">{(c.display_name || c.username).charAt(0)}</div>}</div>
                                                    <div className="watchlist-info"><span className="watchlist-name">{c.display_name || c.username}</span><span className="watchlist-handle">@{c.username}</span></div>
                                                    <div className="watchlist-meta"><span>{c.is_free ? "FREE" : `$${c.subscription_price}/mo`}</span><span>📸 {c.media_count?.toLocaleString()}</span></div>
                                                </a>
                                                <button className="watchlist-remove" onClick={() => removeFromWatchlist(c.username)}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {!loading && creators.length === 0 && initialized && <p className="budget-empty">Your watchlist is empty. Search for creators above to start saving.</p>}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

/* ═══════ Random Discovery ═══════ */
function RandomSection() {
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
        setSpinning(true); setResult(null);
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
        try {
            const params = new URLSearchParams();
            if (category !== "any") params.set("tag", category);
            if (freeOnly) params.set("free", "1");
            const res = await fetch(`/api/random?${params}`);
            if (res.ok) { const data = await res.json(); setResult(data.creator || null); }
        } catch { /* ignore */ }
        setSpinning(false);
        setSpins((s) => s + 1);
    };

    return (
        <section className="tools-page-section" id="random">
            <div className="hp-section-inner">
                <div className="tools-page-header">
                    <span className="tools-page-icon">🎰</span>
                    <div>
                        <h2>Random Discovery</h2>
                        <p>Can&apos;t decide? Set your filters and spin — discover someone new every time.</p>
                    </div>
                </div>
                <div className="tools-page-body">
                    <div className="spinner-controls">
                        <div className="spinner-row">
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="budget-select">
                                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <label className="spinner-toggle"><input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} /><span>Free only</span></label>
                        </div>
                        <button onClick={spin} disabled={spinning} className={`spinner-btn${spinning ? " spinner-btn-active" : ""}`}>
                            {spinning ? "🎰 Spinning..." : "🎲 Spin"}
                        </button>
                        {spins > 0 && <span className="spinner-count">{spins} spin{spins !== 1 ? "s" : ""}</span>}
                    </div>

                    {spinning && <div className="spinner-animation"><div className="spinner-reel">🎰</div></div>}

                    {result && !spinning && (
                        <div className="spinner-result">
                            <a href={`/onlyfans/creator/${result.username}`} className="spinner-result-card">
                                <div className="spinner-result-avatar">
                                    {result.avatar_url ? <img src={proxyAvatarUrl(result.avatar_url)} alt={result.display_name || result.username} /> : <div className="budget-item-placeholder">{(result.display_name || result.username).charAt(0)}</div>}
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
        </section>
    );
}
