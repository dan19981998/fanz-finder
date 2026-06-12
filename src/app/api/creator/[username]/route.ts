import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params;

    if (!username || username.length > 50 || !/^[a-z0-9._-]+$/i.test(username)) {
        return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    try {
        const result = await pool.query(
            `SELECT id, username, display_name, avatar_url, subscription_price, is_free, media_count, photo_count, video_count, like_count
             FROM creators WHERE username = $1 LIMIT 1`,
            [username.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
