// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Client } from 'pg';

const state = vi.hoisted(() => ({
  query: vi.fn(),
  partners: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn(async () => ({ id: 'viewer' })) }));
vi.mock('@/lib/prisma', () => ({
  prisma: { $queryRaw: state.query, user: { findMany: state.partners } },
}));

import { GET } from '../route';

// Explicit opt-in only. Fixtures are read-only CTEs that shadow the two tables;
// this test never reads user rows, writes data, or creates database objects.
const connectionString = process.env.STACKLYST_READONLY_TEST_DATABASE_URL;

describe.skipIf(!connectionString)('conversation query with PostgreSQL parameters', () => {
  let client: Client;

  beforeAll(async () => {
    const destination = new URL(connectionString!);
    client = new Client({
      connectionString,
      ssl: ['localhost', '127.0.0.1'].includes(destination.hostname)
        ? false
        : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    await client.connect();
    await client.query('BEGIN READ ONLY');
  });

  afterAll(async () => {
    await client?.query('ROLLBACK');
    await client?.end();
  });

  it('returns one latest row per visible partner, including older conversations after a busy thread', async () => {
    const messages = [
      ...Array.from({ length: 120 }, (_, index) => ({
        id: `busy-${String(index).padStart(3, '0')}`,
        sender_id: index % 2 === 0 ? 'viewer' : 'busy',
        receiver_id: index % 2 === 0 ? 'busy' : 'viewer',
        content: `Message ${index}`,
        created_at: new Date(Date.UTC(2026, 10, 1, 0, index)).toISOString(),
      })),
      {
        id: 'old',
        sender_id: 'old',
        receiver_id: 'viewer',
        content: 'Older conversation',
        created_at: '2026-10-01T00:00:00Z',
      },
      {
        id: 'blocked-by-viewer',
        sender_id: 'outgoing-block',
        receiver_id: 'viewer',
        content: 'Hidden',
        created_at: '2026-11-02T00:00:00Z',
      },
      {
        id: 'blocked-viewer',
        sender_id: 'viewer',
        receiver_id: 'incoming-block',
        content: 'Hidden',
        created_at: '2026-11-02T00:00:00Z',
      },
      {
        id: 'unrelated',
        sender_id: 'another',
        receiver_id: 'old',
        content: 'Unrelated',
        created_at: '2026-11-03T00:00:00Z',
      },
    ];
    const blocks = [
      { blockerId: 'viewer', blockedId: 'outgoing-block' },
      { blockerId: 'incoming-block', blockedId: 'viewer' },
    ];

    state.query.mockImplementation(async (parts: TemplateStringsArray, ...values: unknown[]) => {
      const sql = parts.reduce(
        (text, part, index) => text + (index ? `$${index + 2}` : '') + part,
        ''
      );
      const result = await client.query(
        `WITH "Message" AS (
          SELECT * FROM json_to_recordset($1::json)
          AS fixture(id text, sender_id text, receiver_id text, content text, created_at timestamp)
        ), "user_blocks" AS (
          SELECT * FROM json_to_recordset($2::json) AS fixture("blockerId" text, "blockedId" text)
        ) ${sql}`,
        [JSON.stringify(messages), JSON.stringify(blocks), ...values]
      );
      return result.rows;
    });
    state.partners.mockResolvedValue([
      { id: 'busy', username: 'busy', avatar_url: null },
      { id: 'old', username: 'old', avatar_url: null },
    ]);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject([
      { partnerId: 'busy', lastMessage: 'Message 119', lastSenderId: 'busy' },
      { partnerId: 'old', lastMessage: 'Older conversation', lastSenderId: 'old' },
    ]);
  });
});
