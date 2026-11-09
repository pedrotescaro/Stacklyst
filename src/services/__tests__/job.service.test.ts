import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { JobService } from '@/services/job.service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    securityAuditEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (callback: any) => callback(prisma)),
    jobApplication: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    company: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/security-audit', () => ({ recordSecurityAudit: vi.fn() }));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('JobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listJobs', () => {
    it('keeps ownership restriction when a recruiter filters another company', async () => {
      vi.mocked(prisma.job.findMany).mockResolvedValueOnce([]);
      await JobService.listJobs({
        ownerId: 'owner',
        companyId: 'third-party-company',
        status: 'ALL',
        includeExpired: true,
      });
      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { company_id: 'third-party-company', company: { owner_id: 'owner' } },
        })
      );
    });

    it('filters by companyId and status ALL when specified', async () => {
      vi.mocked(prisma.job.findMany).mockResolvedValueOnce([
        { id: 'job-1', title: 'React Dev' } as any,
      ]);

      const jobs = await JobService.listJobs({
        companyId: 'comp-123',
        status: 'ALL',
        includeExpired: true,
      });

      expect(prisma.job.findMany).toHaveBeenCalledWith({
        where: {
          company_id: 'comp-123',
        },
        orderBy: { created_at: 'desc' },
        include: expect.objectContaining({
          _count: {
            select: { applications: true },
          },
        }),
      });
      expect(jobs).toHaveLength(1);
    });
  });

  describe('getJobApplications', () => {
    it('returns applications when requester is RECRUITER', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValueOnce({
        id: 'job-1',
        company_id: 'company-1',
        company: { owner_id: 'user-recruiter' },
      } as any);
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        id: 'company-1',
        owner_id: 'user-recruiter',
      } as any);

      vi.mocked(prisma.jobApplication.findMany).mockResolvedValueOnce([
        {
          id: 'app-1',
          user: { username: 'alice' },
          stage: { title: 'Inscrição' },
        } as any,
      ]);

      const applications = await JobService.getJobApplications(
        'job-1',
        'user-recruiter',
        'RECRUITER'
      );

      expect(prisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        include: { company: true },
      });

      expect(prisma.jobApplication.findMany).toHaveBeenCalledWith({
        where: { job_id: 'job-1' },
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              total_xp: true,
              bio: true,
              github_username: true,
            },
          },
          stage: true,
        },
      });

      expect(applications).toHaveLength(1);
    });

    it('throws error when job is not found', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValueOnce(null);

      await expect(
        JobService.getJobApplications('non-existent', 'user-1', 'RECRUITER')
      ).rejects.toThrow('Vaga não encontrada.');
    });

    it('throws error when user is not RECRUITER or ADMIN', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValueOnce({
        id: 'job-1',
        company: { owner_id: 'owner-1' },
      } as any);

      await expect(JobService.getJobApplications('job-1', 'user-regular', 'USER')).rejects.toThrow(
        'Acesso não autorizado às candidaturas desta vaga.'
      );
    });
  });
  describe('deleteJob', () => {
    it('throws ForbiddenError when user has USER role', async () => {
      await expect(JobService.deleteJob('job-1', { id: 'user-1', role: 'USER' })).rejects.toThrow(
        'Permissão insuficiente para excluir esta vaga.'
      );
    });

    it('throws NotFoundError when job does not exist', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValueOnce(null);

      await expect(
        JobService.deleteJob('non-existent', { id: 'recruiter-1', role: 'RECRUITER' })
      ).rejects.toThrow('Vaga não encontrada.');
    });

    it('throws ForbiddenError when recruiter does not own the company', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValueOnce({
        id: 'job-1',
        title: 'React Dev',
        company_id: 'comp-1',
        company: { id: 'comp-1', owner_id: 'other-recruiter' },
      } as any);
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        id: 'comp-1',
        owner_id: 'other-recruiter',
      } as any);

      await expect(
        JobService.deleteJob('job-1', { id: 'recruiter-1', role: 'RECRUITER' })
      ).rejects.toThrow('Você não gerencia esta empresa.');
    });

    it('deletes job successfully when actor is the company owner (RECRUITER)', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValueOnce({
        id: 'job-1',
        title: 'React Dev',
        company_id: 'comp-1',
        company: { id: 'comp-1', owner_id: 'recruiter-1' },
      } as any);
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        id: 'comp-1',
        owner_id: 'recruiter-1',
      } as any);
      vi.mocked(prisma.job.delete).mockResolvedValueOnce({ id: 'job-1' } as any);

      const result = await JobService.deleteJob('job-1', {
        id: 'recruiter-1',
        role: 'RECRUITER',
      });

      expect(result).toEqual({ success: true });
      expect(prisma.job.delete).toHaveBeenCalledWith({ where: { id: 'job-1' } });
    });

    it('deletes job successfully when actor is ADMIN even if not company owner', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValueOnce({
        id: 'job-1',
        title: 'React Dev',
        company_id: 'comp-1',
        company: { id: 'comp-1', owner_id: 'someone-else' },
      } as any);
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        id: 'comp-1',
        owner_id: 'someone-else',
      } as any);
      vi.mocked(prisma.job.delete).mockResolvedValueOnce({ id: 'job-1' } as any);

      const result = await JobService.deleteJob('job-1', {
        id: 'admin-1',
        role: 'ADMIN',
      });

      expect(result).toEqual({ success: true });
      expect(prisma.job.delete).toHaveBeenCalledWith({ where: { id: 'job-1' } });
    });
  });
});
