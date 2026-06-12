/**
 * Fast traits scraper — infers traits from NearbyOnly category pages.
 * Instead of scraping 49K individual profiles (9 hours), this scrapes
 * 110 trait-related category pages (2 minutes) and assigns traits based
 * on which categories each creator appears in.
 *
 * e.g. creator on /blonde → hairColor: "Blonde"
 *      creator on /slim   → bodyType: "Slim"
 *      creator on /asian  → ethnicity: "Asian"
 *
 * Usage: DATABASE_URL="..." node scripts/scrape-traits-fast.mjs
 */

import * as cheerio from 'cheerio';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dan@localhost:5432/of_directory',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 5,
});

const DELAY_MS = 800;

// Map category slugs to trait key-value pairs
const CATEGORY_TRAITS = {
    // Hair Color
    'blonde': { hairColor: 'Blonde' },
    'brunette': { hairColor: 'Brunette' },
    'redhead': { hairColor: 'Redhead' },
    'black-hair': { hairColor: 'Black Hair' },
    'colored-hair': { hairColor: 'Colored Hair' },

    // Hair Length
    'short-hair': { hairLength: 'Short Hair' },

    // Body Type
    'curvy': { bodyType: 'Curvy' },
    'petite': { bodyType: 'Petite' },
    'slim': { bodyType: 'Slim' },
    'chubby': { bodyType: 'Chubby' },
    'bbw': { bodyType: 'BBW' },
    'thick': { bodyType: 'Thick' },
    'slim-thick': { bodyType: 'Slim Thick' },
    'tall': { bodyType: 'Tall' },
    'fitness': { bodyType: 'Athletic' },

    // Breasts
    'busty': { breasts: 'Big Boobs' },
    'big-tits': { breasts: 'Big Boobs' },
    'small-tits': { breasts: 'Small Boobs' },

    // Ethnicity
    'asian': { ethnicity: 'Asian' },
    'latina': { ethnicity: 'Latina' },
    'ebony': { ethnicity: 'Ebony' },
    'caucasian': { ethnicity: 'White' },
    'indian': { ethnicity: 'Indian' },
    'korean': { ethnicity: 'Korean' },
    'arab': { ethnicity: 'Arab' },
    'lightskin': { ethnicity: 'Light Skin' },

    // Age
    'teen': { age: 'Young' },
    'milf': { age: 'MILF' },
    'gilf': { age: 'Mature' },
    'college': { age: 'College' },

    // Style
    'goth': { style: 'Goth' },
    'alt': { style: 'Alt' },
    'natural': { style: 'Natural' },
    'glamorous': { style: 'Glamorous' },
    'sporty': { style: 'Sporty' },
    'nerd': { style: 'Nerd' },
    'egirl': { style: 'E-Girl' },
    'bimbo': { style: 'Bimbo' },
    'elegant': { style: 'Elegant' },
    'tattoos': { style: 'Tattooed' },
    'piercing': { style: 'Pierced' },
    'freckles': { style: 'Freckles' },
    'hairy': { style: 'Hairy' },
    'braces': { style: 'Braces' },

    // Combined categories (multiple traits)
    'petite-blonde': { bodyType: 'Petite', hairColor: 'Blonde' },
    'petite-asian': { bodyType: 'Petite', ethnicity: 'Asian' },
    'petite-latina': { bodyType: 'Petite', ethnicity: 'Latina' },
    'thick-asian': { bodyType: 'Thick', ethnicity: 'Asian' },
    'thick-latina': { bodyType: 'Thick', ethnicity: 'Latina' },
    'thick-ebony': { bodyType: 'Thick', ethnicity: 'Ebony' },
    'chubby-latina': { bodyType: 'Chubby', ethnicity: 'Latina' },
    'busty-latina': { breasts: 'Big Boobs', ethnicity: 'Latina' },
    'busty-asian': { breasts: 'Big Boobs', ethnicity: 'Asian' },
    'big-ass-latina': { bodyType: 'Curvy', ethnicity: 'Latina' },
    'big-ass-asian': { bodyType: 'Curvy', ethnicity: 'Asian' },
    'blonde-milf': { hairColor: 'Blonde', age: 'MILF' },
    'blonde-teen': { hairColor: 'Blonde', age: 'Young' },
    'asian-milf': { ethnicity: 'Asian', age: 'MILF' },
    'asian-teen': { ethnicity: 'Asian', age: 'Young' },
    'latina-milf': { ethnicity: 'Latina', age: 'MILF' },
    'latina-teen': { ethnicity: 'Latina', age: 'Young' },
    'ebony-milf': { ethnicity: 'Ebony', age: 'MILF' },
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeCategory(slug) {
    try {
        const res = await fetch(`https://nearbyonly.com/${slug}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });
        if (!res.ok) return [];
        const html = await res.text();
        const $ = cheerio.load(html);

        const usernames = new Set();
        $('a[href^="/onlyfans/"]').each((_, el) => {
            const href = $(el).attr('href');
            const match = href.match(/^\/onlyfans\/([a-z0-9._-]+)$/i);
            if (match) usernames.add(match[1].toLowerCase());
        });
        return [...usernames];
    } catch {
        return [];
    }
}

async function main() {
    console.log('⚡ Fast Category-Based Traits Scraper\n');

    const categories = Object.keys(CATEGORY_TRAITS);
    console.log(`  Categories to scrape: ${categories.length}`);

    // Collect all username→traits mappings
    const creatorTraits = {}; // username -> { hairColor: ..., bodyType: ..., etc }
    let totalFound = 0;

    for (let i = 0; i < categories.length; i++) {
        const slug = categories[i];
        const traits = CATEGORY_TRAITS[slug];
        const usernames = await scrapeCategory(slug);

        for (const username of usernames) {
            if (!creatorTraits[username]) creatorTraits[username] = {};
            Object.assign(creatorTraits[username], traits);
        }

        totalFound += usernames.length;
        process.stdout.write(
            `\r  [${i + 1}/${categories.length}] ${slug} → ${usernames.length} creators | Unique so far: ${Object.keys(creatorTraits).length}`
        );

        await sleep(DELAY_MS);
    }

    console.log(`\n\n  Total unique creators with traits: ${Object.keys(creatorTraits).length}`);
    console.log(`  Now updating database...\n`);

    // Update database — merge traits with existing
    let updated = 0;
    let notFound = 0;
    const entries = Object.entries(creatorTraits);

    for (let i = 0; i < entries.length; i++) {
        const [username, traits] = entries[i];

        // Only update if they have at least 2 traits
        if (Object.keys(traits).length < 2) continue;

        try {
            const result = await pool.query(
                `UPDATE creators
                 SET traits = COALESCE(traits, '{}'::jsonb) || $2::jsonb,
                     updated_at = NOW()
                 WHERE username = $1
                 RETURNING id`,
                [username, JSON.stringify(traits)]
            );
            if (result.rowCount > 0) updated++;
            else notFound++;
        } catch {
            // skip
        }

        if ((i + 1) % 100 === 0) {
            process.stdout.write(`\r  Updated: ${updated} | Not in DB: ${notFound} | Progress: ${i + 1}/${entries.length}`);
        }
    }

    console.log(`\n\n✅ Done! Updated ${updated} creators with traits. ${notFound} not found in DB.`);

    // Stats
    const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM creators WHERE traits IS NOT NULL AND traits != '{}'`
    );
    console.log(`  Total creators with traits in DB: ${countResult.rows[0].total}`);

    await pool.end();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    pool.end();
    process.exit(1);
});
