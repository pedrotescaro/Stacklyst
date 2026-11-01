import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), collection: vi.fn(), certificate: vi.fn() }));
vi.mock('@/lib/auth', () => ({ requireAuth: mocks.auth, getAuthUser: mocks.auth }));
vi.mock('@/lib/credentials/repository', () => ({
  getCredentialCollection: mocks.collection,
  getPublicCredential: mocks.certificate,
}));
import { GET as collection } from './route';
import { GET as publicCertificate } from './[id]/route';
import { UnauthorizedError } from '@/lib/errors';
const context = { params: Promise.resolve({}) };
const request = new Request('https://stacklyst.test/api/certificates');

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ id: 'verified-owner' });
  mocks.collection.mockResolvedValue({ items: [], earnedCount: 0 });
  mocks.certificate.mockResolvedValue(null);
});
describe('certificate API ownership and verification', () => {
  it('uses only the authenticated owner for reconciliation', async () => {
    const result = await collection(
      new Request('https://stacklyst.test/api/certificates?userId=another-user'),
      context
    );
    expect(result.status).toBe(200);
    expect(mocks.collection).toHaveBeenCalledExactlyOnceWith('verified-owner');
    expect(result.headers.get('cache-control')).toBe('private, no-store');
  });
  it('does not reconcile unauthenticated requests', async () => {
    mocks.auth.mockRejectedValue(new UnauthorizedError());
    expect((await collection(request, context)).status).toBe(401);
    expect(mocks.collection).not.toHaveBeenCalled();
  });
  it('verifies a public certificate without resolving a user session or issuing grants', async () => {
    const record = { id: 'certificate', status: 'revoked', recipientName: 'Public name' };
    mocks.certificate.mockResolvedValue(record);
    const result = await publicCertificate(request, {
      params: Promise.resolve({ id: 'certificate' }),
    });
    expect(await result.json()).toEqual(record);
    expect(mocks.auth).not.toHaveBeenCalled();
    expect(mocks.collection).not.toHaveBeenCalled();
    expect(result.headers.get('cache-control')).toBe('no-store');
  });
  it('returns not-found for an unknown or invalid registry record', async () => {
    expect(
      (await publicCertificate(request, { params: Promise.resolve({ id: 'unknown' }) })).status
    ).toBe(404);
  });
});
