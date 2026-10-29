/** Updates only the exact seed identities, preserving every other profile field. */
import dotenv from 'dotenv';
import pg from 'pg';
import { randomInt } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });
const assets = JSON.parse(
  await readFile(new URL('../prisma/demo-profile-assets.json', import.meta.url), 'utf8')
);
const frames = [
  { id: 'orbit', color: '#38bdf8', decoration: 'orbit' },
  { id: 'alien', color: '#72b981', decoration: 'alien' },
  { id: 'neon-blue', color: '#0083fe', decoration: 'neon' },
  { id: 'galaxy', color: '#8b5cf6', decoration: 'galaxy' },
  { id: 'propeller', color: '#0083fe', decoration: 'propeller' },
];
for (const value of Object.values(assets)) {
  const response = await fetch(value.avatar_url);
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/'))
    throw new Error('Demo photo unavailable');
  await response.arrayBuffer();
}
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
});
await client.connect();
try {
  await client.query('BEGIN');
  const before = [];
  for (const [username, asset] of Object.entries(assets)) {
    const result = await client.query(
      'SELECT id,username,avatar_url,avatar_config FROM "User" WHERE username=$1 AND email=ANY($2::text[]) FOR UPDATE',
      [username, asset.emails]
    );
    for (const row of result.rows) {
      before.push(row);
      const config =
        typeof row.avatar_config === 'object' && row.avatar_config ? row.avatar_config : {};
      const style = config.profileStyle || {};
      const frame = frames[randomInt(frames.length)];
      await client.query('UPDATE "User" SET avatar_url=$1,avatar_config=$2::jsonb WHERE id=$3', [
        asset.avatar_url,
        JSON.stringify({ ...config, profileStyle: { ...style, frame } }),
        row.id,
      ]);
    }
  }
  await mkdir('.tmp/demo-profiles', { recursive: true });
  await writeFile(`.tmp/demo-profiles/before-${Date.now()}.json`, JSON.stringify(before, null, 2));
  await client.query('COMMIT');
  const verified = await client.query(
    'SELECT username,avatar_url,avatar_config FROM "User" WHERE id=ANY($1::text[])',
    [before.map((row) => row.id)]
  );
  console.log(
    JSON.stringify({
      updated: verified.rows.length,
      users: verified.rows.map((row) => ({
        username: row.username,
        photo: !!row.avatar_url,
        frame: row.avatar_config.profileStyle.frame.id,
      })),
    })
  );
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
