import fs from 'fs';
import pg from 'pg';
const { Pool } = pg;

const p = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const usernames = fs.readFileSync('/tmp/trans_usernames.txt', 'utf8').trim().split('\n');
    console.log('Total usernames:', usernames.length);

    const tagRes = await p.query("SELECT id FROM tags WHERE slug='trans'");
    const tagId = tagRes.rows[0].id;
    console.log('Trans tag id:', tagId);

    const allIds = [];
    const BATCH = 20;
    for (let i = 0; i < usernames.length; i += BATCH) {
        const batch = usernames.slice(i, i + BATCH);
        const placeholders = [];
        const params = [];
        for (let j = 0; j < batch.length; j++) {
            placeholders.push('($' + (j * 2 + 1) + ', $' + (j * 2 + 2) + ', true, 0)');
            params.push(batch[j], batch[j]);
        }
        const sql = 'INSERT INTO creators (username, display_name, is_free, subscription_price) VALUES ' + placeholders.join(',') + ' ON CONFLICT (username) DO UPDATE SET username=EXCLUDED.username RETURNING id';
        const res = await p.query(sql, params);
        allIds.push(...res.rows.map(r => r.id));
    }
    console.log('Upserted total:', allIds.length);

    for (let i = 0; i < allIds.length; i += BATCH) {
        const batch = allIds.slice(i, i + BATCH);
        const placeholders = [];
        for (let j = 0; j < batch.length; j++) {
            placeholders.push('($' + (j + 1) + ', ' + tagId + ')');
        }
        const sql = 'INSERT INTO creator_tags (creator_id, tag_id) VALUES ' + placeholders.join(',') + ' ON CONFLICT DO NOTHING';
        await p.query(sql, batch);
    }

    const final = await p.query('SELECT COUNT(*) FROM creator_tags WHERE tag_id=$1', [tagId]);
    console.log('Total trans creators now:', final.rows[0].count);

    await p.end();
}

run();
