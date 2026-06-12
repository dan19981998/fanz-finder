/**
 * NearbyOnly profile scraper
 * Reads usernames from nearby-usernames.txt (extracted from their sitemap)
 * and scrapes each profile page for rich creator data via JSON-LD.
 *
 * Usage: DATABASE_URL="..." node scripts/scrape-nearby.mjs
 *
 * Features:
 * - Skips creators already in DB
 * - Extracts from JSON-LD Person schema: name, bio, location, price, stats, avatar
 * - Auto-assigns tags based on body traits and location
 * - Resumes from where it left off (skips existing)
 * - Rate limited to avoid hammering
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

const DELAY_MS = 500;
const BATCH_SIZE = 50;
const CONCURRENT = 3;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchProfile(username) {
    try {
        const res = await fetch(`https://nearbyonly.com/onlyfans/${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });
        if (res.status === 404 || res.status === 410) return null;
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

function parseProfile(html, username) {
    const $ = cheerio.load(html);

    // Find Person JSON-LD
    let personData = null;
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const data = JSON.parse($(el).html());
            if (data['@type'] === 'Person') {
                personData = data;
            }
        } catch { }
    });

    if (!personData) return null;

    const displayName = personData.name || username;
    const bio = personData.description || '';
    const avatarUrl = personData.image || '';

    // Location
    const address = personData.homeLocation?.address || {};
    const city = address.addressLocality || '';
    const region = address.addressRegion || '';
    const country = address.addressCountry || '';
    const location = [city, region, country].filter(Boolean).join(', ');

    // Stats from meta description (pattern: "$X/mo · Y photos · Z videos")
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    let photoCount = 0;
    let videoCount = 0;
    let likeCount = 0;
    let price = 0;
    let isFree = false;

    // Parse from body text
    const bodyText = $('body').text();

    // Photos
    const photoMatch = metaDesc.match(/(\d[\d,]*)\s*photos/i) || bodyText.match(/(\d[\d,]*)\s*Photos/);
    if (photoMatch) photoCount = parseInt(photoMatch[1].replace(/,/g, ''), 10);

    // Videos
    const videoMatch = metaDesc.match(/(\d[\d,]*)\s*videos/i) || bodyText.match(/(\d[\d,]*)\s*Videos/);
    if (videoMatch) videoCount = parseInt(videoMatch[1].replace(/,/g, ''), 10);

    // Likes
    const likeMatch = bodyText.match(/([\d,.]+[KkMm]?)\s*Likes/);
    if (likeMatch) {
        let likeText = likeMatch[1].replace(/,/g, '');
        if (likeText.match(/[Kk]$/)) likeCount = Math.round(parseFloat(likeText) * 1000);
        else if (likeText.match(/[Mm]$/)) likeCount = Math.round(parseFloat(likeText) * 1000000);
        else likeCount = parseInt(likeText, 10) || 0;
    }

    // Price
    const priceMatch = metaDesc.match(/\$(\d+(?:\.\d+)?)/);
    if (priceMatch) {
        price = parseFloat(priceMatch[1]);
        isFree = price === 0;
    } else if (metaDesc.toLowerCase().includes('free')) {
        isFree = true;
        price = 0;
    }

    // Body traits for tag assignment
    const traits = [];
    const traitSection = bodyText.match(/Body type & traits(.*?)(?:Comments|FAQ|Similar)/s);
    if (traitSection) {
        const traitText = traitSection[1];
        if (/blonde/i.test(traitText)) traits.push('blonde');
        if (/brunette/i.test(traitText)) traits.push('brunette');
        if (/redhead|ginger/i.test(traitText)) traits.push('redhead');
        if (/asian/i.test(traitText)) traits.push('asian');
        if (/latina|latin/i.test(traitText)) traits.push('latina');
        if (/ebony|black/i.test(traitText)) traits.push('ebony');
        if (/milf|mature|mom/i.test(traitText)) traits.push('milf');
        if (/teen|young|18|19|20/i.test(traitText)) traits.push('teen');
        if (/big boobs|large breasts|huge/i.test(traitText)) traits.push('big-boobs');
        if (/big ass|big butt|thick/i.test(traitText)) traits.push('big-ass');
        if (/petite|slim|skinny|tiny/i.test(traitText)) traits.push('petite');
        if (/curvy|thick|bbw|plus/i.test(traitText)) traits.push('curvy');
        if (/tattoo/i.test(traitText)) traits.push('tattoos');
        if (/goth|alt|punk/i.test(traitText)) traits.push('goth');
        if (/cosplay|anime|costume/i.test(traitText)) traits.push('cosplay');
        if (/feet|foot/i.test(traitText)) traits.push('feet');
    }

    // Also check bio for ethnicity/category hints
    if (/latina|latin american|colombian|mexican|brazilian/i.test(bio)) traits.push('latina');
    if (/asian|japanese|korean|chinese|thai|filipino/i.test(bio)) traits.push('asian');
    if (/ebony|african/i.test(bio)) traits.push('ebony');

    if (isFree) traits.push('free');

    return {
        username,
        displayName,
        bio,
        avatarUrl,
        price,
        isFree,
        photoCount,
        videoCount,
        likeCount,
        mediaCount: photoCount + videoCount,
        location: location || null,
        country: country || null,
        city: city || null,
        traits: [...new Set(traits)],
    };
}

async function upsertCreator(creator) {
    const query = `
    INSERT INTO creators (username, display_name, bio, avatar_url, subscription_price, is_free, photo_count, video_count, like_count, media_count, location, country, city, last_scraped_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    ON CONFLICT (username) DO UPDATE SET
      display_name = COALESCE(EXCLUDED.display_name, creators.display_name),
      bio = COALESCE(EXCLUDED.bio, creators.bio),
      avatar_url = COALESCE(EXCLUDED.avatar_url, creators.avatar_url),
      subscription_price = EXCLUDED.subscription_price,
      is_free = EXCLUDED.is_free,
      photo_count = GREATEST(EXCLUDED.photo_count, creators.photo_count),
      video_count = GREATEST(EXCLUDED.video_count, creators.video_count),
      like_count = GREATEST(EXCLUDED.like_count, creators.like_count),
      media_count = GREATEST(EXCLUDED.media_count, creators.media_count),
      location = COALESCE(EXCLUDED.location, creators.location),
      country = COALESCE(EXCLUDED.country, creators.country),
      city = COALESCE(EXCLUDED.city, creators.city),
      last_scraped_at = NOW(),
      updated_at = NOW()
    RETURNING id
    `;
    const result = await pool.query(query, [
        creator.username,
        creator.displayName,
        creator.bio,
        creator.avatarUrl,
        creator.price,
        creator.isFree,
        creator.photoCount,
        creator.videoCount,
        creator.likeCount,
        creator.mediaCount,
        creator.location,
        creator.country,
        creator.city,
    ]);
    return result.rows[0].id;
}

async function assignTags(creatorId, traits) {
    if (traits.length === 0) return;
    for (const slug of traits) {
        try {
            const tagResult = await pool.query('SELECT id FROM tags WHERE slug = $1', [slug]);
            if (tagResult.rows.length > 0) {
                await pool.query(
                    'INSERT INTO creator_tags (creator_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [creatorId, tagResult.rows[0].id]
                );
            }
        } catch { }
    }
}

async function getExistingUsernames() {
    // Get usernames that haven't been fully scraped (no bio yet)
    const result = await pool.query("SELECT username FROM creators WHERE bio IS NULL OR bio = ''");
    return result.rows.map(r => r.username);
}

async function main() {
    console.log('🚀 NearbyOnly Profile Scraper\n');

    // Read usernames
    const allUsernames = readFileSync('scripts/nearby-usernames.txt', 'utf-8')
        .split('\n')
        .map(u => u.trim())
        .filter(Boolean);
    console.log(`  Total usernames from sitemap: ${allUsernames.length.toLocaleString()}`);

    // Get users needing enrichment
    const toEnrich = await getExistingUsernames();
    console.log(`  Users needing enrichment (no bio): ${toEnrich.length.toLocaleString()}`);

    // Also add any from sitemap not in DB
    const allInDb = new Set((await pool.query('SELECT username FROM creators')).rows.map(r => r.username));
    const fromSitemap = allUsernames.filter(u => !allInDb.has(u));
    const toScrape = [...toEnrich, ...fromSitemap];
    console.log(`  New from sitemap: ${fromSitemap.length.toLocaleString()}`);
    console.log(`  Total to scrape: ${toScrape.length.toLocaleString()}\n`);

    let scraped = 0;
    let inserted = 0;
    let failed = 0;
    const startTime = Date.now();

    // Process in batches with concurrency
    for (let i = 0; i < toScrape.length; i += CONCURRENT) {
        const batch = toScrape.slice(i, i + CONCURRENT);
        const results = await Promise.all(
            batch.map(async (username) => {
                await sleep(Math.random() * DELAY_MS);
                const html = await fetchProfile(username);
                scraped++;
                if (!html) return null;
                return parseProfile(html, username);
            })
        );

        for (const creator of results) {
            if (creator) {
                try {
                    const id = await upsertCreator(creator);
                    await assignTags(id, creator.traits);
                    inserted++;
                } catch (err) {
                    failed++;
                }
            } else {
                failed++;
            }
        }

        // Progress update every 50 scraped
        if (scraped % BATCH_SIZE === 0 || i + CONCURRENT >= toScrape.length) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = scraped / elapsed;
            const remaining = (toScrape.length - scraped) / rate;
            process.stdout.write(
                `\r  Progress: ${scraped.toLocaleString()}/${toScrape.length.toLocaleString()} | ` +
                `Inserted: ${inserted.toLocaleString()} | Failed: ${failed.toLocaleString()} | ` +
                `Rate: ${rate.toFixed(1)}/s | ETA: ${Math.round(remaining / 60)}min`
            );
        }

        await sleep(DELAY_MS);
    }

    const totalCount = await pool.query('SELECT COUNT(*) as count FROM creators');
    console.log(`\n\n✅ Done! DB total: ${totalCount.rows[0].count.toLocaleString()}`);
    await pool.end();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    pool.end();
    process.exit(1);
});
