import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as byId } from '@/app/api/guilds/[id]/route';
import { GET as bySlug } from '@/app/api/guilds/by-slug/[slug]/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(async () => ({ id: 'viewer' })),
  requireAuth: vi.fn(async () => ({ id: 'viewer' })),
}));
vi.mock('@/lib/prisma', () => ({ prisma: { guild: { findUnique: vi.fn() } } }));

describe.each([
  ['id', byId],
  ['slug', bySlug],
] as const)('guild lookup by %s', (_, handler) => {
  beforeEach(() => vi.clearAllMocks());
  const request = new Request('https://stacklyst.test/api/guilds/private');
  const context = { params: Promise.resolve({ id: 'private', slug: 'private' }) };
  const guild = {
    id: 'private',
    owner_id: 'owner',
    is_public: false,
    members: [],
    created_at: new Date(),
    _count: { members: 0 },
  };
  it('hides private guild details from non-members', async () => {
    vi.mocked(prisma.guild.findUnique).mockResolvedValue(guild as never);
    const response = await handler(request, context);
    expect(response.status).toBe(404);
    expect(await response.json()).not.toHaveProperty('members');
  });
  it.each([
    { is_public: true },
    { owner_id: 'viewer' },
    { members: [{ user_id: 'viewer', role: 'MEMBER', joined_at: new Date() }] },
  ])('allows a public guild, its owner, or a member: %j', async (access) => {
    vi.mocked(prisma.guild.findUnique).mockResolvedValue({ ...guild, ...access } as never);
    expect((await handler(request, context)).status).toBe(200);
  });
});
