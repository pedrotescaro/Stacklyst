import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from '../notification.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: { findMany: vi.fn() },
    job: { findMany: vi.fn() },
  },
}));

describe('job application notifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('identifies the vacancy and company and links to candidate feedback with one batched lookup', async () => {
    vi.mocked(prisma.notification.findMany).mockResolvedValue(
      Array.from({ length: 10 }, (_, index) => ({
        id: `notice-${index}`,
        userId: 'candidate',
        type: 'JOB_APPLICATION_UPDATE',
        resourceType: 'JOB',
        resourceId: 'job-1',
        actor: null,
        read: false,
        createdAt: new Date('2026-10-27'),
      })) as any
    );
    vi.mocked(prisma.job.findMany).mockResolvedValue([
      {
        id: 'job-1',
        title: 'Frontend React',
        company: { name: 'Acme' },
        applications: [{ status: 'INTERVIEW', stage: { title: 'Entrevista técnica' } }],
      },
    ] as any);
    const result = await NotificationService.getUserNotifications('candidate');
    expect(result.items[0]).toMatchObject({
      title: 'Candidatura: Frontend React',
      link: '/jobs/job-1#application',
    });
    expect(result.items[0].content).toContain('Acme');
    expect(result.items[0].content).toContain('Entrevista técnica');
    expect(prisma.job.findMany).toHaveBeenCalledOnce();
    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['job-1'] } },
        select: expect.objectContaining({
          applications: expect.objectContaining({ where: { user_id: 'candidate' }, take: 1 }),
        }),
      })
    );
  });

  it('uses the jobs list when the referenced vacancy has been deleted', async () => {
    vi.mocked(prisma.notification.findMany).mockResolvedValue([
      {
        id: 'notice',
        userId: 'candidate',
        type: 'JOB_APPLICATION_UPDATE',
        resourceType: 'JOB',
        resourceId: 'gone',
        actor: null,
        read: false,
        createdAt: new Date(),
      },
    ] as any);
    vi.mocked(prisma.job.findMany).mockResolvedValue([]);
    const result = await NotificationService.getUserNotifications('candidate');
    expect(result.items[0].link).toBe('/jobs');
    expect(result.items[0].content).toContain('removida');
  });
});
