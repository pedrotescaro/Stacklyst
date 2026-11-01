// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { describe, expect, it } from 'vitest';

describe.skipIf(process.env.CREDENTIAL_MIGRATION_DB_TEST !== '1')(
  'credential migration on PostgreSQL with rollback',
  () => {
    it('keeps snapshots immutable, enforces unique grants and denies direct browser access without changing progress', async () => {
      const client = new Client({
        connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      const migration = await readFile(
        'prisma/migrations/20261101193000_learning_credentials/migration.sql',
        'utf8'
      );
      await client.connect();
      await client.query('BEGIN');
      try {
        const before = await client.query(
          `SELECT (SELECT count(*)::int FROM "QuizAttempt") AS attempts, (SELECT count(*)::int FROM exercise_submissions) AS submissions, (SELECT sum(total_xp)::text FROM "User") AS xp, (SELECT count(*)::int FROM user_profile_achievements) AS titles`
        );
        const existing = await client.query(
          `SELECT to_regclass('public.learning_credentials') IS NOT NULL AS exists`
        );
        if (!existing.rows[0].exists) await client.query(migration);
        const after = await client.query(
          `SELECT (SELECT count(*)::int FROM "QuizAttempt") AS attempts, (SELECT count(*)::int FROM exercise_submissions) AS submissions, (SELECT sum(total_xp)::text FROM "User") AS xp, (SELECT count(*)::int FROM user_profile_achievements) AS titles`
        );
        expect(after.rows).toEqual(before.rows);
        const security = await client.query(
          `SELECT relrowsecurity, has_table_privilege('anon','public.learning_credentials','SELECT') AS anon_read, has_table_privilege('authenticated','public.learning_credentials','INSERT') AS client_grant FROM pg_class WHERE oid='public.learning_credentials'::regclass`
        );
        expect(security.rows[0]).toEqual({
          relrowsecurity: true,
          anon_read: false,
          client_grant: false,
        });
        const userId = randomUUID(),
          id = randomUUID();
        await client.query(`INSERT INTO "User"(id,username,email) VALUES($1,$2,$3)`, [
          userId,
          `credential-${userId}`,
          `${userId}@example.invalid`,
        ]);
        await client.query(
          `INSERT INTO learning_credentials(id,"userId","definitionId","definitionVersion",snapshot,"integrityHash","verifiedAt") VALUES($1,$2,'test',1,'{}',$3,now())`,
          [id, userId, 'a'.repeat(64)]
        );
        await client.query('SAVEPOINT unique_grant');
        await expect(
          client.query(
            `INSERT INTO learning_credentials(id,"userId","definitionId","definitionVersion",snapshot,"integrityHash","verifiedAt") VALUES($1,$2,'test',1,'{}',$3,now())`,
            [randomUUID(), userId, 'b'.repeat(64)]
          )
        ).rejects.toMatchObject({ code: '23505' });
        await client.query('ROLLBACK TO SAVEPOINT unique_grant');
        await client.query('SAVEPOINT immutable_snapshot');
        await expect(
          client.query(`UPDATE learning_credentials SET snapshot='{"changed":true}' WHERE id=$1`, [
            id,
          ])
        ).rejects.toMatchObject({ code: '23514' });
        await client.query('ROLLBACK TO SAVEPOINT immutable_snapshot');
        await client.query(
          `UPDATE learning_credentials SET "revokedAt"=now(), "revocationReason"='Test' WHERE id=$1`,
          [id]
        );
        await client.query('SAVEPOINT no_reissue');
        await expect(
          client.query(`UPDATE learning_credentials SET "revokedAt"=NULL WHERE id=$1`, [id])
        ).rejects.toMatchObject({ code: '23514' });
        await client.query('ROLLBACK TO SAVEPOINT no_reissue');
      } finally {
        await client.query('ROLLBACK');
        await client.end();
      }
    }, 45000);
  }
);
