import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { verifyToken } from "@/app/api/admin/route";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Admin Dashboard | Lush Finder",
    robots: { index: false, follow: false },
};

export default async function AdminPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
        redirect("/admin/login");
    }

    const [
        totalClicksResult,
        clicksTodayResult,
        clicksByDayResult,
        clicksByCategoryResult,
        topAccountsResult,
        totalCreatorsResult,
    ] = await Promise.all([
        pool.query(`SELECT COUNT(*) AS count FROM clicks`),
        pool.query(`SELECT COUNT(*) AS count FROM clicks WHERE clicked_at >= CURRENT_DATE`),
        pool.query(`
      SELECT DATE(clicked_at) AS day, COUNT(*) AS clicks
      FROM clicks
      WHERE clicked_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(clicked_at)
      ORDER BY day DESC
    `),
        pool.query(`
      SELECT c.source AS category, COUNT(*) AS clicks
      FROM clicks c
      WHERE c.source IS NOT NULL
      GROUP BY c.source
      ORDER BY clicks DESC
    `),
        pool.query(`
      SELECT cr.username, cr.display_name, cr.avatar_url, COUNT(cl.id) AS clicks
      FROM clicks cl
      JOIN creators cr ON cl.creator_id = cr.id
      GROUP BY cr.id, cr.username, cr.display_name, cr.avatar_url
      ORDER BY clicks DESC
      LIMIT 50
    `),
        pool.query(`SELECT COUNT(*) AS count FROM creators`),
    ]);

    const totalClicks = Number(totalClicksResult.rows[0].count);
    const clicksToday = Number(clicksTodayResult.rows[0].count);
    const clicksByDay = clicksByDayResult.rows;
    const clicksByCategory = clicksByCategoryResult.rows;
    const topAccounts = topAccountsResult.rows;
    const totalCreators = Number(totalCreatorsResult.rows[0].count);

    return (
        <div className="adm">
            <div className="adm-topbar">
                <h1>Admin Dashboard</h1>
                <form action="/api/admin/logout" method="POST">
                    <button type="submit" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer" }}>
                        Logout
                    </button>
                </form>
            </div>

            {/* KPIs */}
            <div className="adm-section-label">📊 Overview</div>
            <div className="adm-kpis">
                <div className="adm-kpi">
                    <span className="adm-kpi-num">{totalClicks.toLocaleString()}</span>
                    <span className="adm-kpi-label">All-time Clicks</span>
                </div>
                <div className="adm-kpi">
                    <span className="adm-kpi-num">{clicksToday.toLocaleString()}</span>
                    <span className="adm-kpi-label">Clicks Today</span>
                </div>
                <div className="adm-kpi">
                    <span className="adm-kpi-num">{totalCreators.toLocaleString()}</span>
                    <span className="adm-kpi-label">Total Creators</span>
                </div>
            </div>

            {/* Clicks per day */}
            <div className="adm-section-label">📅 Clicks Per Day (Last 30 Days)</div>
            <div className="adm-panel">
                {clicksByDay.length === 0 ? (
                    <p className="adm-empty">No click data yet.</p>
                ) : (
                    <table className="adm-table adm-table--compact">
                        <thead>
                            <tr><th>Date</th><th>Clicks</th></tr>
                        </thead>
                        <tbody>
                            {clicksByDay.map((row: any) => (
                                <tr key={row.day}>
                                    <td>{new Date(row.day).toLocaleDateString()}</td>
                                    <td>{Number(row.clicks).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Clicks per category */}
            <div className="adm-section-label">🏷️ Clicks Per Category</div>
            <div className="adm-panel">
                {clicksByCategory.length === 0 ? (
                    <p className="adm-empty">No category click data yet.</p>
                ) : (
                    <table className="adm-table">
                        <thead>
                            <tr><th>Category</th><th>Clicks</th></tr>
                        </thead>
                        <tbody>
                            {clicksByCategory.map((row: any) => (
                                <tr key={row.category}>
                                    <td>{row.category}</td>
                                    <td>{Number(row.clicks).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Top 50 accounts */}
            <div className="adm-section-label">🔥 Top 50 Accounts by Clicks</div>
            <div className="adm-panel">
                {topAccounts.length === 0 ? (
                    <p className="adm-empty">No click data yet.</p>
                ) : (
                    <table className="adm-table">
                        <thead>
                            <tr><th>#</th><th>Creator</th><th>Clicks</th></tr>
                        </thead>
                        <tbody>
                            {topAccounts.map((row: any, i: number) => (
                                <tr key={row.username}>
                                    <td className="adm-cell-dim">{i + 1}</td>
                                    <td>{row.display_name || row.username}</td>
                                    <td>{Number(row.clicks).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
