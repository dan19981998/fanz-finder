import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

interface SearchFilters {
    tags: string[];
    country: string | null;
    maxPrice: number | null;
    isFree: boolean;
    query: string;
    sort: "popular" | "newest" | "cheapest";
}

function parseQuery(raw: string): SearchFilters {
    const lower = raw.toLowerCase().trim();
    const filters: SearchFilters = {
        tags: [],
        country: null,
        maxPrice: null,
        isFree: false,
        query: "",
        sort: "popular",
    };

    // Extract price filters
    const priceMatch = lower.match(/under\s*\$?(\d+)/);
    if (priceMatch) {
        filters.maxPrice = parseFloat(priceMatch[1]);
    }
    const cheapMatch = lower.match(/cheap|cheapest|budget/);
    if (cheapMatch) {
        filters.sort = "cheapest";
        if (!filters.maxPrice) filters.maxPrice = 10;
    }

    // Detect free
    if (/\bfree\b/.test(lower)) {
        filters.isFree = true;
    }

    // Extract sort
    if (/\bnew(est)?\b|\brecent\b|\blatest\b/.test(lower)) {
        filters.sort = "newest";
    }
    if (/\bpopular\b|\btop\b|\bbest\b|\bhot(test)?\b/.test(lower)) {
        filters.sort = "popular";
    }

    // Known countries (common ones)
    const countries: Record<string, string> = {
        us: "United States", usa: "United States", "united states": "United States", american: "United States",
        uk: "United Kingdom", "united kingdom": "United Kingdom", british: "United Kingdom", english: "United Kingdom",
        canada: "Canada", canadian: "Canada",
        australia: "Australia", australian: "Australia", aussie: "Australia",
        germany: "Germany", german: "Germany",
        france: "France", french: "France",
        spain: "Spain", spanish: "Spain",
        italy: "Italy", italian: "Italy",
        brazil: "Brazil", brazilian: "Brazil",
        colombia: "Colombia", colombian: "Colombia",
        mexico: "Mexico", mexican: "Mexico",
        argentina: "Argentina", argentinian: "Argentina",
        romania: "Romania", romanian: "Romania",
        ukraine: "Ukraine", ukrainian: "Ukraine",
        russia: "Russia", russian: "Russia",
        japan: "Japan", japanese: "Japan",
        philippines: "Philippines", filipino: "Philippines",
        poland: "Poland", polish: "Poland",
        sweden: "Sweden", swedish: "Sweden",
        "south africa": "South Africa",
        netherlands: "Netherlands", dutch: "Netherlands",
    };

    for (const [key, value] of Object.entries(countries)) {
        if (lower.includes(key)) {
            filters.country = value;
            break;
        }
    }

    // Known tags / appearance traits
    const knownTags = [
        "blonde", "brunette", "redhead", "ginger", "asian", "latina", "ebony",
        "curvy", "petite", "thick", "slim", "fit", "athletic", "bbw", "milf",
        "teen", "mature", "goth", "alt", "tattoo", "tattooed", "pierced",
        "cosplay", "anime", "gamer", "nerd", "e-girl", "egirl",
        "feet", "foot", "femdom", "bdsm", "kink", "kinky", "dom", "sub",
        "couple", "couples", "lesbian", "gay", "bi", "trans", "transgender",
        "squirt", "anal", "oral", "solo",
        "big ass", "big boobs", "big tits", "small tits",
        "hairy", "shaved", "natural", "fake",
    ];

    for (const tag of knownTags) {
        if (lower.includes(tag)) {
            // Normalize some tags
            const normalized = tag === "ginger" ? "redhead"
                : tag === "big boobs" || tag === "big tits" ? "big-tits"
                    : tag === "small tits" ? "small-tits"
                        : tag === "big ass" ? "big-ass"
                            : tag === "tattooed" ? "tattoo"
                                : tag === "e-girl" ? "egirl"
                                    : tag === "transgender" ? "trans"
                                        : tag;
            if (!filters.tags.includes(normalized)) {
                filters.tags.push(normalized);
            }
        }
    }

    // Whatever is left (after removing known tokens) becomes the text query
    let remaining = lower;
    // Remove price phrases
    remaining = remaining.replace(/under\s*\$?\d+/g, "");
    remaining = remaining.replace(/\b(free|cheap|cheapest|budget|popular|top|best|hottest|hot|new|newest|recent|latest)\b/g, "");
    // Remove country words
    for (const key of Object.keys(countries)) {
        remaining = remaining.replace(new RegExp(`\\b${key}\\b`, "g"), "");
    }
    // Remove known tags
    for (const tag of knownTags) {
        remaining = remaining.replace(new RegExp(`\\b${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "g"), "");
    }
    remaining = remaining.replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, " ");
    if (remaining.length > 1) {
        filters.query = remaining;
    }

    return filters;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const offset = (page - 1) * limit;

    if (!q.trim()) {
        return NextResponse.json({ results: [], total: 0, page, filters: null });
    }

    const filters = parseQuery(q);

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    // Tag filtering — match ALL specified tags
    if (filters.tags.length > 0) {
        for (const tag of filters.tags) {
            conditions.push(
                `EXISTS (SELECT 1 FROM creator_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.creator_id = c.id AND t.slug = $${paramIndex})`
            );
            params.push(tag);
            paramIndex++;
        }
    }

    // Country
    if (filters.country) {
        conditions.push(`c.country = $${paramIndex}`);
        params.push(filters.country);
        paramIndex++;
    }

    // Price
    if (filters.isFree) {
        conditions.push(`c.is_free = true`);
    } else if (filters.maxPrice !== null) {
        conditions.push(`c.subscription_price <= $${paramIndex}`);
        params.push(filters.maxPrice);
        paramIndex++;
    }

    // Text query (search username, display_name, bio)
    if (filters.query) {
        conditions.push(
            `(c.username ILIKE $${paramIndex} OR c.display_name ILIKE $${paramIndex} OR c.bio ILIKE $${paramIndex})`
        );
        params.push(`%${filters.query}%`);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Sort
    let orderBy = "c.subscriber_count DESC NULLS LAST";
    if (filters.sort === "newest") orderBy = "c.created_at DESC";
    if (filters.sort === "cheapest") orderBy = "c.subscription_price ASC, c.subscriber_count DESC NULLS LAST";

    // Count
    const countQuery = `SELECT COUNT(*) as total FROM creators c ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Results
    const dataQuery = `
    SELECT c.username, c.display_name, c.avatar_url, c.subscription_price, c.is_free,
           c.media_count, c.photo_count, c.video_count, c.like_count, c.subscriber_count,
           c.country, c.bio,
           ARRAY(SELECT t.slug FROM creator_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.creator_id = c.id) as tags
    FROM creators c
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
    params.push(limit, offset);

    const dataResult = await pool.query(dataQuery, params);

    return NextResponse.json({
        results: dataResult.rows,
        total,
        page,
        pages: Math.ceil(total / limit),
        filters,
    });
}
