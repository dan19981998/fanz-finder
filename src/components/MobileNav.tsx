"use client";

import { useState, useEffect } from "react";

export default function MobileNav() {
    const [open, setOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <div className="mobile-nav">
            <button
                className={`hamburger${open ? " hamburger-open" : ""}`}
                onClick={() => setOpen(!open)}
                aria-label="Menu"
            >
                <span /><span /><span />
            </button>

            {open && (
                <div className="mobile-menu-overlay" onClick={() => setOpen(false)}>
                    <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <a href="/categories" className="mobile-menu-link" onClick={() => setOpen(false)}>Categories</a>
                        <a href="/onlyfans/free" className="mobile-menu-link" onClick={() => setOpen(false)}>Free</a>

                        <button className="mobile-menu-link mobile-menu-toggle" onClick={() => setToolsOpen(!toolsOpen)}>
                            Tools <span className={`mobile-arrow${toolsOpen ? " mobile-arrow-open" : ""}`}>▾</span>
                        </button>
                        {toolsOpen && (
                            <div className="mobile-submenu">
                                <a href="/tools#quiz" onClick={() => setOpen(false)}>🎯 Creator Quiz</a>
                                <a href="/tools#compare" onClick={() => setOpen(false)}>⚖️ Compare Tool</a>
                                <a href="/tools#budget" onClick={() => setOpen(false)}>💰 Budget Calculator</a>
                                <a href="/tools#value" onClick={() => setOpen(false)}>📊 Value Rankings</a>
                                <a href="/tools#watchlist" onClick={() => setOpen(false)}>⭐ My Watchlist</a>
                                <a href="/tools#random" onClick={() => setOpen(false)}>🎰 Random Discovery</a>
                            </div>
                        )}

                        <a href="/onlyfans/near-me" className="mobile-menu-link" onClick={() => setOpen(false)}>Near Me</a>
                        <a href="/about" className="mobile-menu-link" onClick={() => setOpen(false)}>About</a>
                    </nav>
                </div>
            )}
        </div>
    );
}
