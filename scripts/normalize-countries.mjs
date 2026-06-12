import pg from 'pg';
const { Pool } = pg;

const p = new Pool({ connectionString: process.env.DATABASE_URL });

// Map location strings to country names
const COUNTRY_PATTERNS = [
    { pattern: /\bUnited States\b|\bUSA\b|\bU\.S\.A\b|\bUS\b/i, country: 'United States' },
    { pattern: /\bUnited Kingdom\b|\bEngland\b|\bScotland\b|\bWales\b|\bUK\b/i, country: 'United Kingdom' },
    { pattern: /\bCanada\b/i, country: 'Canada' },
    { pattern: /\bFrance\b/i, country: 'France' },
    { pattern: /\bDenmark\b/i, country: 'Denmark' },
    { pattern: /\bColombia\b/i, country: 'Colombia' },
    { pattern: /\bArgentina\b/i, country: 'Argentina' },
    { pattern: /\bBrazil\b|Brasil\b/i, country: 'Brazil' },
    { pattern: /\bPoland\b|Polska\b/i, country: 'Poland' },
    { pattern: /\bChile\b/i, country: 'Chile' },
    { pattern: /\bPortugal\b/i, country: 'Portugal' },
    { pattern: /\bRomania\b/i, country: 'Romania' },
    { pattern: /\bSpain\b|España\b/i, country: 'Spain' },
    { pattern: /\bCroatia\b/i, country: 'Croatia' },
    { pattern: /\bAustralia\b/i, country: 'Australia' },
    { pattern: /\bMexico\b|México\b/i, country: 'Mexico' },
    { pattern: /\bItaly\b|Italia\b/i, country: 'Italy' },
    { pattern: /\bSweden\b/i, country: 'Sweden' },
    { pattern: /\bGermany\b|Deutschland\b/i, country: 'Germany' },
    { pattern: /\bThailand\b/i, country: 'Thailand' },
];

// US states → United States
const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
];

function detectCountry(location) {
    if (!location) return null;
    const loc = location.trim();

    // Direct country match
    for (const { pattern, country } of COUNTRY_PATTERNS) {
        if (pattern.test(loc)) return country;
    }

    // US state detection
    for (const state of US_STATES) {
        if (loc.includes(state)) return 'United States';
    }

    // Common US cities
    if (/Los Angeles|New York|Miami|Chicago|Las Vegas|Houston|Atlanta|Dallas|San Francisco|San Diego|Phoenix|Seattle|Denver|Boston|Portland/i.test(loc)) {
        return 'United States';
    }

    // UK cities
    if (/London|Manchester|Birmingham|Liverpool|Leeds|Glasgow|Edinburgh|Bristol|Cardiff/i.test(loc)) {
        return 'United Kingdom';
    }

    return null;
}

async function run() {
    // Get all creators with a location but no country
    const res = await p.query(
        "SELECT id, location FROM creators WHERE (country IS NULL OR country = '') AND location IS NOT NULL AND location != ''"
    );
    console.log('Creators with location but no country:', res.rows.length);

    let updated = 0;
    const BATCH = 100;
    const updates = [];

    for (const row of res.rows) {
        const country = detectCountry(row.location);
        if (country) {
            updates.push({ id: row.id, country });
        }
    }

    console.log('Detected country for:', updates.length, 'creators');

    // Batch update
    for (let i = 0; i < updates.length; i += BATCH) {
        const batch = updates.slice(i, i + BATCH);
        const cases = batch.map((u, j) => `WHEN id = $${j * 2 + 1} THEN $${j * 2 + 2}`).join(' ');
        const ids = batch.map((u, j) => `$${j * 2 + 1}`).join(',');
        const params = batch.flatMap(u => [u.id, u.country]);
        const sql = `UPDATE creators SET country = CASE ${cases} END WHERE id IN (${ids})`;
        await p.query(sql, params);
        updated += batch.length;
        process.stdout.write('\rUpdated: ' + updated + '/' + updates.length);
    }

    console.log('\nDone!');

    // Also fix creators that have country='US' → 'United States'
    const fixRes = await p.query("UPDATE creators SET country = 'United States' WHERE country = 'US'");
    console.log('Fixed US→United States:', fixRes.rowCount);

    // Show final counts
    const final = await p.query("SELECT country, COUNT(*) as cnt FROM creators WHERE country IS NOT NULL AND country != '' GROUP BY country ORDER BY cnt DESC LIMIT 20");
    console.log('\nFinal country distribution:');
    console.log(final.rows);

    await p.end();
}

run();
