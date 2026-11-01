// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ read: vi.fn(), render: vi.fn(), verify: vi.fn() }));
vi.mock('@/lib/credentials/repository', () => ({ getPublicCredential: mocks.read }));
vi.mock('@/lib/credentials/pdf', () => ({ renderCredentialPdf: mocks.render }));
vi.mock('@/lib/credentials/integrity', () => ({ verifyCredentialIntegrity: mocks.verify }));
import { GET } from './route';
const id = '7633bb15-4d34-4af3-b5d8-40efaf57ce31';
const request = () =>
  GET(new Request(`https://untrusted.invalid/api/certificates/${id}/pdf`), {
    params: Promise.resolve({ id }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.verify.mockReturnValue(true);
  mocks.render.mockResolvedValue(new Uint8Array([37, 80, 68, 70]));
});
it('serves only the verified registry entry and uses a trusted QR origin', async () => {
  mocks.read.mockResolvedValue({ id, status: 'valid' });
  const response = await request();
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('application/pdf');
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(mocks.render.mock.calls[0][1]).not.toContain('untrusted.invalid');
});
it('does not render an absent, revoked or altered certificate', async () => {
  mocks.read.mockResolvedValue(null);
  expect((await request()).status).toBe(404);
  mocks.read.mockResolvedValue({ id, status: 'revoked' });
  expect((await request()).status).toBe(410);
  mocks.read.mockResolvedValue({ id, status: 'valid' });
  mocks.verify.mockReturnValue(false);
  expect((await request()).status).toBe(410);
  expect(mocks.render).not.toHaveBeenCalled();
});
