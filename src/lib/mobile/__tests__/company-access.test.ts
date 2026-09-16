// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { company: { findUnique: mocks.findUnique } } }));
import { requireCompanyAccess } from '../company-access';

describe('mobile company management authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUnique.mockResolvedValue({ id: 'company', owner_id: 'owner' });
  });
  it('allows the recruiter who owns the company', async () => {
    await expect(
      requireCompanyAccess('company', { id: 'owner', role: 'RECRUITER' })
    ).resolves.toMatchObject({ id: 'company' });
  });
  it('allows administrators', async () => {
    await expect(
      requireCompanyAccess('company', { id: 'admin', role: 'ADMIN' })
    ).resolves.toMatchObject({ id: 'company' });
  });
  it.each([
    { id: 'outsider', role: 'RECRUITER' },
    { id: 'owner', role: 'USER' },
    { id: 'owner', role: 'EVALUATOR' },
  ])('denies unauthorized management by %j', async (user) => {
    await expect(requireCompanyAccess('company', user)).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  });
  it('returns not found for missing companies', async () => {
    mocks.findUnique.mockResolvedValue(null);
    await expect(
      requireCompanyAccess('missing', { id: 'owner', role: 'ADMIN' })
    ).rejects.toMatchObject({ code: 'COMPANY_NOT_FOUND', statusCode: 404 });
  });
});
