/**
 * City-level scraper for fans300.com
 * Uses brute-force city ID ranges to discover creators.
 * Known ranges: US ~110000-128000, UK ~48000-52000, Canada ~16000-17500
 *
 * Usage: DATABASE_URL="..." node scripts/scrape-cities.mjs
 */

import * as cheerio from 'cheerio';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dan@localhost:5432/of_directory',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 5,
});

// Brute-force city ID ranges (based on known working IDs)
// Each range: [start, end, step]
const CITY_RANGES = [
    // US cities (densest range): 110000-128000
    [110000, 128000, 50],
    // UK cities: 48000-52000
    [48000, 52000, 30],
    // Canada: 16000-17500
    [16000, 17500, 30],
    // Australia: 3900-7600
    [3900, 7600, 50],
    // Colombia: 20500-21600
    [20500, 21600, 30],
    // Spain: 32000-38000
    [32000, 38000, 50],
    // Mexico: 68000-76000
    [68000, 76000, 50],
    // France: 27000-29000
    [27000, 29000, 50],
    // Germany: 23000-25000
    [23000, 25000, 50],
    // Brazil: 9000-11000
    [9000, 11000, 50],
    // Argentina: 700-1500
    [700, 1500, 30],
    // Poland: 79000-82000
    [79000, 82000, 50],
    // Romania: 92000-94000
    [92000, 94000, 50],
    // Netherlands: 77000-79000
    [77000, 79000, 50],
    // Italy: 37000-39500
    [37000, 39500, 50],
];

const SORT_ORDERS = ['relevance', 'mostLikes', 'mostVideos', 'mostPhotos'];
const PAGES_PER_CITY = 3;
const DELAY_MS = 500;
const TARGET_CREATORS = 100000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseCount(text) {
    if (!text) return 0;
    text = text.trim().replace(/,/g, '.');
    if (text.endsWith('k')) return Math.round(parseFloat(text) * 1000);
    if (text.endsWith('m')) return Math.round(parseFloat(text) * 1000000);
    return parseInt(text.replace(/\./g, ''), 10) || 0;
}

function parsePrice(priceText) {
    if (!priceText) return { price: 0, isFree: true };
    const text = priceText.trim().toLowerCase();
    if (text === 'free') return { price: 0, isFree: true };
    const match = text.match(/[\d.]+/);
    if (match) return { price: parseFloat(match[0]), isFree: false };
    return { price: 0, isFree: true };
}

async function fetchPage(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

function extractCreators(html) {
    const $ = cheerio.load(html);
    const creators = [];

    $('div.card.profile-container.result-item').each((_, el) => {
        const card = $(el);
        if (card.hasClass('lazyfeatured')) return;

        const link = card.find('a.lic');
        if (!link.length) return;

        const href = link.attr('href') || '';
        const usernameMatch = href.match(/username=([^&]+)/);
        if (!usernameMatch) return;

        const username = usernameMatch[1].trim();
        if (!username) return;

        const displayName = card.find('.ob_name').text().trim() || username;
        const avatarUrl = card.find('img.ob_img').attr('src') || '';
        const priceText = card.find('.price-tag.ob_price').text().trim();
        const locationText = card.find('.location-flag').parent().text().trim() || '';

        const stats = [];
        card.find('.card-text.info .d-flex p').each((_, p) => {
            stats.push($(p).text().trim());
        });

        const photoCount = parseCount(stats[0]);
        const videoCount = parseCount(stats[1]);
        const likeCount = parseCount(stats[2]);
        const { price, isFree } = parsePrice(priceText);

        if (avatarUrl.startsWith('data:')) return;

        creators.push({
            username,
            displayName,
            avatarUrl,
            subscriptionPrice: price,
            isFree,
            photoCount,
            videoCount,
            likeCount,
            mediaCount: photoCount + videoCount,
            location: locationText,
        });
    });

    return creators;
}

async function upsertCreator(creator) {
    const query = `
    INSERT INTO creators (username, display_name, avatar_url, subscription_price, is_free, photo_count, video_count, like_count, media_count, location, last_scraped_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    ON CONFLICT (username) DO UPDATE SET
      display_name = COALESCE(EXCLUDED.display_name, creators.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, creators.avatar_url),
      subscription_price = EXCLUDED.subscription_price,
      is_free = EXCLUDED.is_free,
      photo_count = GREATEST(EXCLUDED.photo_count, creators.photo_count),
      video_count = GREATEST(EXCLUDED.video_count, creators.video_count),
      like_count = GREATEST(EXCLUDED.like_count, creators.like_count),
      media_count = GREATEST(EXCLUDED.media_count, creators.media_count),
      location = COALESCE(EXCLUDED.location, creators.location),
      last_scraped_at = NOW(),
      updated_at = NOW()
    RETURNING id
    `;
    const result = await pool.query(query, [
        creator.username,
        creator.displayName,
        creator.avatarUrl,
        creator.subscriptionPrice,
        creator.isFree,
        creator.photoCount,
        creator.videoCount,
        creator.likeCount,
        creator.mediaCount,
        creator.location || null,
    ]);
    return result.rows[0].id;
}

async function getCurrentCount() {
    const r = await pool.query('SELECT COUNT(*) as count FROM creators');
    return parseInt(r.rows[0].count, 10);
}

async function main() {
    console.log('🚀 Starting city-level scraper (target: 100K creators)...\n');

    const seenUsernames = new Set();
    let totalNew = 0;
    let startCount = await getCurrentCount();
    console.log(`  Starting DB count: ${startCount.toLocaleString()}`);

    // Generate all city IDs from ranges
    const cityIds = [];
    for (const [start, end, step] of CITY_RANGES) {
        for (let id = start; id <= end; id += step) {
            cityIds.push(id);
        }
    }
    console.log(`  City IDs to try: ${cityIds.length.toLocaleString()}`);

    let emptyCities = 0;

    for (const sort of SORT_ORDERS) {
        console.log(`\n📊 Sort order: ${sort}`);
        emptyCities = 0;

        for (const cityId of cityIds) {
            // Check if we've hit the target
            const currentCount = startCount + totalNew;
            if (currentCount >= TARGET_CREATORS) {
                console.log(`\n🎉 Target reached! ${currentCount.toLocaleString()} creators in DB.`);
                await pool.end();
                return;
            }

            let cityNew = 0;

            for (let page = 1; page <= PAGES_PER_CITY; page++) {
                const url = `https://fans300.com/search?cityId=${cityId}&sort=${sort}${page > 1 ? `&p=${page}` : ''}`;
                await sleep(DELAY_MS);

                const html = await fetchPage(url);
                if (!html) break;

                const creators = extractCreators(html);
                if (creators.length === 0) {
                    if (page === 1) emptyCities++;
                    break;
                }

                for (const creator of creators) {
                    if (seenUsernames.has(creator.username)) continue;
                    seenUsernames.add(creator.username);

                    try {
                        await upsertCreator(creator);
                        totalNew++;
                        cityNew++;
                    } catch {
                        // Skip errors silently
                    }
                }
            }

            if (cityNew > 0) {
                process.stdout.write(`  City ${cityId}: +${cityNew} new | Total new: ${totalNew.toLocaleString()} | DB: ~${(startCount + totalNew).toLocaleString()}\n`);
            }
        }

        console.log(`  Empty cities in this sort: ${emptyCities}`);
    }

    const finalCount = await getCurrentCount();
    console.log(`\n✅ Done! Final DB count: ${finalCount.toLocaleString()} (added ${totalNew.toLocaleString()} new)`);
    await pool.end();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    pool.end();
    process.exit(1);
});
