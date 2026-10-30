// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  userBlock: { findFirst: vi.fn() },
  message: { create: vi.fn() },
  post: { findUnique: vi.fn() },
  answer: { create: vi.fn() },
  postVote: { upsert: vi.fn() },
  bookmark: { findFirst: vi.fn() },
  user: { findUnique: vi.fn() },
}));
vi.mock('@/lib/auth', () => ({
  getAuthUser: async () => ({ id: '11111111-1111-4111-8111-111111111111' }),
  requireAuth: async () => ({ id: '11111111-1111-4111-8111-111111111111' }),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: { ...mocks, $transaction: (fn: (tx: unknown) => unknown) => fn(mocks) },
}));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: vi.fn() }));
import { POST as sendMessage } from '../../messages/route';
import { POST as sendMobileMessage } from '../../mobile/messages/route';
import { POST as reply } from '../../posts/[id]/answer/route';
import { POST as vote } from '../../posts/[id]/vote/route';
import { POST as bookmark } from '../../posts/[id]/bookmark/route';
import { FollowService } from '@/services/follow.service';
import { DuelService } from '@/services/duel.service';

describe('blocking is enforced before social writes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userBlock.findFirst.mockResolvedValue({ blockerId: 'other' });
    mocks.post.findUnique.mockResolvedValue({ id: 'post', author_id: 'other' });
  });

  it.each([
    ['message', sendMessage, { receiver_id: 'other', content: 'hello' }],
    [
      'mobile message',
      sendMobileMessage,
      {
        receiver_id: '22222222-2222-4222-8222-222222222222',
        client_id: '33333333-3333-4333-8333-333333333333',
        content: 'hello',
      },
    ],
    ['reply', reply, { body: 'A reply that must not be created' }],
    ['vote', vote, { value: 1 }],
    ['bookmark', bookmark, {}],
  ] as const)(
    'returns 403 for a blocked %s even through a direct API call',
    async (_name, handler, body) => {
      const response = await handler(
        new Request('https://stacklyst.test/api/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
        { params: Promise.resolve({ id: 'post' }) }
      );
      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({ error: 'USER_BLOCKED' });
      expect(mocks.message.create).not.toHaveBeenCalled();
      expect(mocks.answer.create).not.toHaveBeenCalled();
      expect(mocks.postVote.upsert).not.toHaveBeenCalled();
      expect(mocks.bookmark.findFirst).not.toHaveBeenCalled();
    }
  );

  it('refuses follow and duel invitations from either side', async () => {
    await expect(FollowService.toggleFollow('me', 'other')).rejects.toMatchObject({
      code: 'USER_BLOCKED',
    });
    await expect(DuelService.createDuelRequest('me', 'other')).rejects.toMatchObject({
      code: 'USER_BLOCKED',
    });
    expect(mocks.user.findUnique).not.toHaveBeenCalled();
  });
});
