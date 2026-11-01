import 'dotenv/config';
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';

dotenv.config({ path: '.env.local', quiet: true });
const connectionString =
  process.env.STACKLYST_TEST_DATABASE_URL || process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error('Configure uma conexão PostgreSQL para verificar o editor.');
const client = new pg.Client({ connectionString, connectionTimeoutMillis: 10000 });
const users = [randomUUID(), randomUUID(), randomUUID()];
const [owner, follower, outsider] = users;
const postIds = [randomUUID(), randomUUID()];
let checks = 0;
const check = (label, condition) => {
  assert.ok(condition, label);
  checks++;
};
try {
  await client.connect();
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout = '5s'");
  const exists = await client.query(`SELECT to_regclass('public."PostPoll"') AS name`);
  if (!exists.rows[0].name) {
    await client.query(
      await readFile('prisma/migrations/20261101021134_rich_post_composer/migration.sql', 'utf8')
    );
  }
  for (const [index, id] of users.entries())
    await client.query('INSERT INTO "User" (id,username,email) VALUES ($1,$2,$3)', [
      id,
      `composer-qa-${id}`,
      `composer-qa-${index}-${id}@example.invalid`,
    ]);
  await client.query('INSERT INTO "Follow" ("followerId","followingId") VALUES ($1,$2)', [
    follower,
    owner,
  ]);
  for (const [index, id] of postIds.entries())
    await client.query(
      'INSERT INTO "Post" (id,author_id,title,body,audience,attachments) VALUES ($1,$2,$3,$4,$5,$6)',
      [
        id,
        owner,
        'Composer transaction test',
        '<u>Texto</u> **formatado**',
        index ? 'everyone' : 'followers',
        JSON.stringify([]),
      ]
    );
  const accessible = async (viewer) =>
    Number(
      (
        await client.query(
          `
    SELECT count(*) FROM "Post" p WHERE p.id = ANY($1::text[]) AND
    (p.audience='everyone' OR p.author_id=$2 OR
      (p.audience='followers' AND EXISTS (SELECT 1 FROM "Follow" f WHERE f."followerId"=$2 AND f."followingId"=p.author_id)))`,
          [postIds, viewer]
        )
      ).rows[0].count
    );
  check('author sees both posts', (await accessible(owner)) === 2);
  check('actual follower sees both posts', (await accessible(follower)) === 2);
  check('outsider sees only public post', (await accessible(outsider)) === 1);
  check('anonymous sees only public post', (await accessible(null)) === 1);
  const mediaId = randomUUID();
  await client.query(
    'INSERT INTO "PostMedia" (id,owner_id,post_id,storage_path,content_type,size) VALUES ($1,$2,$3,$4,$5,$6)',
    [mediaId, owner, postIds[0], `${owner}/${mediaId}.webp`, 'image/webp', 100]
  );
  check(
    'private media persists with its owning post',
    (await client.query('SELECT post_id FROM "PostMedia" WHERE id=$1', [mediaId])).rows[0]
      .post_id === postIds[0]
  );
  const pollId = randomUUID();
  const options = [randomUUID(), randomUUID()];
  await client.query(
    'INSERT INTO "PostPoll" (id,post_id,question,expires_at) VALUES ($1,$2,$3,now()+interval \'1 hour\')',
    [pollId, postIds[0], 'Qual linguagem?']
  );
  for (const [position, id] of options.entries())
    await client.query(
      'INSERT INTO "PostPollOption" (id,poll_id,position,text) VALUES ($1,$2,$3,$4)',
      [id, pollId, position, ['TypeScript', 'Python'][position]]
    );
  await client.query(
    'INSERT INTO "PostPollVote" (id,poll_id,option_id,user_id) VALUES ($1,$2,$3,$4)',
    [randomUUID(), pollId, options[1], follower]
  );
  await client.query('SAVEPOINT duplicate_vote');
  let duplicate = false;
  try {
    await client.query(
      'INSERT INTO "PostPollVote" (id,poll_id,option_id,user_id) VALUES ($1,$2,$3,$4)',
      [randomUUID(), pollId, options[0], follower]
    );
  } catch (error) {
    duplicate = error.code === '23505';
    await client.query('ROLLBACK TO SAVEPOINT duplicate_vote');
  }
  check('database rejects duplicate voter', duplicate);
  check(
    'vote count remains correct',
    Number(
      (await client.query('SELECT count(*) FROM "PostPollVote" WHERE poll_id=$1', [pollId])).rows[0]
        .count
    ) === 1
  );
  check(
    'expiry stored in database',
    (
      await client.query('SELECT expires_at > now() AS active FROM "PostPoll" WHERE id=$1', [
        pollId,
      ])
    ).rows[0].active
  );
  const rls = await client.query(
    `SELECT count(*) FROM pg_class WHERE relname = ANY($1::text[]) AND relrowsecurity`,
    [['Post', 'PostMedia', 'PostPoll', 'PostPollOption', 'PostPollVote']]
  );
  check('all content tables have RLS', Number(rls.rows[0].count) === 5);
  await client.query('ROLLBACK');
  check(
    'test data fully rolled back',
    Number(
      (await client.query('SELECT count(*) FROM "User" WHERE id=ANY($1::text[])', [users])).rows[0]
        .count
    ) === 0
  );
  console.log(`${checks} PostgreSQL checks passed; migration and test data were rolled back.`);
} finally {
  await client.query('ROLLBACK').catch(() => {});
  await client.end();
}
