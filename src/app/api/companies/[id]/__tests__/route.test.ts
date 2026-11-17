import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, PATCH } from '../route';
import { requireRole } from '@/lib/auth';
import { JobService } from '@/services/job.service';
import { AppError, ForbiddenError, UnauthorizedError } from '@/lib/errors';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({ id: 'recruiter-1' }),
  requireRole: vi.fn(),
}));
vi.mock('@/services/job.service', () => ({
  JobService: { updateCompany: vi.fn(), deleteCompany: vi.fn() },
}));

describe('/api/companies/[id]', () => {
  const recruiter = { id: 'recruiter-1', role: 'RECRUITER' };
  const context = { params: Promise.resolve({ id: 'comp-1' }) };
  const patch = (body: unknown) =>
    new Request('http://localhost/api/companies/comp-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  const remove = () => new Request('http://localhost/api/companies/comp-1', { method: 'DELETE' });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRole).mockResolvedValue(recruiter as any);
    vi.mocked(JobService.updateCompany).mockResolvedValue({ id: 'comp-1', name: 'Nova' } as any);
    vi.mocked(JobService.deleteCompany).mockResolvedValue({ success: true });
  });

  it('updates the company with the trimmed data of the request', async () => {
    const response = await PATCH(
      patch({ name: '  Nova Empresa ', website: '', location: 'Campinas', description: 'Sobre' }),
      context
    );

    expect(response.status).toBe(200);
    expect(requireRole).toHaveBeenCalledWith(['RECRUITER', 'ADMIN']);
    expect(JobService.updateCompany).toHaveBeenCalledWith('comp-1', recruiter, {
      name: 'Nova Empresa',
      website: '',
      location: 'Campinas',
      description: 'Sobre',
    });
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      company: { id: 'comp-1' },
    });
  });

  it.each([
    { name: 'A' },
    { name: 'Empresa', website: 'sem-protocolo' },
    { name: 'x'.repeat(101) },
  ])('rejects invalid company data %j', async (body) => {
    const response = await PATCH(patch(body), context);
    expect(response.status).toBe(400);
    expect(JobService.updateCompany).not.toHaveBeenCalled();
  });

  it('returns 403 when the user does not manage the company', async () => {
    vi.mocked(JobService.updateCompany).mockRejectedValueOnce(
      new ForbiddenError('FORBIDDEN', 'Você não gerencia esta empresa.')
    );
    const response = await PATCH(patch({ name: 'Nova Empresa' }), context);
    expect(response.status).toBe(403);
  });

  it('requires a recruiter or administrator session', async () => {
    vi.mocked(requireRole).mockRejectedValueOnce(new UnauthorizedError());
    const response = await DELETE(remove(), context);
    expect(response.status).toBe(401);
    expect(JobService.deleteCompany).not.toHaveBeenCalled();
  });

  it('deletes the company', async () => {
    const response = await DELETE(remove(), context);
    expect(response.status).toBe(200);
    expect(JobService.deleteCompany).toHaveBeenCalledWith('comp-1', recruiter);
  });

  it('returns 409 with the reason when the company still has openings', async () => {
    vi.mocked(JobService.deleteCompany).mockRejectedValueOnce(
      new AppError(
        'COMPANY_HAS_JOBS',
        'Esta empresa tem 2 vagas. Exclua as vagas antes de excluir a empresa.',
        409
      )
    );
    const response = await DELETE(remove(), context);
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: 'COMPANY_HAS_JOBS',
      message: 'Esta empresa tem 2 vagas. Exclua as vagas antes de excluir a empresa.',
    });
  });
});
