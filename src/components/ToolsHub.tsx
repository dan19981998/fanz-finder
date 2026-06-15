"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const BudgetCalculator = dynamic(() => import("./BudgetCalculator"), { ssr: false });
const ValueRanker = dynamic(() => import("./ValueRanker"), { ssr: false });
const Watchlist = dynamic(() => import("./Watchlist"), { ssr: false });
const RandomSpinner = dynamic(() => import("./RandomSpinner"), { ssr: false });

type ToolType = "budget" | "value" | "watchlist" | "random" | null;

const TOOLS = [
    { id: "budget" as const, icon: "💰", title: "Budget Calculator", desc: "Best creator combo for your budget" },
    { id: "value" as const, icon: "📊", title: "Value Rankings", desc: "Most content per dollar spent" },
    { id: "watchlist" as const, icon: "⭐", title: "My Watchlist", desc: "Save & track favourite creators" },
    { id: "random" as const, icon: "🎰", title: "Random Discovery", desc: "Spin the wheel, find someone new" },
];

export default function ToolsHub() {
    const [active, setActive] = useState<ToolType>(null);

    return (
        <>
            <div className="tools-grid">
                {TOOLS.map((tool) => (
                    <button key={tool.id} className="tools-card" onClick={() => setActive(tool.id)}>
                        <span className="tools-card-icon">{tool.icon}</span>
                        <span className="tools-card-title">{tool.title}</span>
                        <span className="tools-card-desc">{tool.desc}</span>
                    </button>
                ))}
            </div>

            {active === "budget" && <BudgetCalculator onClose={() => setActive(null)} />}
            {active === "value" && <ValueRanker onClose={() => setActive(null)} />}
            {active === "watchlist" && <Watchlist onClose={() => setActive(null)} />}
            {active === "random" && <RandomSpinner onClose={() => setActive(null)} />}
        </>
    );
}
