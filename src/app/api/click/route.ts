import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";

// ─── Bot detection ──────────────────────────────────────────────────────────
const BOT_UA_PATTERNS = [
    /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
    /facebookexternalhit/i, /bingpreview/i, /yandex/i, /baidu/i,
    /semrush/i, /ahrefs/i, /mj12bot/i, /dotbot/i, /petalbot/i,
    /bytespider/i, /gptbot/i, /claudebot/i, /ccbot/i,
];

function isBot(ua: string): boolean {
    return BOT_UA_PATTERNS.some((p) => p.test(ua));
}

// ─── In-memory IP rate limiter (10 clicks per 5 minutes per IP) ─────────────
const RATE_WINDOW = 5 * 60 * 1000; // 5 minutes
const RATE_MAX = 10;
const ipMap = new Map<string, { count: number; start: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = ipMap.get(ip);

    if (!entry || now - entry.start > RATE_WINDOW) {
        ipMap.set(ip, { count: 1, start: now });
        return true;
    }

    if (entry.count >= RATE_MAX) return false;
    entry.count++;
    return true;
}

// Clean up stale entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipMap) {
        if (now - entry.start > RATE_WINDOW) ipMap.delete(ip);
    }
}, 10 * 60 * 1000);

// ─── POST /api/click ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const ua = req.headers.get("user-agent") || "";
    if (isBot(ua)) {
        return NextResponse.json({ ok: false }, { status: 403 });
    }

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    if (!checkRateLimit(ip)) {
        return NextResponse.json({ ok: false, error: "rate limited" }, { status: 429 });
    }

    let body: { creator_id?: number; source?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    const creatorId = body.creator_id;
    const source = body.source || null;

    if (!creatorId || typeof creatorId !== "number") {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Hash IP for privacy
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    // Deduplicate: same IP + creator within 10 minutes
    try {
        const recent = await pool.query(
            `SELECT id FROM clicks WHERE creator_id = $1 AND ip_hash = $2 AND clicked_at > NOW() - INTERVAL '10 minutes' LIMIT 1`,
            [creatorId, ipHash]
        );

        if (recent.rows.length > 0) {
            return NextResponse.json({ ok: true, deduped: true });
        }

        await pool.query(
            `INSERT INTO clicks (creator_id, ip_hash, source) VALUES ($1, $2, $3)`,
            [creatorId, ipHash, source]
        );

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
