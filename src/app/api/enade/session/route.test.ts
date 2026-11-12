import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createSession,
  DEFAULT_CONFIG,
  WORKSPACE_KEY,
  type EnadeWorkspace,
} from '@/lib/enade/simulator';
import { GET, PUT } from './route';
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: { mobileState: { findUnique: vi.fn(), updateMany: vi.fn(), create: vi.fn() } },
}));
const stamp = 1800000000000;
const config = { ...DEFAULT_CONFIG, years: [2021], questionCount: 10 };
const value: EnadeWorkspace = {
  version: 1,
  config,
  session: createSession(config, 123, stamp),
  updatedAt: stamp,
};
const context = { params: Promise.resolve({}) };
const request = (body: unknown) =>
  new Request('http://localhost/api/enade/session', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAuthUser).mockResolvedValue({ id: 'student-1' } as never);
  vi.mocked(prisma.mobileState.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.mobileState.updateMany).mockResolvedValue({ count: 1 });
  vi.mocked(prisma.mobileState.create).mockResolvedValue({} as never);
});
describe('Enade configurable session persistence', () => {
  it('stores and reads only the authenticated user workspace', async () => {
    expect((await PUT(request(value), context)).status).toBe(200);
    expect(prisma.mobileState.create).toHaveBeenCalledWith({
      data: { user_id: 'student-1', key: WORKSPACE_KEY, value },
    });
    expect((await GET(new Request('http://localhost/api/enade/session'), context)).status).toBe(
      200
    );
    expect(prisma.mobileState.findUnique).toHaveBeenLastCalledWith({
      where: { user_id_key: { user_id: 'student-1', key: WORKSPACE_KEY } },
    });
  });
  it('rejects unauthenticated and malformed sessions', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await PUT(request(value), context)).status).toBe(401);
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'student-1' } as never);
    expect(
      (await PUT(request({ ...value, config: { ...config, questionCount: 500 } }), context)).status
    ).toBe(400);
    expect(
      (
        await PUT(
          request({
            ...value,
            session: { ...value.session, answers: { '2008-objective-1': 'A' } },
          }),
          context
        )
      ).status
    ).toBe(400);
    expect(
      (await PUT(request({ ...value, session: { ...value.session, optionOrder: {} } }), context))
        .status
    ).toBe(400);
    expect(prisma.mobileState.create).not.toHaveBeenCalled();
  });
  it('keeps newer remote drafts and uses an optimistic version when updating', async () => {
    const newer = { ...value, updatedAt: stamp + 1000 };
    vi.mocked(prisma.mobileState.findUnique).mockResolvedValue({
      value: newer,
      version: 4,
    } as never);
    const response = await PUT(request(value), context);
    expect(await response.json()).toEqual({ value: newer, newer: true });
    expect(prisma.mobileState.updateMany).not.toHaveBeenCalled();
    vi.mocked(prisma.mobileState.findUnique).mockResolvedValue({ value, version: 4 } as never);
    expect((await PUT(request(newer), context)).status).toBe(200);
    expect(prisma.mobileState.updateMany).toHaveBeenCalledWith({
      where: { user_id: 'student-1', key: WORKSPACE_KEY, version: 4 },
      data: { value: newer, version: { increment: 1 } },
    });
    vi.mocked(prisma.mobileState.updateMany).mockResolvedValue({ count: 0 });
    expect((await PUT(request(newer), context)).status).toBe(409);
  });
});
