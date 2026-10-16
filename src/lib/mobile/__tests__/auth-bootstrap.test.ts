// @vitest-environment node
import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LANGUAGE_TRAILS } from '@/lib/config';

type Row = { id: string; username: string; email: string; [key: string]: unknown };
type Trail = { user_id: string; language: string; xp: number; level: number; streak: number };
type Lookup = { where: { id?: string; email?: string; username?: string } };
const mocks = vi.hoisted(() => ({
  configured: true,
  rows: new Map<string, Row>(),
  trails: [] as Trail[],
  findUnique: vi.fn(),
  create: vi.fn(),
  createMany: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({
  hasDatabaseConnection: () => mocks.configured,
  prisma: { user: { findUnique: mocks.findUnique }, $transaction: mocks.transaction },
}));
import { bootstrapMobileUser } from '../auth-bootstrap';

function authUser(overrides: Partial<User> = {}) {
  return {
    id: 'a9e0f784-4f51-411b-9da2-66b90ceebbb5',
    email: 'pedro@example.com',
    user_metadata: { full_name: 'Pedro José', avatar_url: 'https://example.com/avatar.png' },
    app_metadata: { provider: 'google' },
    ...overrides,
  } as User;
}

function lookup({ where }: Lookup) {
  const found = [...mocks.rows.values()].find((row) =>
    Object.entries(where).every(([key, value]) => row[key] === value)
  );
  return found ? { id: found.id, username: found.username } : null;
}

describe('native account creation and preservation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.configured = true;
    mocks.rows.clear();
    mocks.trails = [];
    mocks.findUnique.mockImplementation(async (args: Lookup) => lookup(args));
    mocks.create.mockImplementation(async ({ data }: { data: Row }) => ({
      id: data.id,
      username: data.username,
    }));
    mocks.createMany.mockResolvedValue({ count: DEFAULT_LANGUAGE_TRAILS.length });
    // Model transaction visibility and commit uniqueness: a losing writer commits
    // neither its profile nor its trails. This also permits overlapping requests.
    mocks.transaction.mockImplementation(async (operation) => {
      let pending: Row | undefined;
      let pendingTrails: Trail[] = [];
      const result = await operation({
        user: {
          findUnique: async (args: Lookup) => lookup(args),
          create: async (args: { data: Row }) => {
            const result = await mocks.create(args);
            pending = args.data;
            return result;
          },
        },
        languageTrail: {
          createMany: async (args: { data: Trail[] }) => {
            await mocks.createMany(args);
            pendingTrails = args.data;
          },
        },
      });
      if (pending) {
        const pendingUser = pending;
        const uniqueCollision = [...mocks.rows.values()].some(
          (row) =>
            row.id === pendingUser.id ||
            row.email === pendingUser.email ||
            row.username === pendingUser.username
        );
        if (uniqueCollision) throw Object.assign(new Error('Unique collision'), { code: 'P2002' });
        mocks.rows.set(pending.id, pending);
        mocks.trails.push(...pendingTrails);
      }
      return result;
    });
  });

  it('creates one regular profile and all nine trails atomically from verified identity', async () => {
    const result = await bootstrapMobileUser(
      authUser({
        user_metadata: { full_name: 'Pedro José', role: 'ADMIN', total_xp: 999999 },
        app_metadata: { provider: 'google', role: 'ADMIN' },
      })
    );
    expect(result).toMatchObject({ created: true, user: { username: 'pedro_jose' } });
    const row = mocks.rows.get(authUser().id);
    expect(row).toMatchObject({
      email: 'pedro@example.com',
      role: 'USER',
      total_xp: 0,
      github_username: null,
    });
    expect(mocks.trails).toHaveLength(9);
    expect(mocks.trails.map((trail) => trail.language)).toEqual([...DEFAULT_LANGUAGE_TRAILS]);
    expect(mocks.trails.every((trail) => trail.user_id === authUser().id && trail.xp === 0)).toBe(
      true
    );
  });

  it('preserves an existing application profile, permissions and progress on repeated logins', async () => {
    const existing = {
      id: authUser().id,
      username: 'my_chosen_name',
      email: 'old@example.com',
      role: 'EVALUATOR',
      bio: 'My existing bio',
      total_xp: 880,
    };
    mocks.rows.set(existing.id, { ...existing });
    mocks.trails.push({ user_id: existing.id, language: 'TS', xp: 880, level: 2, streak: 3 });
    const result = await bootstrapMobileUser(authUser());
    expect(result).toEqual({
      created: false,
      user: { id: existing.id, username: existing.username },
    });
    expect(mocks.rows.get(existing.id)).toEqual(existing);
    expect(mocks.trails[0].xp).toBe(880);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('finds an available bounded username when provider names collide, without changing the owner', async () => {
    const other = { id: 'other', username: 'pedro_jose', email: 'other@example.com' };
    mocks.rows.set(other.id, { ...other });
    const result = await bootstrapMobileUser(authUser());
    expect(result.created).toBe(true);
    expect(result.user.username).toMatch(/^pedro_jose_[a-f0-9]{8}$/);
    expect(result.user.username.length).toBeLessThanOrEqual(20);
    expect(mocks.rows.get(other.id)).toEqual(other);
    expect(mocks.trails).toHaveLength(9);
  });

  it('converges overlapping first logins on one profile and one set of trails', async () => {
    const results = await Promise.all([
      bootstrapMobileUser(authUser()),
      bootstrapMobileUser(authUser()),
      bootstrapMobileUser(authUser()),
    ]);
    expect(results.filter((result) => result.created)).toHaveLength(1);
    expect(new Set(results.map((result) => result.user.id)).size).toBe(1);
    expect(mocks.rows.size).toBe(1);
    expect(mocks.trails).toHaveLength(9);
  });

  it('does not link or overwrite a different identity with the same email', async () => {
    const other = { id: 'other', username: 'email_owner', email: authUser().email! };
    mocks.rows.set(other.id, { ...other });
    await expect(bootstrapMobileUser(authUser())).rejects.toMatchObject({
      code: 'ACCOUNT_EMAIL_CONFLICT',
      statusCode: 409,
    });
    expect(mocks.rows.size).toBe(1);
    expect(mocks.rows.get(other.id)).toEqual(other);
    expect(mocks.trails).toHaveLength(0);
  });

  it('rolls back profile creation when default trails fail', async () => {
    mocks.createMany.mockRejectedValueOnce(new Error('Trail insert failed'));
    await expect(bootstrapMobileUser(authUser())).rejects.toThrow('Trail insert failed');
    expect(mocks.rows.size).toBe(0);
    expect(mocks.trails).toHaveLength(0);
  });

  it('ignores provider identity in editable metadata and unsafe avatar URLs', async () => {
    await bootstrapMobileUser(
      authUser({
        app_metadata: { provider: 'google' },
        user_metadata: {
          username: 'a',
          provider: 'github',
          preferred_username: 'admin<script>alert(1)</script>',
          avatar_url: 'javascript:alert(1)',
        },
      })
    );
    const row = mocks.rows.get(authUser().id)!;
    expect(row.username).toMatch(/^[a-z0-9_]{3,20}$/);
    expect(row.github_username).toBeNull();
    expect(row.avatar_url).toMatch(/^https:\/\/api\.dicebear\.com\//);
    expect(row.bio).toContain('Google');
  });

  it('returns a recoverable error after bounded transaction conflicts', async () => {
    mocks.transaction.mockRejectedValue(
      Object.assign(new Error('Retry conflict'), { code: 'P2034' })
    );
    await expect(bootstrapMobileUser(authUser())).rejects.toMatchObject({
      code: 'ACCOUNT_BOOTSTRAP_BUSY',
      statusCode: 503,
    });
    expect(mocks.transaction).toHaveBeenCalledTimes(5);
    expect(mocks.rows.size).toBe(0);
  });

  it('requires email only for a new profile and never starts creation without it', async () => {
    await expect(bootstrapMobileUser(authUser({ email: undefined }))).rejects.toMatchObject({
      code: 'ACCOUNT_EMAIL_REQUIRED',
      statusCode: 400,
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('returns an explicit unavailable error without an application database connection', async () => {
    mocks.configured = false;
    await expect(bootstrapMobileUser(authUser())).rejects.toMatchObject({
      code: 'USER_DATA_NOT_CONFIGURED',
      statusCode: 503,
    });
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('keeps temporary database failures recoverable without leaking infrastructure details', async () => {
    mocks.findUnique.mockRejectedValueOnce(
      Object.assign(new Error('private database host connection reset'), { code: 'ECONNRESET' })
    );
    await expect(bootstrapMobileUser(authUser())).rejects.toMatchObject({
      code: 'USER_DATA_UNAVAILABLE',
      statusCode: 503,
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
