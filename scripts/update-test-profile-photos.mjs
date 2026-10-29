/** Replace only the default photos of the explicitly listed test accounts. */
import dotenv from 'dotenv';
import pg from 'pg';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

dotenv.config({ path: '.env.local', quiet: true });
const assets = JSON.parse(
  await readFile(new URL('../prisma/test-profile-assets.json', import.meta.url), 'utf8')
);
const apply = process.argv.includes('--apply');
for (const asset of Object.values(assets)) {
  const path = new URL(`../public${new URL(asset.avatar_url).pathname}`, import.meta.url);
  const metadata = await sharp(await readFile(path)).metadata();
  if (metadata.width !== 256 || metadata.height !== 256) {
    throw new Error(`Invalid profile photo: ${asset.avatar_url}`);
  }
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
      `SELECT id, username, avatar_url FROM "User"
       WHERE username = $1
         AND (NULLIF(TRIM(avatar_url), '') IS NULL OR avatar_url = $2)
       FOR UPDATE`,
      [username, `https://api.dicebear.com/9.x/pixel-art/svg?seed=${username}`]
    );
    for (const row of result.rows) {
      before.push(row);
      if (apply) {
        await client.query('UPDATE "User" SET avatar_url = $1 WHERE id = $2', [
          asset.avatar_url,
          row.id,
        ]);
      }
    }
  }
  if (apply && before.length) {
    await mkdir('.tmp/demo-profiles', { recursive: true });
    await writeFile(
      `.tmp/demo-profiles/test-photos-before-${Date.now()}.json`,
      JSON.stringify(before, null, 2)
    );
  }
  const verified = await client.query(
    'SELECT username, avatar_url FROM "User" WHERE username = ANY($1::text[]) ORDER BY username',
    [Object.keys(assets)]
  );
  if (
    apply &&
    before.some(
      (row) =>
        !verified.rows.some(
          (current) =>
            current.username === row.username &&
            current.avatar_url === assets[row.username].avatar_url
        )
    )
  ) {
    throw new Error('Profile photo verification failed');
  }
  await client.query(apply ? 'COMMIT' : 'ROLLBACK');
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'applied' : 'preview',
        matched: before.map((row) => row.username),
        profiles: verified.rows,
      },
      null,
      2
    )
  );
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
