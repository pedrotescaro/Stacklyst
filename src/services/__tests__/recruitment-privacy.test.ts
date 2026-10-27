import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobService } from '../job.service';
import { NotificationService } from '../notification.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({ prisma: { $transaction: vi.fn() } }));
vi.mock('../notification.service', () => ({
  NotificationService: { create: vi.fn().mockResolvedValue({ id: 'notification' }) },
}));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), info: vi.fn() } }));

describe('recruitment updates', () => {
  beforeEach(() => vi.clearAllMocks());

  it('projects only public candidate fields and persists the requested stage and feedback', async () => {
    const databaseUser = {
      id: 'candidate',
      username: 'alice',
      avatar_url: null,
      total_xp: 30,
      bio: 'dev',
      github_username: 'alice',
      email: 'private@example.com',
      password_hash: 'secret',
      energy: 99,
      preferred_language: 'PY',
    };
    const tx = {
      jobApplication: {
        update: vi.fn(async (query: any) => ({
          id: 'app',
          job_id: 'job',
          user_id: 'candidate',
          stage_id: 'stage',
          ...query.data,
          user: Object.fromEntries(
            Object.keys(query.include.user.select).map((key) => [
              key,
              databaseUser[key as keyof typeof databaseUser],
            ])
          ),
          stage: { id: 'stage', title: 'Entrevista' },
        })),
      },
      securityAuditEvent: { create: vi.fn().mockResolvedValue({ id: 'audit' }) },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (run: any) => run(tx));
    const result = await JobService.updateApplicationStage({
      applicationId: 'app',
      stageId: 'stage',
      status: 'INTERVIEW',
      feedback: 'Vamos conversar.',
      actorId: 'recruiter',
    });
    expect(result.user).toEqual({
      id: 'candidate',
      username: 'alice',
      avatar_url: null,
      total_xp: 30,
      bio: 'dev',
      github_username: 'alice',
    });
    expect(JSON.stringify(result)).not.toContain('private@example.com');
    expect(JSON.stringify(result)).not.toContain('password_hash');
    expect(tx.jobApplication.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stage_id: 'stage',
          status: 'INTERVIEW',
          feedback: 'Vamos conversar.',
        }),
      })
    );
    expect(NotificationService.create).toHaveBeenCalledWith({
      userId: 'candidate',
      type: 'JOB_APPLICATION_UPDATE',
      resourceId: 'job',
      resourceType: 'JOB',
    });
    expect(tx.securityAuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ actor_id: 'recruiter', action: 'JOB_APPLICATION_UPDATED' }),
      })
    );
  });
});
