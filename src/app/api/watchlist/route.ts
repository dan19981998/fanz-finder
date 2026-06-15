import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
    let body: { usernames?: string[] };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ creators: [] }, { status: 400 });
    }

    const usernames = body.usernames;
    if (!usernames || !Array.isArray(usernames) || usernames.length === 0 || usernames.length > 50) {
        return NextResponse.json({ creators: [] }, { status: 400 });
    }

    // Sanitize usernames
    const clean = usernames.map((u) => u.toLowerCase().replace(/[^a-z0-9_.-]/g, "")).filter(Boolean);
    if (clean.length === 0) return NextResponse.json({ creators: [] });

    try {
        const placeholders = clean.map((_, i) => `$${i + 1}`).join(",");
        const result = await pool.query(
            `SELECT id, username, display_name, avatar_url, subscription_price, is_free, media_count, like_count
       FROM creators WHERE username IN (${placeholders})`,
            clean
        );
        return NextResponse.json({ creators: result.rows });
    } catch {
        return NextResponse.json({ creators: [], error: "query failed" }, { status: 500 });
    }
}
