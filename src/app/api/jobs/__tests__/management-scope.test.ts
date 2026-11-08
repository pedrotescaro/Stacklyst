// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({
  user: null as null | { id: string; role: string },
  requireRole: vi.fn(),
  companies: vi.fn(),
  jobs: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({
  getAuthUser: () => mocks.user,
  requireAuth: vi.fn(),
  requireRole: mocks.requireRole,
}));
vi.mock('@/lib/prisma', () => ({ prisma: { company: { findMany: mocks.companies } } }));
vi.mock('@/services/job.service', () => ({ JobService: { listJobs: mocks.jobs } }));
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
import { GET as companies } from '../../companies/route';
import { GET as jobs, POST as createJob } from '../route';
const context = { params: Promise.resolve({}) };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { id: 'recruiter-owner', role: 'RECRUITER' };
  mocks.requireRole.mockImplementation(async (roles: string[]) => {
    if (!mocks.user) throw new AppError('UNAUTHORIZED', 'Autenticação necessária', 401);
    if (!roles.includes(mocks.user.role)) throw new AppError('FORBIDDEN', 'Acesso negado', 403);
    return mocks.user;
  });
  mocks.companies.mockResolvedValue([]);
  mocks.jobs.mockResolvedValue([]);
});

describe('Recruiter managed listings', () => {
  it.each(['level', 'modality', 'contract', 'status'])(
    'validates invalid %s before querying vacancies',
    async (parameter) => {
      const response = await jobs(
        new Request(`https://stacklyst.test/api/jobs?${parameter}=INVALID`),
        context
      );
      expect(response.status).toBe(400);
      expect(mocks.jobs).not.toHaveBeenCalled();
    }
  );
  it('scopes companies to the authenticated owner and ignores a forged owner query', async () => {
    const response = await companies(
      new Request('https://stacklyst.test/api/companies?mine=true&owner_id=another-owner'),
      context
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.companies).toHaveBeenCalledWith(
      expect.objectContaining({ where: { owner_id: 'recruiter-owner' } })
    );
  });

  it('combines a company filter with authenticated ownership for managed jobs', async () => {
    const response = await jobs(
      new Request(
        'https://stacklyst.test/api/jobs?mine=true&company_id=another-company&ownerId=another-owner&status=ALL'
      ),
      context
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.jobs).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 'recruiter-owner',
        companyId: 'another-company',
        status: 'ALL',
      })
    );
  });

  it('preserves the administrative view across companies', async () => {
    mocks.user = { id: 'admin', role: 'ADMIN' };
    await companies(new Request('https://stacklyst.test/api/companies?mine=true'), context);
    await jobs(new Request('https://stacklyst.test/api/jobs?mine=true&status=ALL'), context);
    expect(mocks.companies).toHaveBeenCalledWith(expect.objectContaining({ where: undefined }));
    expect(mocks.jobs).toHaveBeenCalledWith(expect.objectContaining({ ownerId: undefined }));
  });

  it('preserves public listings without requiring a recruiter account', async () => {
    mocks.user = null;
    await companies(new Request('https://stacklyst.test/api/companies'), context);
    await jobs(new Request('https://stacklyst.test/api/jobs'), context);
    expect(mocks.requireRole).not.toHaveBeenCalled();
    expect(mocks.companies).toHaveBeenCalledWith(expect.objectContaining({ where: undefined }));
    expect(mocks.jobs).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: undefined, status: 'OPEN' })
    );
  });

  it.each([
    ['anonymous', null, 401],
    ['developer', { id: 'dev', role: 'USER' }, 403],
  ] as const)('rejects %s managed requests before querying data', async (_label, user, status) => {
    mocks.user = user;
    expect(
      (await companies(new Request('https://stacklyst.test/api/companies?mine=true'), context))
        .status
    ).toBe(status);
    expect(
      (await jobs(new Request('https://stacklyst.test/api/jobs?mine=true'), context)).status
    ).toBe(status);
    expect(mocks.companies).not.toHaveBeenCalled();
    expect(mocks.jobs).not.toHaveBeenCalled();
  });
  it.each([5000.5, -100])(
    'rejects unsupported salary %s before a database write',
    async (salary) => {
      const request = new Request('https://stacklyst.test/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: 'company',
          title: 'React developer',
          description: 'Build accessible applications.',
          technologies: ['React'],
          salary_min: salary,
        }),
      });
      expect((await createJob(request, context)).status).toBe(400);
    }
  );
});
