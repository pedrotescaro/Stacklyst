import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ findMany: vi.fn(), count: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { post: mocks } }));
vi.mock('@/services/xp.service', () => ({ XpService: {}, calculateLevel: vi.fn() }));
vi.mock('@/services/notification.service', () => ({ NotificationService: {} }));
import { PostService } from '../post.service';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.findMany.mockResolvedValue([]);
  mocks.count.mockResolvedValue(0);
});
describe('Feed language preferences', () => {
  it('applies chosen languages before pagination, including new-post counts', async () => {
    await PostService.getFeed('user', { languages: ['JS', 'PYTHON'], limit: 10 });
    expect(mocks.findMany.mock.calls[0][0].where.AND[0].language).toEqual({ in: ['JS', 'PYTHON'] });
    expect(mocks.findMany.mock.calls[0][0].take).toBe(11);
    await PostService.countNewer('user', { after: new Date(), languages: ['JS', 'PYTHON'] });
    expect(mocks.count.mock.calls[0][0].where.AND[0].language).toEqual({ in: ['JS', 'PYTHON'] });
  });
  it('keeps following feed about people and respects explicit language filters elsewhere', async () => {
    await PostService.getFeed('user', { filter: 'following', languages: ['TS'] });
    expect(mocks.findMany.mock.calls[0][0].where.AND[0].language).toBeUndefined();
    expect(mocks.findMany.mock.calls[0][0].where.AND[0].author).toEqual({
      followers: { some: { followerId: 'user' } },
    });
    await PostService.getFeed('user', { language: 'JAVA', languages: ['TS'] });
    expect(mocks.findMany.mock.calls[1][0].where.AND[0].language).toBe('JAVA');
  });
});
