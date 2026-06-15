import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");

    // Value score = media_count / price (free = huge score)
    let query = `
    SELECT id, username, display_name, avatar_url, subscription_price, is_free, media_count, like_count,
      CASE 
        WHEN is_free THEN media_count * 1.0
        WHEN subscription_price > 0 THEN (media_count * 1.0) / subscription_price
        ELSE 0
      END AS value_score
    FROM creators
    WHERE avatar_url IS NOT NULL AND avatar_url != ''
      AND media_count > 10
  `;
    const params: string[] = [];

    if (tag && tag !== "any") {
        params.push(tag);
        query += ` AND EXISTS (SELECT 1 FROM creator_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.creator_id = creators.id AND t.slug = $${params.length})`;
    }

    query += ` ORDER BY value_score DESC LIMIT 20`;

    try {
        const result = await pool.query(query, params);
        return NextResponse.json({ creators: result.rows });
    } catch {
        return NextResponse.json({ creators: [], error: "query failed" }, { status: 500 });
    }
}
