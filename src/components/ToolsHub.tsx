"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const BudgetCalculator = dynamic(() => import("./BudgetCalculator"), { ssr: false });
const ValueRanker = dynamic(() => import("./ValueRanker"), { ssr: false });
const Watchlist = dynamic(() => import("./Watchlist"), { ssr: false });
const RandomSpinner = dynamic(() => import("./RandomSpinner"), { ssr: false });

type ToolType = "budget" | "value" | "watchlist" | "random" | null;

export default function ToolsHub() {
    const [active, setActive] = useState<ToolType>(null);

    return (
        <>
            <div className="tools-grid">
                <button className="tools-card tools-card--budget" onClick={() => setActive("budget")}>
                    <div className="tools-card-visual">
                        <span className="tools-card-icon">💰</span>
                        <span className="tools-card-tag">Interactive</span>
                    </div>
                    <div className="tools-card-body">
                        <span className="tools-card-title">Budget Calculator</span>
                        <span className="tools-card-desc">Enter your monthly budget and get the best combination of creators — maximized content per dollar.</span>
                        <span className="tools-card-cta">Calculate Now →</span>
                    </div>
                </button>

                <button className="tools-card tools-card--value" onClick={() => setActive("value")}>
                    <div className="tools-card-visual">
                        <span className="tools-card-icon">📊</span>
                        <span className="tools-card-tag">Rankings</span>
                    </div>
                    <div className="tools-card-body">
                        <span className="tools-card-title">Value Score Rankings</span>
                        <span className="tools-card-desc">See which creators deliver the most content for the lowest price. Sorted by our value algorithm.</span>
                        <span className="tools-card-cta">View Rankings →</span>
                    </div>
                </button>

                <button className="tools-card tools-card--watchlist" onClick={() => setActive("watchlist")}>
                    <div className="tools-card-visual">
                        <span className="tools-card-icon">⭐</span>
                        <span className="tools-card-tag">Personal</span>
                    </div>
                    <div className="tools-card-body">
                        <span className="tools-card-title">My Watchlist</span>
                        <span className="tools-card-desc">Save creators you&apos;re interested in. Track total spend. No account needed — stored on your device.</span>
                        <span className="tools-card-cta">Open Watchlist →</span>
                    </div>
                </button>

                <button className="tools-card tools-card--random" onClick={() => setActive("random")}>
                    <div className="tools-card-visual">
                        <span className="tools-card-icon">🎰</span>
                        <span className="tools-card-tag">Fun</span>
                    </div>
                    <div className="tools-card-body">
                        <span className="tools-card-title">Random Discovery</span>
                        <span className="tools-card-desc">Can&apos;t decide? Set your preferences and spin — discover someone new every time you click.</span>
                        <span className="tools-card-cta">Spin Now →</span>
                    </div>
                </button>
            </div>

            {active === "budget" && <BudgetCalculator onClose={() => setActive(null)} />}
            {active === "value" && <ValueRanker onClose={() => setActive(null)} />}
            {active === "watchlist" && <Watchlist onClose={() => setActive(null)} />}
            {active === "random" && <RandomSpinner onClose={() => setActive(null)} />}
        </>
    );
}
