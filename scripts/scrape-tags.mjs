/**
 * Scraper targeting specific tags via fans300 search
 * Populates: brunette, big-boobs, big-ass, feet, gfe, trans, couple, popular, threesome
 * 
 * Usage: node scripts/scrape-tags.mjs
 */

import * as cheerio from 'cheerio';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dan@localhost:5432/of_directory',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 5,
});

// Search queries mapped to our tag slugs
const TAG_SEARCHES = {
    'brunette': ['brunette', 'dark hair'],
    'big-boobs': ['big boobs', 'big tits', 'busty'],
    'big-ass': ['big ass', 'big butt', 'thick'],
    'feet': ['feet', 'foot fetish', 'soles'],
    'gfe': ['gfe', 'girlfriend experience', 'girlfriend'],
    'trans': ['trans', 'transgender', 'shemale', 'ts'],
    'couple': ['couple', 'couples', 'duo'],
    'popular': ['popular', 'top rated', 'famous'],
    'threesome': ['threesome', 'threesomes', 'group'],
};

const SORT_ORDERS = ['relevance', 'mostLikes', 'mostVideos', 'lastSeen', 'highestPrice'];
const PAGES_PER_SEARCH = 5;
const DELAY_MS = 700;

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
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
            username, displayName, avatarUrl,
            subscriptionPrice: price, isFree,
            photoCount, videoCount, likeCount,
            mediaCount: photoCount + videoCount,
        });
    });

    return creators;
}

async function upsertCreator(creator) {
    const result = await pool.query(`
    INSERT INTO creators (username, display_name, avatar_url, subscription_price, is_free, photo_count, video_count, like_count, media_count, last_scraped_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (username) DO UPDATE SET
      display_name = COALESCE(EXCLUDED.display_name, creators.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, creators.avatar_url),
      subscription_price = EXCLUDED.subscription_price,
      is_free = EXCLUDED.is_free,
      photo_count = GREATEST(EXCLUDED.photo_count, creators.photo_count),
      video_count = GREATEST(EXCLUDED.video_count, creators.video_count),
      like_count = GREATEST(EXCLUDED.like_count, creators.like_count),
      media_count = GREATEST(EXCLUDED.media_count, creators.media_count),
      last_scraped_at = NOW(), updated_at = NOW()
    RETURNING id
  `, [creator.username, creator.displayName, creator.avatarUrl, creator.subscriptionPrice, creator.isFree, creator.photoCount, creator.videoCount, creator.likeCount, creator.mediaCount]);
    return result.rows[0].id;
}

async function tagCreator(creatorId, tagSlug) {
    const tagResult = await pool.query('SELECT id FROM tags WHERE slug = $1', [tagSlug]);
    if (!tagResult.rows.length) return;
    await pool.query(
        'INSERT INTO creator_tags (creator_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [creatorId, tagResult.rows[0].id]
    );
}

async function main() {
    console.log('🚀 Scraping specific tags via search...\n');

    let totalNew = 0;
    const seenUsernames = new Set();
    const existing = await pool.query('SELECT username FROM creators');
    existing.rows.forEach(r => seenUsernames.add(r.username));
    const startCount = seenUsernames.size;

    for (const [tagSlug, queries] of Object.entries(TAG_SEARCHES)) {
        console.log(`\n📂 Tag: ${tagSlug}`);
        let tagNew = 0;

        for (const query of queries) {
            for (const order of SORT_ORDERS) {
                for (let page = 1; page <= PAGES_PER_SEARCH; page++) {
                    await sleep(DELAY_MS);

                    const params = new URLSearchParams({ q: query, order });
                    if (page > 1) params.set('p', String(page));
                    const url = `https://fans300.com/search?${params}`;

                    const html = await fetchPage(url);
                    if (!html) break;

                    const creators = extractCreators(html);
                    if (creators.length === 0) break;

                    for (const creator of creators) {
                        const isNew = !seenUsernames.has(creator.username);
                        seenUsernames.add(creator.username);

                        try {
                            const creatorId = await upsertCreator(creator);
                            await tagCreator(creatorId, tagSlug);
                            if (creator.isFree) await tagCreator(creatorId, 'free');
                            if (isNew) { totalNew++; tagNew++; }
                        } catch { /* skip */ }
                    }
                }
            }
        }
        console.log(`  ✅ ${tagSlug}: +${tagNew} new creators tagged`);
    }

    // Update tag counts
    await pool.query(`UPDATE tags SET creator_count = (SELECT COUNT(*) FROM creator_tags WHERE tag_id = tags.id)`);

    const finalCounts = await pool.query("SELECT name, creator_count FROM tags WHERE slug IN ('brunette','big-boobs','big-ass','feet','gfe','trans','couple','popular','threesome') ORDER BY creator_count DESC");
    console.log('\n📊 Final counts:');
    finalCounts.rows.forEach(r => console.log(`   ${r.name}: ${r.creator_count}`));

    console.log(`\n🎉 Done! Added ${totalNew} new creators (${startCount} → ${seenUsernames.size} total)`);
    await pool.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
