/**
 * Scraper for fans300.com category pages
 * Extracts creator profiles and inserts them into the of_directory database
 * 
 * Usage: node scripts/scrape.mjs
 */

import * as cheerio from 'cheerio';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://dan@localhost:5432/of_directory',
});

// fans300 categories mapped to our tag slugs
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
};

// Additional categories to scrape for more profiles (won't get a tag mapping)
const EXTRA_CATEGORIES = [
    'free-trial',
    'piercings',
    'roleplay',
    'submissive',
    'artist',
];

const PAGES_PER_CATEGORY = 40; // 14 profiles per page × 40 = 560 per category
const DELAY_MS = 800; // Be respectful with rate limiting

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

async function fetchPage(category, page) {
    const url = `https://fans300.com/onlyfans-categories/${category}${page > 1 ? `?p=${page}` : ''}`;
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });
        if (!res.ok) {
            console.error(`  HTTP ${res.status} for ${url}`);
            return null;
        }
        return await res.text();
    } catch (err) {
        console.error(`  Fetch error for ${url}: ${err.message}`);
        return null;
    }
}

function extractCreators(html) {
    const $ = cheerio.load(html);
    const creators = [];

    $('div.card.profile-container.result-item').each((_, el) => {
        const card = $(el);

        // Skip placeholder/lazy cards
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

        // Stats: photos, videos, likes (in that order)
        const stats = [];
        card.find('.card-text.info .d-flex p').each((_, p) => {
            stats.push($(p).text().trim());
        });

        const photoCount = parseCount(stats[0]);
        const videoCount = parseCount(stats[1]);
        const likeCount = parseCount(stats[2]);
        const { price, isFree } = parsePrice(priceText);

        // Skip if avatar is a placeholder
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
        });
    });

    return creators;
}

async function upsertCreator(creator) {
    const query = `
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
    ]);
    return result.rows[0].id;
}

async function tagCreator(creatorId, tagSlug) {
    const tagResult = await pool.query('SELECT id FROM tags WHERE slug = $1', [tagSlug]);
    if (!tagResult.rows.length) return;
    const tagId = tagResult.rows[0].id;
    await pool.query(
        'INSERT INTO creator_tags (creator_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [creatorId, tagId]
    );
}

async function main() {
    console.log('🚀 Starting fans300 scraper...\n');

    let totalInserted = 0;
    let totalSkipped = 0;
    const seenUsernames = new Set();

    const allCategories = [...Object.keys(CATEGORY_MAP), ...EXTRA_CATEGORIES];

    for (const category of allCategories) {
        const tagSlug = CATEGORY_MAP[category] || null;
        console.log(`\n📂 Scraping category: ${category}${tagSlug ? ` → tag: ${tagSlug}` : ' (no tag mapping)'}`);

        let emptyPages = 0;

        for (let page = 1; page <= PAGES_PER_CATEGORY; page++) {
            await sleep(DELAY_MS);

            const html = await fetchPage(category, page);
            if (!html) {
                emptyPages++;
                if (emptyPages >= 3) break; // Stop after 3 consecutive failures
                continue;
            }

            const creators = extractCreators(html);
            if (creators.length === 0) {
                emptyPages++;
                if (emptyPages >= 3) break;
                continue;
            }

            emptyPages = 0; // Reset on success
            let pageNew = 0;

            for (const creator of creators) {
                const isNew = !seenUsernames.has(creator.username);
                seenUsernames.add(creator.username);

                try {
                    const creatorId = await upsertCreator(creator);

                    // Tag this creator if we have a mapping
                    if (tagSlug) {
                        await tagCreator(creatorId, tagSlug);
                    }

                    // If the category is 'free' or 'free-trial', also tag as free
                    if (category === 'free' || category === 'free-trial') {
                        await tagCreator(creatorId, 'free');
                    }

                    if (isNew) {
                        totalInserted++;
                        pageNew++;
                    } else {
                        totalSkipped++;
                    }
                } catch (err) {
                    console.error(`    Error inserting ${creator.username}: ${err.message}`);
                }
            }

            process.stdout.write(`  Page ${page}: ${creators.length} found, ${pageNew} new (total unique: ${seenUsernames.size})\r`);
        }

        console.log(`\n  ✅ Done with ${category}. Running total: ${totalInserted} unique creators`);
    }

    // Update tag creator_count
    await pool.query(`
    UPDATE tags SET creator_count = (
      SELECT COUNT(*) FROM creator_tags WHERE tag_id = tags.id
    )
  `);

    console.log(`\n\n🎉 Scraping complete!`);
    console.log(`   Total unique creators: ${totalInserted}`);
    console.log(`   Duplicates (already seen): ${totalSkipped}`);

    await pool.end();
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
