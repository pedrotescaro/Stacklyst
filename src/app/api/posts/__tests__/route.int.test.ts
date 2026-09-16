import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { XpService } from '@/services/xp.service';

vi.mock('@/lib/auth', () => {
  const getAuthUser = vi.fn();
  return {
    getAuthUser,
    requireAuth: vi.fn(async () => {
      const user = await getAuthUser();
      if (!user) {
        const { UnauthorizedError } = await import('@/lib/errors');
        throw new UnauthorizedError('Não autorizado', 'Autenticação necessária');
      }
      return user;
    }),
  };
});

vi.mock('@/lib/prisma', () => {
  const mockPrismaClient = {
    post: {
      create: vi.fn(),
    },
    quiz: {
      create: vi.fn(),
    },
    user: {
      findMany: vi.fn(() => Promise.resolve([])),
      findUnique: vi.fn(() => Promise.resolve({ total_xp: 0 })),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockPrismaClient)),
  };
  return {
    prisma: mockPrismaClient,
  };
});

vi.mock('@/services/xp.service', () => ({
  XpService: {
    awardXP: vi.fn(() =>
      Promise.resolve({
        xpEarned: 10,
        newXp: 100,
        newLevel: 1,
      })
    ),
    awardXPInTransaction: vi.fn(() =>
      Promise.resolve({
        xpEarned: 10,
        newXp: 100,
        newLevel: 1,
      })
    ),
  },
  calculateLevel: vi.fn(() => ({ level: 1 })),
}));

describe('POST /api/posts integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthenticated request', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Valid Title',
        body: 'This is a valid body with more than 10 characters.',
      }),
    });

    const response = await POST(request, { params: Promise.resolve({}) });
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Não autorizado');
  });

  it('should create a post and award XP for authenticated users', async () => {
    const mockUser = { id: 'user-123', username: 'testuser' };
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as any);

    const createdPostMock = {
      id: 'post-123',
      title: 'Valid Title',
      body: 'This is a valid body with more than 10 characters.',
      language: 'TS',
    };
    vi.mocked(prisma.post.create).mockResolvedValue(createdPostMock as any);
    vi.mocked(prisma.quiz.create).mockResolvedValue({ id: 'quiz-123' } as any);

    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Valid Title',
        body: 'This is a valid body with more than 10 characters.',
        language: 'TS',
      }),
    });

    const response = await POST(request, { params: Promise.resolve({}) });
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.post.id).toBe('post-123');
    expect(XpService.awardXPInTransaction).toHaveBeenCalledWith(
      expect.anything(),
      'user-123',
      'TS',
      10
    );
  });

  it('should deduplicate posts when idempotency key is provided', async () => {
    const mockUser = { id: 'user-123', username: 'testuser' };
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as any);

    const existingPostMock = {
      id: 'post-existing',
      title: 'Existing Title',
      body: 'This is an existing body.',
      client_id: 'client-key-1',
    };
    (prisma.post as any).findFirst = vi.fn().mockResolvedValue(existingPostMock);

    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: {
        'x-idempotency-key': 'client-key-1',
      },
      body: JSON.stringify({
        title: 'Valid Title',
        body: 'This is a valid body with more than 10 characters.',
      }),
    });

    const response = await POST(request, { params: Promise.resolve({}) });
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.post.id).toBe('post-existing');
    expect(XpService.awardXPInTransaction).not.toHaveBeenCalled();
  });
});
