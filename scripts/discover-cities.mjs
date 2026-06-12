/**
 * Discover fans300 city IDs by crawling their search pages.
 * Finds all cityId= references across category and location pages.
 *
 * Usage: node scripts/discover-cities.mjs
 */

import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

const DELAY_MS = 800;

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

async function main() {
    const allCityIds = new Set();

    // Try various search URLs to find cityId references
    const searchUrls = [
        // Country codes fans300 uses
        'https://fans300.com/search?countryId=1',    // US
        'https://fans300.com/search?countryId=2',    // UK
        'https://fans300.com/search?countryId=3',    // Canada
        'https://fans300.com/search?countryId=4',    // Australia
        'https://fans300.com/search?countryId=5',    // Germany
        'https://fans300.com/search?countryId=6',    // France
        'https://fans300.com/search?countryId=7',    // Spain
        'https://fans300.com/search?countryId=8',    // Italy
        'https://fans300.com/search?countryId=9',    // Brazil
        'https://fans300.com/search?countryId=10',   // Mexico
        'https://fans300.com/search?countryId=11',   // Colombia
        'https://fans300.com/search?countryId=12',   // Argentina
        'https://fans300.com/search?countryId=13',   // Poland
        'https://fans300.com/search?countryId=14',   // Netherlands
        'https://fans300.com/search?countryId=15',   // Sweden
        'https://fans300.com/search?countryId=16',   // Romania
        'https://fans300.com/search?countryId=17',   // Thailand
        'https://fans300.com/search?countryId=18',   // Philippines
        'https://fans300.com/search?countryId=19',   // Japan
        'https://fans300.com/search?countryId=20',   // South Africa
    ];

    console.log('Discovering fans300 city IDs...\n');

    for (const url of searchUrls) {
        await sleep(DELAY_MS);
        const html = await fetchPage(url);
        if (!html) {
            console.log(`  Failed: ${url}`);
            continue;
        }

        // Find all cityId references in the page
        const matches = [...html.matchAll(/cityId=(\d+)/g)];
        const newIds = matches.map(m => m[1]);
        newIds.forEach(id => allCityIds.add(id));

        // Also look for select options or dropdown values
        const $ = cheerio.load(html);
        $('option[value*="cityId"], a[href*="cityId"]').each((_, el) => {
            const val = $(el).attr('value') || $(el).attr('href') || '';
            const match = val.match(/cityId=(\d+)/);
            if (match) allCityIds.add(match[1]);
        });

        console.log(`  ${url} → +${newIds.length} refs (total unique: ${allCityIds.size})`);
    }

    // Also try known good city IDs and look for "related" or "nearby" city links
    const knownCities = [50388, 122795, 121746, 120163];
    for (const cityId of knownCities) {
        await sleep(DELAY_MS);
        const html = await fetchPage(`https://fans300.com/search?cityId=${cityId}`);
        if (!html) continue;

        const matches = [...html.matchAll(/cityId=(\d+)/g)];
        matches.forEach(m => allCityIds.add(m[1]));
        console.log(`  cityId=${cityId} → +${matches.length} refs (total: ${allCityIds.size})`);
    }

    const ids = [...allCityIds].map(Number).sort((a, b) => a - b);
    console.log(`\n✅ Discovered ${ids.length} unique city IDs`);
    console.log('Range:', ids[0], '-', ids[ids.length - 1]);

    writeFileSync('scripts/fans300-city-ids.json', JSON.stringify(ids));
    console.log('Saved to scripts/fans300-city-ids.json');
}

main().catch(console.error);
