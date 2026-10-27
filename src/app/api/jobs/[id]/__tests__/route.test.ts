import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from '../route';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { requireCompanyAccess } from '@/lib/mobile/company-access';
import { JobService } from '@/services/job.service';
import { ForbiddenError } from '@/lib/errors';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({ id: 'recruiter' }),
  requireRole: vi.fn(),
}));
vi.mock('@/lib/mobile/company-access', () => ({ requireCompanyAccess: vi.fn() }));
vi.mock('@/services/job.service', () => ({ JobService: { updateApplicationStage: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    job: { findUniqueOrThrow: vi.fn() },
    jobApplication: { findFirst: vi.fn() },
    jobRecruitmentStage: { findFirst: vi.fn() },
  },
}));

describe('recruiter update authorization and validation', () => {
  const context = { params: Promise.resolve({ id: 'job-1' }) };
  const request = (body: unknown) =>
    new Request('http://localhost/api/jobs/job-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRole).mockResolvedValue({ id: 'recruiter', role: 'RECRUITER' } as any);
    vi.mocked(prisma.job.findUniqueOrThrow).mockResolvedValue({
      id: 'job-1',
      company_id: 'company',
    } as any);
    vi.mocked(prisma.jobApplication.findFirst).mockResolvedValue({ id: 'app-1' } as any);
    vi.mocked(prisma.jobRecruitmentStage.findFirst).mockResolvedValue({ id: 'stage-1' } as any);
    vi.mocked(requireCompanyAccess).mockResolvedValue({ id: 'company' } as any);
    vi.mocked(JobService.updateApplicationStage).mockResolvedValue({ id: 'app-1' } as any);
  });

  it('checks company ownership before changing a candidate', async () => {
    vi.mocked(requireCompanyAccess).mockRejectedValueOnce(new ForbiddenError());
    const response = await PATCH(
      request({ application_id: 'app-1', status: 'INTERVIEW' }),
      context
    );
    expect(response.status).toBe(403);
    expect(JobService.updateApplicationStage).not.toHaveBeenCalled();
  });

  it('rejects applications belonging to another vacancy', async () => {
    vi.mocked(prisma.jobApplication.findFirst).mockResolvedValueOnce(null);
    const response = await PATCH(
      request({ application_id: 'foreign-app', status: 'INTERVIEW' }),
      context
    );
    expect(response.status).toBe(404);
    expect(prisma.jobApplication.findFirst).toHaveBeenCalledWith({
      where: { id: 'foreign-app', job_id: 'job-1' },
    });
    expect(JobService.updateApplicationStage).not.toHaveBeenCalled();
  });

  it('rejects a stage outside the vacancy', async () => {
    vi.mocked(prisma.jobRecruitmentStage.findFirst).mockResolvedValueOnce(null);
    const response = await PATCH(
      request({ application_id: 'app-1', stage_id: 'foreign-stage', status: 'INTERVIEW' }),
      context
    );
    expect(response.status).toBe(400);
    expect(JobService.updateApplicationStage).not.toHaveBeenCalled();
  });

  it.each([{ stage_id: '' }, { technical_score: 101 }, { feedback: 'x'.repeat(5001) }])(
    'rejects invalid stage, score or feedback %j',
    async (invalid) => {
      const response = await PATCH(
        request({ application_id: 'app-1', status: 'INTERVIEW', ...invalid }),
        context
      );
      expect(response.status).toBe(400);
      expect(JobService.updateApplicationStage).not.toHaveBeenCalled();
    }
  );

  it('forwards the authenticated actor and validated stage and feedback', async () => {
    const response = await PATCH(
      request({
        application_id: 'app-1',
        stage_id: 'stage-1',
        status: 'INTERVIEW',
        feedback: 'Próxima etapa confirmada.',
      }),
      context
    );
    expect(response.status).toBe(200);
    expect(JobService.updateApplicationStage).toHaveBeenCalledWith({
      applicationId: 'app-1',
      stageId: 'stage-1',
      status: 'INTERVIEW',
      feedback: 'Próxima etapa confirmada.',
      technicalScore: undefined,
      actorId: 'recruiter',
    });
  });
});
