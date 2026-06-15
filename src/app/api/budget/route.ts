import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const amount = Math.min(Math.max(Number(searchParams.get("amount")) || 25, 5), 200);
    const tag = searchParams.get("tag");

    let query = `
    SELECT id, username, display_name, avatar_url, subscription_price, is_free, media_count, like_count
    FROM creators
    WHERE avatar_url IS NOT NULL AND avatar_url != ''
      AND (is_free = true OR (subscription_price > 0 AND subscription_price <= $1))
  `;
    const params: (number | string)[] = [amount];

    if (tag && tag !== "any") {
        params.push(tag);
        query += ` AND EXISTS (SELECT 1 FROM creator_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.creator_id = creators.id AND t.slug = $${params.length})`;
    }

    // Get creators sorted by value (media per dollar), fitting within budget
    query += ` ORDER BY CASE WHEN is_free THEN 999999 ELSE media_count / GREATEST(subscription_price, 0.01) END DESC LIMIT 50`;

    try {
        const result = await pool.query(query, params);
        // Greedy knapsack: pick creators until budget exhausted
        const selected: typeof result.rows = [];
        let remaining = amount;

        for (const creator of result.rows) {
            const cost = creator.is_free ? 0 : creator.subscription_price;
            if (cost <= remaining) {
                selected.push(creator);
                remaining -= cost;
                if (selected.length >= 8) break;
            }
        }

        return NextResponse.json({ creators: selected, budget: amount, spent: amount - remaining });
    } catch {
        return NextResponse.json({ creators: [], error: "query failed" }, { status: 500 });
    }
}
