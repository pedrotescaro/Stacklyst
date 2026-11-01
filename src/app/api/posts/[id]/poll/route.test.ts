// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  result: vi.fn(),
  user: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn(), requireAuth: mocks.user }));
vi.mock('@/services/post-access.service', () => ({ assertPostAccess: mocks.access }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: async (callback: (tx: unknown) => unknown) =>
      callback({
        postPoll: { findUnique: mocks.find, findUniqueOrThrow: mocks.result },
        postPollVote: { create: mocks.create },
      }),
  },
}));
import { POST } from './route';
import { NotFoundError } from '@/lib/errors';

const request = (optionIndex: unknown) =>
  new Request('http://localhost/api/posts/post/poll', {
    method: 'POST',
    body: JSON.stringify({ optionIndex }),
  });
const context = { params: Promise.resolve({ id: 'post' }) };
describe('poll voting', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.user.mockResolvedValue({ id: 'viewer' });
    mocks.find.mockResolvedValue({
      id: 'poll',
      expires_at: new Date(Date.now() + 60000),
      options: [{ id: 'option-a' }, { id: 'option-b' }],
    });
    mocks.result.mockResolvedValue({
      id: 'poll',
      question: 'Which?',
      expires_at: new Date(Date.now() + 60000),
      options: [
        { id: 'option-a', text: 'A', _count: { votes: 0 } },
        { id: 'option-b', text: 'B', _count: { votes: 1 } },
      ],
      votes: [{ option_id: 'option-b' }],
    });
  });
  it('checks visibility and returns updated percentages inputs after a valid vote', async () => {
    const response = await POST(request(1), context);
    expect(response.status).toBe(200);
    expect(mocks.access).toHaveBeenCalledWith('post', 'viewer', expect.anything());
    expect(mocks.create).toHaveBeenCalledWith({
      data: { poll_id: 'poll', option_id: 'option-b', user_id: 'viewer' },
    });
    expect(await response.json()).toMatchObject({
      counts: [0, 1],
      totalVotes: 1,
      myVote: 1,
      closed: false,
    });
  });
  it('rejects inaccessible follower posts before loading the poll', async () => {
    mocks.access.mockRejectedValue(new NotFoundError('POST_NOT_FOUND', 'Post não encontrado.'));
    expect((await POST(request(0), context)).status).toBe(404);
    expect(mocks.find).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('rejects expired polls', async () => {
    mocks.find.mockResolvedValue({
      id: 'poll',
      expires_at: new Date(0),
      options: [{ id: 'a' }, { id: 'b' }],
    });
    expect((await POST(request(0), context)).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('rejects an option that is absent from this poll', async () => {
    expect((await POST(request(3), context)).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('enforces one vote per user with the database unique constraint', async () => {
    mocks.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.9.1',
      })
    );
    expect((await POST(request(0), context)).status).toBe(409);
  });
  it.each([-1, 0.5, '1', 4])('rejects malformed choice %s', async (choice) => {
    expect((await POST(request(choice), context)).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
