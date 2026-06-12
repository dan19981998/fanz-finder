/**
 * Scrape body traits from NearbyOnly profiles.
 * These traits (ethnicity, body type, hair, age, etc.) are what makes
 * profiles unique enough to get indexed by Google.
 *
 * Stores as JSONB in creators.traits column.
 * Example: {"ethnicity":"White","bodyType":"Slim","breasts":"Small Boobs","hairColor":"Black Hair","hairLength":"Long Hair","style":["Glamorous","Natural"],"age":"Young"}
 *
 * Usage: DATABASE_URL="..." node scripts/scrape-traits.mjs
 */

import * as cheerio from 'cheerio';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dan@localhost:5432/of_directory',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 5,
});

const DELAY_MS = 450;
const CONCURRENT = 3;
const BATCH_LOG = 25;

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
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

function parseTraits(html) {
    const $ = cheerio.load(html);
    const bodyText = $('body').text();

    // Look for the traits section between "Body type & traits" and "Comments" or "FAQ"
    const traitSection = bodyText.match(/Body type & traits(.*?)(?:Comments|Sign in|Frequently Asked|Similar|FAQ)/s);
    if (!traitSection) return null;

    const section = traitSection[1];
    const traits = {};

    // Extract key-value pairs
    // Pattern: "Label" followed by "Value" on next conceptual line
    const traitPatterns = [
        { key: 'ethnicity', regex: /(?:Ethnicity|Race)\s*([A-Za-z\s]+?)(?=Body Type|Breasts|Hair|Style|Age|$)/i },
        { key: 'bodyType', regex: /Body Type\s*([A-Za-z\s-]+?)(?=Ethnicity|Breasts|Hair|Style|Age|$)/i },
        { key: 'breasts', regex: /Breasts\s*([A-Za-z\s]+?)(?=Ethnicity|Body Type|Hair|Style|Age|$)/i },
        { key: 'hairColor', regex: /Hair Color\s*([A-Za-z\s]+?)(?=Ethnicity|Body Type|Breasts|Hair Length|Style|Age|$)/i },
        { key: 'hairLength', regex: /Hair Length\s*([A-Za-z\s]+?)(?=Ethnicity|Body Type|Breasts|Hair Color|Style|Age|$)/i },
        { key: 'style', regex: /Style\s*([A-Za-z\s]+?)(?=Ethnicity|Body Type|Breasts|Hair|Age|$)/i },
        { key: 'age', regex: /Age\s*([A-Za-z\s]+?)(?=Ethnicity|Body Type|Breasts|Hair|Style|$)/i },
    ];

    for (const { key, regex } of traitPatterns) {
        const match = section.match(regex);
        if (match) {
            const value = match[1].trim();
            if (value && value.length < 50) {
                traits[key] = value;
            }
        }
    }

    // Only return if we found at least 2 traits
    if (Object.keys(traits).length < 2) return null;
    return traits;
}

function parseBioAndStats(html, username) {
    const $ = cheerio.load(html);

    // Get Person JSON-LD for bio and stats
    let personData = null;
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const data = JSON.parse($(el).html());
            if (data['@type'] === 'Person') {
                personData = data;
            }
        } catch { }
    });

    const result = {};

    if (personData) {
        if (personData.description) result.bio = personData.description;
        if (personData.image) result.avatarUrl = personData.image;

        const address = personData.homeLocation?.address || {};
        if (address.addressLocality) result.city = address.addressLocality;
        if (address.addressRegion) result.region = address.addressRegion;
        if (address.addressCountry) result.country = address.addressCountry;
        if (result.city || result.region || result.country) {
            result.location = [result.city, result.region, result.country].filter(Boolean).join(', ');
        }
    }

    // Stats from meta description
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const bodyText = $('body').text();

    const photoMatch = metaDesc.match(/(\d[\d,]*)\s*photos/i) || bodyText.match(/(\d[\d,]*)\s*Photos/);
    if (photoMatch) result.photoCount = parseInt(photoMatch[1].replace(/,/g, ''), 10);

    const videoMatch = metaDesc.match(/(\d[\d,]*)\s*videos/i) || bodyText.match(/(\d[\d,]*)\s*Videos/);
    if (videoMatch) result.videoCount = parseInt(videoMatch[1].replace(/,/g, ''), 10);

    const likeMatch = bodyText.match(/([\d,.]+[KkMm]?)\s*Likes/);
    if (likeMatch) {
        let likeText = likeMatch[1].replace(/,/g, '');
        if (likeText.match(/[Kk]$/)) result.likeCount = Math.round(parseFloat(likeText) * 1000);
        else if (likeText.match(/[Mm]$/)) result.likeCount = Math.round(parseFloat(likeText) * 1000000);
        else result.likeCount = parseInt(likeText, 10) || 0;
    }

    const priceMatch = metaDesc.match(/\$(\d+(?:\.\d+)?)/);
    if (priceMatch) {
        result.price = parseFloat(priceMatch[1]);
        result.isFree = result.price === 0;
    } else if (metaDesc.toLowerCase().includes('free')) {
        result.price = 0;
        result.isFree = true;
    }

    return result;
}

async function updateCreator(username, traits, data) {
    const sets = ['traits = $2', 'updated_at = NOW()'];
    const values = [username, JSON.stringify(traits)];
    let paramIdx = 3;

    if (data.bio) {
        sets.push(`bio = $${paramIdx}`);
        values.push(data.bio);
        paramIdx++;
    }
    if (data.avatarUrl) {
        sets.push(`avatar_url = $${paramIdx}`);
        values.push(data.avatarUrl);
        paramIdx++;
    }
    if (data.location) {
        sets.push(`location = COALESCE(creators.location, $${paramIdx})`);
        values.push(data.location);
        paramIdx++;
    }
    if (data.country) {
        sets.push(`country = COALESCE(creators.country, $${paramIdx})`);
        values.push(data.country);
        paramIdx++;
    }
    if (data.city) {
        sets.push(`city = COALESCE(creators.city, $${paramIdx})`);
        values.push(data.city);
        paramIdx++;
    }
    if (data.photoCount) {
        sets.push(`photo_count = GREATEST(creators.photo_count, $${paramIdx})`);
        values.push(data.photoCount);
        paramIdx++;
    }
    if (data.videoCount) {
        sets.push(`video_count = GREATEST(creators.video_count, $${paramIdx})`);
        values.push(data.videoCount);
        paramIdx++;
    }
    if (data.likeCount) {
        sets.push(`like_count = GREATEST(creators.like_count, $${paramIdx})`);
        values.push(data.likeCount);
        paramIdx++;
    }
    if (data.price !== undefined) {
        sets.push(`subscription_price = $${paramIdx}`);
        values.push(data.price);
        paramIdx++;
        sets.push(`is_free = $${paramIdx}`);
        values.push(data.isFree || false);
        paramIdx++;
    }

    await pool.query(
        `UPDATE creators SET ${sets.join(', ')} WHERE username = $1`,
        values
    );
}

async function main() {
    console.log('🏷️  NearbyOnly Traits Scraper\n');

    // Get creators that don't have traits yet (prioritize ones already in our DB)
    const result = await pool.query(`
        SELECT username FROM creators
        WHERE traits IS NULL
        ORDER BY like_count DESC NULLS LAST
        LIMIT 50000
    `);
    const usernames = result.rows.map(r => r.username);
    console.log(`  Creators without traits: ${usernames.length.toLocaleString()}`);

    let scraped = 0;
    let withTraits = 0;
    let withoutTraits = 0;
    let failed = 0;
    const startTime = Date.now();

    for (let i = 0; i < usernames.length; i += CONCURRENT) {
        const batch = usernames.slice(i, i + CONCURRENT);

        const results = await Promise.all(
            batch.map(async (username) => {
                await sleep(Math.random() * DELAY_MS);
                const html = await fetchProfile(username);
                scraped++;
                if (!html) return { username, traits: null, data: {} };

                const traits = parseTraits(html);
                const data = parseBioAndStats(html, username);
                return { username, traits, data };
            })
        );

        for (const { username, traits, data } of results) {
            if (traits) {
                try {
                    await updateCreator(username, traits, data);
                    withTraits++;
                } catch (err) {
                    failed++;
                }
            } else if (data.bio) {
                // No traits but we got bio/stats — still update those
                try {
                    await pool.query(
                        `UPDATE creators SET bio = $2, traits = '{}', updated_at = NOW() WHERE username = $1`,
                        [username, data.bio]
                    );
                    withoutTraits++;
                } catch {
                    failed++;
                }
            } else {
                // Mark as checked (empty traits) so we don't retry
                try {
                    await pool.query(
                        `UPDATE creators SET traits = '{}', updated_at = NOW() WHERE username = $1`,
                        [username]
                    );
                } catch { }
                withoutTraits++;
            }
        }

        if (scraped % BATCH_LOG === 0 || i + CONCURRENT >= usernames.length) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = scraped / elapsed;
            const eta = (usernames.length - scraped) / rate;
            process.stdout.write(
                `\r  Scraped: ${scraped.toLocaleString()}/${usernames.length.toLocaleString()} | ` +
                `With traits: ${withTraits.toLocaleString()} | Without: ${withoutTraits.toLocaleString()} | ` +
                `Rate: ${rate.toFixed(1)}/s | ETA: ${Math.round(eta / 60)}min`
            );
        }

        await sleep(DELAY_MS);
    }

    console.log(`\n\n✅ Done! With traits: ${withTraits}, Without: ${withoutTraits}, Failed: ${failed}`);
    await pool.end();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    pool.end();
    process.exit(1);
});
