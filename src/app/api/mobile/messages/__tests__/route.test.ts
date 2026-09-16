// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findUniqueOrThrow: vi.fn(),
  create: vi.fn(),
  receiver: vi.fn(),
  notify: vi.fn(),
  rateLimit: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({
  getAuthUser: async () => ({ id: 'sender' }),
  requireAuth: async () => ({ id: 'sender' }),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    message: {
      findUnique: mocks.findUnique,
      findUniqueOrThrow: mocks.findUniqueOrThrow,
      create: mocks.create,
    },
    user: { findUnique: mocks.receiver },
  },
}));
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: mocks.rateLimit }));
vi.mock('@/services/notification.service', () => ({
  NotificationService: { create: mocks.notify },
}));
import { POST } from '../route';

const input = {
  receiver_id: '11111111-1111-4111-8111-111111111111',
  client_id: '22222222-2222-4222-8222-222222222222',
  content: 'Olá',
};
const persisted = { ...input, id: 'message-id', sender_id: 'sender' };
const context = { params: Promise.resolve({}) };
const request = (value = input) =>
  new Request('https://stacklyst.test/api/mobile/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });

describe('mobile message durable idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUnique.mockResolvedValue(null);
    mocks.receiver.mockResolvedValue({ id: input.receiver_id });
    mocks.notify.mockResolvedValue({});
  });

  it('returns an existing sender attempt without creating another notification', async () => {
    mocks.findUnique.mockResolvedValue(persisted);
    const response = await POST(request(), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(persisted);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { sender_id_client_id: { sender_id: 'sender', client_id: input.client_id } },
    });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it('uses the unique database constraint to converge concurrent deliveries', async () => {
    let winner: unknown;
    mocks.create.mockImplementation(async () => {
      if (winner) throw Object.assign(new Error('Duplicate'), { code: 'P2002' });
      winner = persisted;
      return winner;
    });
    mocks.findUniqueOrThrow.mockResolvedValue(persisted);
    const responses = await Promise.all([POST(request(), context), POST(request(), context)]);
    expect(responses.map((r) => r.status)).toEqual([201, 200]);
    expect(await responses[0].json()).toEqual(await responses[1].json());
    expect(mocks.notify).toHaveBeenCalledOnce();
  });

  it.each([
    { ...input, content: 'Changed' },
    { ...input, receiver_id: '33333333-3333-4333-8333-333333333333' },
  ])('rejects reused attempts with a different payload %j', async (value) => {
    mocks.findUnique.mockResolvedValue(persisted);
    const response = await POST(request(value), context);
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ error: 'IDEMPOTENCY_CONFLICT' });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it('rejects a conflicting payload even when the duplicate is discovered during create', async () => {
    mocks.create.mockRejectedValue(Object.assign(new Error('Duplicate'), { code: 'P2002' }));
    mocks.findUniqueOrThrow.mockResolvedValue({ ...persisted, content: 'Another payload' });
    const response = await POST(request(), context);
    expect(response.status).toBe(409);
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it('returns not found for a deleted recipient before trying to persist', async () => {
    mocks.receiver.mockResolvedValue(null);
    const response = await POST(request(), context);
    expect(response.status).toBe(404);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
