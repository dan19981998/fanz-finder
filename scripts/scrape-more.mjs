/**
 * Enhanced scraper for fans300.com - uses sort orders + location pages
 * to maximize unique profiles beyond the 5-page/category limit
 * 
 * Usage: node scripts/scrape-more.mjs
 */

import * as cheerio from 'cheerio';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://dan@localhost:5432/of_directory',
    max: 5,
});

const SORT_ORDERS = ['relevance', 'mostLikes', 'mostVideos', 'mostPhotos', 'mostPosts', 'lastSeen', 'highestPrice'];

// Category → tag slug mapping
const CATEGORY_MAP = {
    'free': 'free',
    'blonde': 'blonde',
    'redhead': 'redhead',
    'asian': 'asian',
    'latina': 'latina',
    'ebony': 'ebony',
    'milf': 'milf',
    'teen': 'teen',
    'bbw': 'curvy',
    'thin': 'petite',
    'tattoos': 'tattoos',
    'cosplay': 'cosplay',
    'muscle': 'fitness',
    'amateur': 'new',
    'college': 'teen',
    'bdsm': 'goth',
    'dominatrix': 'goth',
    'latex': 'lingerie',
    'bondage': 'goth',
    'free-trial': 'free',
    'piercings': null,
    'roleplay': null,
    'submissive': null,
    'artist': null,
    'leather': 'lingerie',
};

const LOCATIONS = [
    'united-states',
    'united-kingdom',
    'canada',
    'australia',
    'colombia',
    'argentina',
    'spain',
    'brazil',
    'france',
    'chile',
    'romania',
    'poland',
    'croatia',
    'denmark',
    'portugal',
    'russia',
];

const PAGES_PER_URL = 5; // fans300 hard limit
const DELAY_MS = 700;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseCount(text) {
    if (!text) return 0;
    text = text.trim().replace(/,/g, '.');
    if (text.endsWith('k')) {
        return Math.round(parseFloat(text) * 1000);
    }
    if (text.endsWith('m')) {
        return Math.round(parseFloat(text) * 1000000);
    }
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

        // Location if present
        const locationEl = card.find('.card-text.locations');
        const location = locationEl.length ? locationEl.text().trim() : null;

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
            location,
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
        creator.location,
    ]);
    return result.rows[0].id;
}

async function tagCreator(creatorId, tagSlug) {
    if (!tagSlug) return;
    const tagResult = await pool.query('SELECT id FROM tags WHERE slug = $1', [tagSlug]);
    if (!tagResult.rows.length) return;
    await pool.query(
        'INSERT INTO creator_tags (creator_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [creatorId, tagResult.rows[0].id]
    );
}

async function scrapeUrl(baseUrl, tagSlug, seenUsernames) {
    let newCount = 0;
    for (let page = 1; page <= PAGES_PER_URL; page++) {
        await sleep(DELAY_MS);
        const separator = baseUrl.includes('?') ? '&' : '?';
        const url = page > 1 ? `${baseUrl}${separator}p=${page}` : baseUrl;

        const html = await fetchPage(url);
        if (!html) break;

        const creators = extractCreators(html);
        if (creators.length === 0) break;

        for (const creator of creators) {
            if (seenUsernames.has(creator.username)) continue;
            seenUsernames.add(creator.username);

            try {
                const creatorId = await upsertCreator(creator);
                if (tagSlug) await tagCreator(creatorId, tagSlug);
                if (creator.isFree) await tagCreator(creatorId, 'free');
                newCount++;
            } catch (err) {
                // Skip on error
            }
        }
    }
    return newCount;
}

async function main() {
    const existingCount = (await pool.query('SELECT COUNT(*) FROM creators')).rows[0].count;
    console.log(`📊 Starting with ${existingCount} existing creators in DB\n`);

    const seenUsernames = new Set();
    // Pre-populate with existing usernames
    const existing = await pool.query('SELECT username FROM creators');
    existing.rows.forEach(r => seenUsernames.add(r.username));

    let totalNew = 0;

    // Phase 1: Categories with all sort orders
    console.log('=== Phase 1: Categories × Sort Orders ===\n');
    for (const [category, tagSlug] of Object.entries(CATEGORY_MAP)) {
        for (const order of SORT_ORDERS) {
            const url = `https://fans300.com/onlyfans-categories/${category}?order=${order}`;
            const newCount = await scrapeUrl(url, tagSlug, seenUsernames);
            totalNew += newCount;
            if (newCount > 0) {
                process.stdout.write(`  ${category}/${order}: +${newCount} (total: ${seenUsernames.size})\n`);
            }
        }
        console.log(`✅ ${category} done. Total unique: ${seenUsernames.size}`);
    }

    // Phase 2: Location pages with sort orders
    console.log('\n=== Phase 2: Locations × Sort Orders ===\n');
    for (const location of LOCATIONS) {
        for (const order of SORT_ORDERS) {
            const url = `https://fans300.com/onlyfans-locations/${location}?order=${order}`;
            const newCount = await scrapeUrl(url, null, seenUsernames);
            totalNew += newCount;
            if (newCount > 0) {
                process.stdout.write(`  ${location}/${order}: +${newCount} (total: ${seenUsernames.size})\n`);
            }
        }
        console.log(`✅ ${location} done. Total unique: ${seenUsernames.size}`);
    }

    // Update tag counts
    await pool.query(`
    UPDATE tags SET creator_count = (
      SELECT COUNT(*) FROM creator_tags WHERE tag_id = tags.id
    )
  `);

    console.log(`\n🎉 Enhanced scraping complete!`);
    console.log(`   New creators added: ${totalNew}`);
    console.log(`   Total in DB: ${seenUsernames.size}`);

    await pool.end();
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
