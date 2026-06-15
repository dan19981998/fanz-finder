import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const freeOnly = searchParams.get("free") === "1";

    let query = `
    SELECT id, username, display_name, avatar_url, subscription_price, is_free, media_count, like_count
    FROM creators
    WHERE avatar_url IS NOT NULL AND avatar_url != ''
      AND media_count > 0
  `;
    const params: string[] = [];

    if (tag && tag !== "any") {
        params.push(tag);
        query += ` AND EXISTS (SELECT 1 FROM creator_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.creator_id = creators.id AND t.slug = $${params.length})`;
    }

    if (freeOnly) {
        query += ` AND is_free = true`;
    }

    query += ` ORDER BY RANDOM() LIMIT 1`;

    try {
        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return NextResponse.json({ creator: null });
        }
        return NextResponse.json({ creator: result.rows[0] });
    } catch {
        return NextResponse.json({ creator: null, error: "query failed" }, { status: 500 });
    }
}
