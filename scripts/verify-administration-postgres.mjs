import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
) {
  throw new Error('Only 127.0.0.1:55437/stacklyst_quality_services is accepted.');
}

const env = {
  ...process.env,
  DIRECT_URL: connectionString,
  DATABASE_URL: connectionString,
  MOBILE_PUSH_ENABLED: 'false',
};
function run(file, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
      windowsHide: true,
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`Verification command exited ${code}`))
    );
  });
}

const client = new pg.Client({ connectionString, ssl: false });
try {
  await client.connect();
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  if (tables.rows.length === 0) {
    // Bootstrap the current base schema in an EMPTY database, with no reset or data loss.
    // Apply the delivered migration verbatim afterward to verify it independently.
    const source = await readFile('prisma/schema.prisma', 'utf8');
    const base = source
      .replace(
        /\/\/ Intentionally has no cascading relations: administrative evidence outlives its subject\.\r?\nmodel SecurityAuditEvent \{[\s\S]*?\r?\n\}/,
        ''
      )
      .replace(
        /^  @@index\(\[sender_id, receiver_id, created_at\(sort: Desc\), id\(sort: Desc\)\]\)\r?\n/m,
        ''
      )
      .replace(
        /^  @@index\(\[receiver_id, sender_id, created_at\(sort: Desc\), id\(sort: Desc\)\]\)\r?\n/m,
        ''
      );
    const directory = await mkdtemp(join(tmpdir(), 'stacklyst-quality-schema-'));
    const path = join(directory, 'schema.prisma');
    await writeFile(path, base);
    await run('node_modules/prisma/build/index.js', ['db', 'push', '--schema', path]);
    await client.query(
      await readFile(
        'prisma/migrations/20261027010000_security_audit_retention/migration.sql',
        'utf8'
      )
    );
  } else if (!tables.rows.some(({ tablename }) => tablename === 'security_audit_events')) {
    throw new Error(
      'The database is not empty and lacks the quality audit migration. Use a new empty quality database; this script never resets one.'
    );
  }
} finally {
  await client.end();
}
await run('node_modules/vitest/vitest.mjs', [
  'run',
  'src/services/__tests__/administration.postgres.integration.test.ts',
]);
