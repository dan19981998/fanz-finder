/**
 * Scrape NearbyOnly category/location pages for creator usernames.
 * Each page embeds creator profile links in the HTML.
 * 618 pages × ~50 creators each = up to 30K more.
 *
 * Usage: DATABASE_URL="..." node scripts/scrape-nearby-pages.mjs
 */

import * as cheerio from 'cheerio';
import pg from 'pg';
import { readFileSync } from 'fs';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dan@localhost:5432/of_directory',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 5,
});

const DELAY_MS = 400;
const BATCH_SIZE = 200;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            },
        });
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

function extractUsernames(html) {
    const $ = cheerio.load(html);
    const usernames = new Set();

    // Find all links to /onlyfans/username
    $('a[href*="/onlyfans/"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const match = href.match(/\/onlyfans\/([^/?#]+)/);
        if (match && match[1]) {
            usernames.add(match[1]);
        }
    });

    // Also check image sources for avatar patterns
    $('img[src*="cdn.nearbyonly.com/avatars/"]').each((_, el) => {
        const src = $(el).attr('src') || '';
        const match = src.match(/avatars\/([^.]+)\.webp/);
        if (match && match[1]) {
            usernames.add(match[1]);
        }
    });

    // Check _next/image URLs
    $('img[src*="avatars%2F"]').each((_, el) => {
        const src = $(el).attr('src') || '';
        const match = src.match(/avatars%2F([^.]+)\.webp/);
        if (match && match[1]) {
            usernames.add(match[1]);
        }
    });

    return [...usernames];
}

async function bulkInsert(usernames) {
    if (usernames.length === 0) return 0;

    const values = [];
    const placeholders = [];
    let paramIdx = 1;

    for (const username of usernames) {
        const avatarUrl = `https://cdn.nearbyonly.com/avatars/${username}.webp`;
        placeholders.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2})`);
        values.push(username, username, avatarUrl);
        paramIdx += 3;
    }

    const query = `
        INSERT INTO creators (username, display_name, avatar_url)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (username) DO NOTHING
    `;

    const result = await pool.query(query, values);
    return result.rowCount;
}

async function main() {
    console.log('🔍 Scraping NearbyOnly category/location pages for usernames...\n');

    const slugs = readFileSync('scripts/nearby-categories.txt', 'utf-8')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .filter(s => !['search', 'categories', 'locations', 'about', 'privacy', 'terms', 'dmca', 'add-creator'].includes(s));

    console.log(`  Pages to scrape: ${slugs.length}`);

    const startCount = await pool.query('SELECT COUNT(*) as count FROM creators');
    console.log(`  DB count before: ${startCount.rows[0].count}\n`);

    let totalNew = 0;
    let allUsernames = new Set();

    for (let i = 0; i < slugs.length; i++) {
        const slug = slugs[i];
        await sleep(DELAY_MS);

        const html = await fetchPage(`https://nearbyonly.com/${slug}`);
        if (!html) continue;

        const usernames = extractUsernames(html);
        const newOnes = usernames.filter(u => !allUsernames.has(u));
        newOnes.forEach(u => allUsernames.add(u));

        if ((i + 1) % 20 === 0) {
            process.stdout.write(`\r  Pages: ${i + 1}/${slugs.length} | Unique usernames found: ${allUsernames.size.toLocaleString()}`);
        }
    }

    console.log(`\n\n  Total unique usernames found: ${allUsernames.size.toLocaleString()}`);
    console.log('  Bulk inserting...');

    // Insert in batches
    const usernameArr = [...allUsernames];
    let inserted = 0;

    for (let i = 0; i < usernameArr.length; i += BATCH_SIZE) {
        const batch = usernameArr.slice(i, i + BATCH_SIZE);
        const count = await bulkInsert(batch);
        inserted += count;
    }

    const endCount = await pool.query('SELECT COUNT(*) as count FROM creators');
    console.log(`\n✅ Done! Inserted ${inserted.toLocaleString()} new. DB total: ${endCount.rows[0].count.toLocaleString()}`);
    await pool.end();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    pool.end();
    process.exit(1);
});
