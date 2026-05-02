import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const COOKIE_NAME = "admin_token";

function makeToken(): string {
    const payload = `admin:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
    const secret = process.env.ADMIN_SECRET || "of-directory-admin-secret";
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return Buffer.from(`${payload}:${sig}`).toString("base64");
}

export function verifyToken(token: string): boolean {
    try {
        const decoded = Buffer.from(token, "base64").toString();
        const lastColon = decoded.lastIndexOf(":");
        if (lastColon === -1) return false;
        const payload = decoded.slice(0, lastColon);
        const sig = decoded.slice(lastColon + 1);
        const secret = process.env.ADMIN_SECRET || "of-directory-admin-secret";
        const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
        return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    let body: { password?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!body.password || body.password !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = makeToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/admin",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
}
