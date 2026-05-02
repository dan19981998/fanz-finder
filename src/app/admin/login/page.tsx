"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            router.push("/admin");
        } else {
            setError("Invalid password");
            setLoading(false);
        }
    };

    return (
        <div className="adm" style={{ maxWidth: 420, paddingTop: 120 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Admin Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: 15,
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        marginBottom: 12,
                    }}
                />
                {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: 15,
                        fontWeight: 600,
                        borderRadius: 8,
                        border: "none",
                        background: "var(--accent)",
                        color: "#fff",
                        cursor: loading ? "wait" : "pointer",
                    }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
