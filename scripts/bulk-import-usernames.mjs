/**
 * Bulk import NearbyOnly usernames into the DB.
 * Inserts with predictable avatar URLs (cdn.nearbyonly.com/avatars/{username}.webp).
 * The full profile scraper (scrape-nearby.mjs) can then enrich these with stats/bio.
 *
 * Usage: DATABASE_URL="..." node scripts/bulk-import-usernames.mjs
 */

import pg from 'pg';
import { readFileSync } from 'fs';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dan@localhost:5432/of_directory',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 5,
});

const BATCH_SIZE = 500;

async function main() {
    console.log('📥 Bulk importing NearbyOnly usernames...\n');

    const usernames = readFileSync('scripts/nearby-usernames.txt', 'utf-8')
        .split('\n')
        .map(u => u.trim())
        .filter(Boolean);

    console.log(`  Total usernames: ${usernames.length.toLocaleString()}`);

    // Get existing count
    const before = await pool.query('SELECT COUNT(*) as count FROM creators');
    console.log(`  DB count before: ${before.rows[0].count}`);

    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < usernames.length; i += BATCH_SIZE) {
        const batch = usernames.slice(i, i + BATCH_SIZE);

        // Build bulk insert query
        const values = [];
        const placeholders = [];
        let paramIdx = 1;

        for (const username of batch) {
            const avatarUrl = `https://cdn.nearbyonly.com/avatars/${username}.webp`;
            placeholders.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2})`);
            values.push(username, username, avatarUrl);
            paramIdx += 3;
        }

        const query = `
            INSERT INTO creators (username, display_name, avatar_url)
            VALUES ${placeholders.join(', ')}
            ON CONFLICT (username) DO NOTHING
        `;

        try {
            const result = await pool.query(query, values);
            inserted += result.rowCount;
            skipped += batch.length - result.rowCount;
        } catch (err) {
            console.error(`  Error at batch ${i}:`, err.message);
        }

        if ((i + BATCH_SIZE) % 5000 === 0 || i + BATCH_SIZE >= usernames.length) {
            process.stdout.write(`\r  Progress: ${Math.min(i + BATCH_SIZE, usernames.length).toLocaleString()}/${usernames.length.toLocaleString()} | Inserted: ${inserted.toLocaleString()} | Skipped: ${skipped.toLocaleString()}`);
        }
    }

    const after = await pool.query('SELECT COUNT(*) as count FROM creators');
    console.log(`\n\n✅ Done! DB count: ${after.rows[0].count.toLocaleString()} (added ${inserted.toLocaleString()} new)`);
    await pool.end();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    pool.end();
    process.exit(1);
});
