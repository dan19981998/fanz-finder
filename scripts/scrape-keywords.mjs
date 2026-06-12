/**
 * Comprehensive fans300 scraper
 * Combines keywords × city IDs × sort orders to maximize unique creators.
 * 5 pages max per combo = 70 creators each.
 *
 * Usage: DATABASE_URL="..." node scripts/scrape-keywords.mjs
 */

import * as cheerio from 'cheerio';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dan@localhost:5432/of_directory',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 5,
});

// Keywords that yield different result sets
const KEYWORDS = [
    'free', 'blonde', 'brunette', 'redhead', 'asian', 'latina', 'ebony',
    'milf', 'teen', 'petite', 'curvy', 'tattoo', 'goth', 'cosplay', 'feet',
    'fitness', 'bbw', 'couple', 'trans', 'thick', 'natural', 'alt',
    'college', 'model', 'dancer', 'nurse', 'teacher', 'gamer', 'streamer',
    'big', 'slim', 'athletic', 'pawg', 'booty', 'busty', 'small',
    'hot', 'cute', 'sexy', 'beautiful', 'gorgeous', 'pretty', 'stunning',
    'new', 'top', 'popular', 'trending', 'verified',
    'arab', 'indian', 'japanese', 'korean', 'thai', 'filipina', 'russian',
    'colombian', 'brazilian', 'mexican', 'dominican', 'venezuelan', 'cuban',
    'british', 'australian', 'canadian', 'french', 'german', 'italian', 'spanish',
    'swedish', 'polish', 'dutch', 'romanian', 'czech',
    'onlyfans', 'content', 'creator', 'exclusive', 'premium', 'vip',
    'lingerie', 'bikini', 'gym', 'yoga', 'twerk', 'asmr',
];

// Sort orders
const SORTS = ['relevance', 'mostLikes', 'mostVideos', 'mostPhotos', 'lastSeen'];

// Known working city IDs + brute force samples from US range
const CITY_SAMPLES = [
    50388, 122795, 121746, 120163,
    // Sample US cities every 200 IDs
    ...Array.from({ length: 90 }, (_, i) => 110000 + i * 200),
    // UK samples
    ...Array.from({ length: 40 }, (_, i) => 48000 + i * 100),
];

const PAGES_PER_QUERY = 5;
const DELAY_MS = 400;
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
      avatar_url = CASE WHEN EXCLUDED.avatar_url != '' AND EXCLUDED.avatar_url NOT LIKE 'data:%' THEN EXCLUDED.avatar_url ELSE creators.avatar_url END,
      subscription_price = EXCLUDED.subscription_price,
      is_free = EXCLUDED.is_free,
      photo_count = GREATEST(EXCLUDED.photo_count, creators.photo_count),
      video_count = GREATEST(EXCLUDED.video_count, creators.video_count),
      like_count = GREATEST(EXCLUDED.like_count, creators.like_count),
      media_count = GREATEST(EXCLUDED.media_count, creators.media_count),
      location = COALESCE(EXCLUDED.location, creators.location),
      last_scraped_at = NOW(),
      updated_at = NOW()
    `;
    await pool.query(query, [
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
}

async function getCurrentCount() {
    const r = await pool.query('SELECT COUNT(*) as count FROM creators');
    return parseInt(r.rows[0].count, 10);
}

async function main() {
    console.log('🚀 Keyword × City scraper (target: 100K)\n');

    const seenUsernames = new Set();
    let totalNew = 0;
    const startCount = await getCurrentCount();
    console.log(`  Starting DB count: ${startCount.toLocaleString()}`);
    console.log(`  Keywords: ${KEYWORDS.length}, Cities: ${CITY_SAMPLES.length}, Sorts: ${SORTS.length}`);
    console.log(`  Max combos: ${KEYWORDS.length * CITY_SAMPLES.length * SORTS.length}\n`);

    // Strategy: keyword + sort first (no city), then keyword + city combos
    // Phase 1: keywords × sorts (no city filter)
    console.log('Phase 1: Keywords × sorts (no city filter)');
    for (const keyword of KEYWORDS) {
        for (const sort of SORTS) {
            const currentCount = startCount + totalNew;
            if (currentCount >= TARGET_CREATORS) {
                console.log(`\n🎉 Target reached! ${currentCount.toLocaleString()}`);
                await pool.end();
                return;
            }

            let queryNew = 0;
            for (let page = 1; page <= PAGES_PER_QUERY; page++) {
                const url = `https://fans300.com/search?q=${encodeURIComponent(keyword)}&sort=${sort}${page > 1 ? `&p=${page}` : ''}`;
                await sleep(DELAY_MS);

                const html = await fetchPage(url);
                if (!html) break;

                const creators = extractCreators(html);
                if (creators.length === 0) break;

                for (const creator of creators) {
                    if (seenUsernames.has(creator.username)) continue;
                    seenUsernames.add(creator.username);
                    try {
                        await upsertCreator(creator);
                        totalNew++;
                        queryNew++;
                    } catch { }
                }
            }

            if (queryNew > 0) {
                process.stdout.write(`  ${keyword}/${sort}: +${queryNew} | Total: ${(startCount + totalNew).toLocaleString()}\n`);
            }
        }
    }

    console.log(`\nPhase 1 done. Added: ${totalNew.toLocaleString()}, DB: ~${(startCount + totalNew).toLocaleString()}`);

    // Phase 2: keywords × cities × relevance sort
    console.log('\nPhase 2: Keywords × cities');
    for (const keyword of KEYWORDS.slice(0, 30)) { // Top 30 keywords
        for (const cityId of CITY_SAMPLES) {
            const currentCount = startCount + totalNew;
            if (currentCount >= TARGET_CREATORS) {
                console.log(`\n🎉 Target reached! ${currentCount.toLocaleString()}`);
                await pool.end();
                return;
            }

            let queryNew = 0;
            for (let page = 1; page <= 3; page++) {
                const url = `https://fans300.com/search?q=${encodeURIComponent(keyword)}&cityId=${cityId}${page > 1 ? `&p=${page}` : ''}`;
                await sleep(DELAY_MS);

                const html = await fetchPage(url);
                if (!html) break;

                const creators = extractCreators(html);
                if (creators.length === 0) break;

                for (const creator of creators) {
                    if (seenUsernames.has(creator.username)) continue;
                    seenUsernames.add(creator.username);
                    try {
                        await upsertCreator(creator);
                        totalNew++;
                        queryNew++;
                    } catch { }
                }
            }

            if (queryNew > 0) {
                process.stdout.write(`  ${keyword}/city${cityId}: +${queryNew} | Total: ${(startCount + totalNew).toLocaleString()}\n`);
            }
        }
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
