/**
 * Gives the demo and test accounts animated KLIPY avatars and banners
 * (anime characters, cats and memes) from prisma/demo-profile-gifs.json.
 *
 * Preview (default, rolls back):  npx ts-node --project prisma/tsconfig.seed.json -r tsconfig-paths/register scripts/update-demo-profile-gifs.ts
 * Apply:                          ...same command... --apply
 *
 * Only the listed usernames are touched, and only their avatar, banner and a
 * missing frame. Every other preference is parsed and kept as it was.
 */
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';
import { isKlipyMediaUrl } from '@/lib/klipy';
import { parseProfilePreferences, profilePreferencesSchema } from '@/lib/profile-customization';

dotenv.config({ path: '.env.local', quiet: true });

interface DemoGif {
  theme: string;
  avatar: { title: string; url: string };
  banner: { title: string; url: string };
}

/** Same frames the demo seed hands out; only used when a profile has none yet. */
const FRAMES = [
  { id: 'orbit', color: '#38bdf8', decoration: 'orbit' },
  { id: 'alien', color: '#72b981', decoration: 'alien' },
  { id: 'neon-blue', color: '#0083fe', decoration: 'neon' },
  { id: 'galaxy', color: '#8b5cf6', decoration: 'galaxy' },
  { id: 'propeller', color: '#0083fe', decoration: 'propeller' },
];

async function main() {
  const apply = process.argv.includes('--apply');
  const plan: Record<string, DemoGif> = JSON.parse(
    await readFile(path.join(__dirname, '../prisma/demo-profile-gifs.json'), 'utf8')
  );
  for (const [username, entry] of Object.entries(plan)) {
    if (!isKlipyMediaUrl(entry.avatar.url) || !isKlipyMediaUrl(entry.banner.url))
      throw new Error(`Only KLIPY media may be used (${username})`);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    const users = await client.query(
      `SELECT u.id, u.username, u.avatar_url, u.avatar_config, pc.preferences, pc.version
         FROM "User" u LEFT JOIN profile_customizations pc ON pc."userId" = u.id
        WHERE u.username = ANY($1::text[])
        FOR UPDATE OF u`,
      [Object.keys(plan)]
    );
    const missing = Object.keys(plan).filter(
      (username) => !users.rows.some((row) => row.username === username)
    );
    let frameIndex = 0;
    const report = [];
    for (const row of users.rows) {
      const entry = plan[row.username];
      const config =
        row.avatar_config && typeof row.avatar_config === 'object' ? row.avatar_config : {};
      const style =
        config.profileStyle && typeof config.profileStyle === 'object' ? config.profileStyle : {};
      const frame = style.frame ?? FRAMES[frameIndex++ % FRAMES.length];
      const current = parseProfilePreferences(row.preferences);
      const preferences = profilePreferencesSchema.parse({
        ...current,
        frameId: current.frameId === 'none' ? frame.id : current.frameId,
        banner: {
          ...current.banner,
          mode: 'image',
          imageUrl: entry.banner.url,
          positionX: 50,
          positionY: 50,
        },
      });
      await client.query(
        'UPDATE "User" SET avatar_url = $1, avatar_config = $2::jsonb WHERE id = $3',
        [entry.avatar.url, JSON.stringify({ ...config, profileStyle: { ...style, frame } }), row.id]
      );
      await client.query(
        `INSERT INTO profile_customizations ("userId", preferences, chat, version, "updatedAt")
         VALUES ($1, $2::jsonb, '{}'::jsonb, 1, now())
         ON CONFLICT ("userId") DO UPDATE
           SET preferences = EXCLUDED.preferences,
               version = profile_customizations.version + 1,
               "updatedAt" = now()`,
        [row.id, JSON.stringify(preferences)]
      );
      report.push({ username: row.username, theme: entry.theme, frame: frame.id ?? frame });
    }
    if (apply) {
      await mkdir('.tmp/demo-profiles', { recursive: true });
      await writeFile(
        `.tmp/demo-profiles/gifs-before-${Date.now()}-${randomUUID().slice(0, 8)}.json`,
        JSON.stringify(users.rows, null, 2)
      );
    }
    await client.query(apply ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify({ mode: apply ? 'applied' : 'preview', updated: report, missing }, null, 2)
    );
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
