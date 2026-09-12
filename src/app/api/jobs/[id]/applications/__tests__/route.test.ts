import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../route';
import { requireRole } from '@/lib/auth';
import { JobService } from '@/services/job.service';

vi.mock('@/lib/auth', () => ({
  requireRole: vi.fn(),
  getAuthUser: vi.fn(async () => null),
}));

vi.mock('@/services/job.service', () => ({
  JobService: {
    getJobApplications: vi.fn(),
  },
}));

describe('GET /api/jobs/[id]/applications', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns job applications for authenticated recruiter', async () => {
    vi.mocked(requireRole).mockResolvedValueOnce({
      id: 'recruiter-1',
      role: 'RECRUITER',
    } as any);

    vi.mocked(JobService.getJobApplications).mockResolvedValueOnce([
      {
        id: 'app-1',
        user_id: 'user-1',
        job_id: 'job-1',
        status: 'APPLIED',
      } as any,
    ]);

    const request = new Request('http://localhost:3000/api/jobs/job-1/applications');
    const response = await GET(request, { params: Promise.resolve({ id: 'job-1' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveLength(1);
    expect(JobService.getJobApplications).toHaveBeenCalledWith('job-1', 'recruiter-1', 'RECRUITER');
  });
});
