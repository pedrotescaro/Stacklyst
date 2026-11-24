import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { requireEnadeUser } from '@/lib/enade/hub.server';
import { importLegacyProgress } from '@/lib/enade/attempts.server';
import { redirect } from 'next/navigation';
import EnadeSimulationPage from './page';

vi.mock('@/lib/enade/hub.server', () => ({ requireEnadeUser: vi.fn() }));
vi.mock('@/lib/enade/attempts.server', () => ({ importLegacyProgress: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { enadeAttempt: { findFirst: vi.fn() } } }));
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
    vi.mocked(requireEnadeUser).mockResolvedValue({ id: 'student-1' } as never);
    vi.mocked(prisma.enadeAttempt.findFirst).mockResolvedValue(null);
  });
  it('imports legacy progress and redirects to the signed-in student’s edition attempt', async () => {
    vi.mocked(prisma.enadeAttempt.findFirst).mockResolvedValue({ id: 'previous-attempt' } as never);
    await expect(
      EnadeSimulationPage({ params: Promise.resolve({ year: '2021' }) })
    ).rejects.toThrow('redirect');
    expect(importLegacyProgress).toHaveBeenCalledWith('student-1');
    expect(prisma.enadeAttempt.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id: 'student-1',
          source_year: 2021,
          kind: 'STANDARD',
          status: { not: 'ABANDONED' },
        },
      })
    );
    expect(redirect).toHaveBeenCalledWith('/trails/enade/simulados/previous-attempt');
  });
  it('opens the simulations list for a known edition without a previous attempt', async () => {
    await expect(
      EnadeSimulationPage({ params: Promise.resolve({ year: '2021' }) })
    ).rejects.toThrow('redirect');
    expect(redirect).toHaveBeenCalledWith('/trails/enade/simulados');
  });
  it('requires login and rejects editions that do not exist', async () => {
    vi.mocked(requireEnadeUser).mockRejectedValueOnce(new Error('redirect'));
    await expect(
      EnadeSimulationPage({ params: Promise.resolve({ year: '2021' }) })
    ).rejects.toThrow('redirect');
    await expect(
      EnadeSimulationPage({ params: Promise.resolve({ year: '2024' }) })
    ).rejects.toThrow('notFound');
    expect(prisma.enadeAttempt.findFirst).not.toHaveBeenCalled();
  });
});
