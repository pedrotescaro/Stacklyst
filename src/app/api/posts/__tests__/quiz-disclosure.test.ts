import { beforeEach, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/posts/[id]/route';
import { PostService } from '@/services/post.service';
import { prisma } from '@/lib/prisma';
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn(async () => null) }));
vi.mock('@/lib/prisma', () => ({ prisma: { post: { update: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() } } }));
const post = { id: 'p', created_at: new Date(), quizzes: [{ id: 'q', correct_index: 1, attempts: [] }] };
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.post.findUnique).mockResolvedValue(post as never);
  vi.mocked(prisma.post.findMany).mockResolvedValue([post] as never);
});
it('does not expose the answer through post details', async () => {
  const response = await GET(new Request('https://stacklyst.test/api/posts/p'), { params: Promise.resolve({ id: 'p' }) });
  expect(response.status).toBe(200);
  expect((await response.json()).quizzes[0]).not.toHaveProperty('correct_index');
});
it('does not expose the answer through the feed service', async () => {
  const result = await PostService.getFeed(null, {});
  expect(result.items[0].quizzes[0]).not.toHaveProperty('correct_index');
});
