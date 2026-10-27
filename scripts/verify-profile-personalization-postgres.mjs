import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import pg from 'pg';

const connectionString = process.env.STACKLYST_TEST_DATABASE_URL;
if (!connectionString)
  throw new Error('Set STACKLYST_TEST_DATABASE_URL to the disposable quality database.');
const destination = new URL(connectionString);
if (
  destination.hostname !== '127.0.0.1' ||
  destination.port !== '55437' ||
  destination.pathname !== '/stacklyst_quality_services'
)
  throw new Error('Only 127.0.0.1:55437/stacklyst_quality_services is accepted.');
const client = new pg.Client({ connectionString, ssl: false });
try {
  await client.connect();
  const table = await client.query("SELECT to_regclass('public.profile_customizations') AS name");
  if (!table.rows[0].name) {
    // The dedicated database already contains the application's base schema.
    // Verify this additive migration verbatim; never reset or deploy old migrations.
    const base = await client.query('SELECT to_regclass(\'public."User"\') AS name');
    if (!base.rows[0].name)
      throw new Error('The dedicated quality database lacks the base schema.');
    await client.query('BEGIN');
    try {
      await client.query(
        await readFile(
          'prisma/migrations/20261027183000_profile_customization/migration.sql',
          'utf8'
        )
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
} finally {
  await client.end();
}
await new Promise((resolve, reject) => {
  const child = spawn(
    process.execPath,
    [
      'node_modules/vitest/vitest.mjs',
      'run',
      'src/services/__tests__/profile-customization.postgres.integration.test.ts',
    ],
    {
      env: {
        ...process.env,
        DATABASE_URL: connectionString,
        DIRECT_URL: connectionString,
        MOBILE_PUSH_ENABLED: 'false',
      },
      stdio: 'inherit',
      windowsHide: true,
    }
  );
  child.on('error', reject);
  child.on('exit', (code) =>
    code === 0 ? resolve() : reject(new Error(`Profile verification exited ${code}`))
  );
});
