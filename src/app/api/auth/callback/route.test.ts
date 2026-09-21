import { describe, expect, it, vi } from 'vitest';
import { GET } from './route';
vi.mock('@/lib/prisma', () => ({ hasDatabaseConnection: () => false, prisma: {} }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/jwt', () => ({ signJwt: vi.fn(), setJwtCookie: vi.fn() }));
describe('OAuth redirect destination', () => {
  it.each([
    '@attacker.example',
    '//attacker.example',
    '/\\attacker.example',
    'https://attacker.example',
    ':8443',
    '\n@attacker.example',
  ])('rejects %j', async (next) => {
    const response = await GET(
      new Request(`https://stacklyst.test/api/auth/callback?next=${encodeURIComponent(next)}`)
    );
    expect(response.headers.get('location')).toBe('https://stacklyst.test/feed');
  });
  it('retains local paths, queries and fragments', async () => {
    const response = await GET(
      new Request(
        'https://stacklyst.test/api/auth/callback?next=' +
          encodeURIComponent('/jobs?search=ts#list')
      )
    );
    expect(response.headers.get('location')).toBe('https://stacklyst.test/jobs?search=ts#list');
  });
});
