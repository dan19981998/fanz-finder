/**
 * Supplemental fans300 scraper using filter combinations.
 * gender × priceRange × sort × page to find creators not hit by keyword search.
 *
 * Usage: DATABASE_URL="..." node scripts/scrape-filters.mjs
 */

import * as cheerio from 'cheerio';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dan@localhost:5432/of_directory',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 5,
});

const GENDERS = ['female', 'male', 'trans'];
const PRICE_RANGES = ['free', '1-5', '5-10', '10-20', '20-50', '50-100'];
const SORTS = ['relevance', 'mostLikes', 'mostVideos', 'mostPhotos', 'lastSeen'];
const PAGES = 5;
const DELAY_MS = 400;
const TARGET = 100000;

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

        creators.push({ username, displayName, avatarUrl, subscriptionPrice: price, isFree, photoCount, videoCount, likeCount, mediaCount: photoCount + videoCount, location: locationText });
    });

    return creators;
}

async function upsertCreator(creator) {
    await pool.query(`
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
    `, [creator.username, creator.displayName, creator.avatarUrl, creator.subscriptionPrice, creator.isFree, creator.photoCount, creator.videoCount, creator.likeCount, creator.mediaCount, creator.location || null]);
}

async function getCurrentCount() {
    const r = await pool.query('SELECT COUNT(*) as count FROM creators');
    return parseInt(r.rows[0].count, 10);
}

async function main() {
    console.log('🚀 Filter-combo scraper (gender × price × sort)\n');

    const seenUsernames = new Set();
    let totalNew = 0;
    const startCount = await getCurrentCount();
    console.log(`  Starting DB: ${startCount.toLocaleString()}`);
    console.log(`  Combos: ${GENDERS.length} × ${PRICE_RANGES.length} × ${SORTS.length} = ${GENDERS.length * PRICE_RANGES.length * SORTS.length}\n`);

    for (const gender of GENDERS) {
        for (const priceRange of PRICE_RANGES) {
            for (const sort of SORTS) {
                const currentCount = startCount + totalNew;
                if (currentCount >= TARGET) {
                    console.log(`\n🎉 Target reached! ${currentCount.toLocaleString()}`);
                    await pool.end();
                    return;
                }

                let comboNew = 0;
                for (let page = 1; page <= PAGES; page++) {
                    let url = `https://fans300.com/search?gender=${gender}&sort=${sort}`;
                    if (priceRange === 'free') url += '&isFree=true';
                    else url += `&priceRange=${priceRange}`;
                    if (page > 1) url += `&p=${page}`;

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
                            comboNew++;
                        } catch { }
                    }
                }

                if (comboNew > 0) {
                    process.stdout.write(`  ${gender}/${priceRange}/${sort}: +${comboNew} | DB: ~${(startCount + totalNew).toLocaleString()}\n`);
                }
            }
        }
    }

    const finalCount = await getCurrentCount();
    console.log(`\n✅ Done! DB: ${finalCount.toLocaleString()} (added ${totalNew.toLocaleString()})`);
    await pool.end();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    pool.end();
    process.exit(1);
});
