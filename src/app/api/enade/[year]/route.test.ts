import { beforeEach, describe, it, expect, vi } from 'vitest';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DELETE, PUT } from './route';
import type { EnadeAttempt } from '@/lib/enade/types';

vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    mobileState: {
      upsert: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));
const draft = {
  answers: { '2021-objective-1': 'E' },
  marked: [],
  startedAt: Date.now(),
  updatedAt: Date.now(),
  finishedAt: null,
};
function save(value: EnadeAttempt = draft, year = '2021') {
  return PUT(
    new Request(`http://localhost/api/enade/${year}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    }),
    { params: Promise.resolve({ year }) }
  );
}
describe('Enade draft persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'student-1' } as never);
  });
  it('saves only to the authenticated student and edition', async () => {
    expect((await save()).status).toBe(200);
    expect(prisma.mobileState.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id_key: { user_id: 'student-1', key: 'enade-ads-2021' } },
      })
    );
  });
  it('rejects unauthenticated requests and unknown exams', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await save()).status).toBe(401);
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'student-1' } as never);
    expect((await save(draft, '2024')).status).toBe(400);
    expect(prisma.mobileState.upsert).not.toHaveBeenCalled();
  });
  it('rejects questions from other editions and invalid alternatives', async () => {
    expect((await save({ ...draft, answers: { '2017-objective-1': 'A' } })).status).toBe(400);
    expect((await save({ ...draft, answers: { '2021-objective-1': 'Z' } })).status).toBe(400);
    expect(prisma.mobileState.upsert).not.toHaveBeenCalled();
  });
  it('reset deletes only this student attempt for that edition', async () => {
    const reset = (year: string) =>
      DELETE(new Request(`http://localhost/api/enade/${year}`, { method: 'DELETE' }), {
        params: Promise.resolve({ year }),
      });
    expect((await reset('2021')).status).toBe(200);
    expect(prisma.mobileState.deleteMany).toHaveBeenCalledWith({
      where: { user_id: 'student-1', key: 'enade-ads-2021' },
    });
    expect((await reset('2024')).status).toBe(400);
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await reset('2021')).status).toBe(401);
    expect(prisma.mobileState.deleteMany).toHaveBeenCalledTimes(1);
  });
});
