import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EnadeSimulationPage from './page';
import { EnadeSimulation } from '../EnadeSimulation';

vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { mobileState: { findUnique: vi.fn() } } }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('redirect');
  }),
  notFound: vi.fn(() => {
    throw new Error('notFound');
  }),
}));
describe('Standalone Enade route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'student-1' } as never);
    vi.mocked(prisma.mobileState.findUnique).mockResolvedValue(null);
  });
  it('loads only the signed-in student’s edition and renders the activity directly', async () => {
    const result = await EnadeSimulationPage({ params: Promise.resolve({ year: '2021' }) });
    expect(result.type).toBe(EnadeSimulation);
    expect(result.props).toEqual({ userId: 'student-1', year: 2021, initialAttempt: undefined });
    expect(prisma.mobileState.findUnique).toHaveBeenCalledWith({
      where: { user_id_key: { user_id: 'student-1', key: 'enade-ads-2021' } },
      select: { value: true },
    });
  });
  it('requires login and rejects editions that do not exist', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    await expect(
      EnadeSimulationPage({ params: Promise.resolve({ year: '2021' }) })
    ).rejects.toThrow('redirect');
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'student-1' } as never);
    await expect(
      EnadeSimulationPage({ params: Promise.resolve({ year: '2024' }) })
    ).rejects.toThrow('notFound');
    expect(prisma.mobileState.findUnique).not.toHaveBeenCalled();
  });
});
