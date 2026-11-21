import { describe, expect, it } from 'vitest';
import { getAuthReturnPath } from '../auth-redirect';

describe('Post-auth return paths', () => {
  it.each([
    undefined,
    null,
    '',
    'https://attacker.example',
    '//attacker.example',
    '/\\attacker.example',
    '/feed\n',
  ])('falls back to feed for unsafe or missing destination %j', (destination) =>
    expect(getAuthReturnPath(destination)).toBe('/feed')
  );
  it('preserves a local deep link including filters and fragment', () => {
    expect(getAuthReturnPath('/jobs?search=typescript#list')).toBe('/jobs?search=typescript#list');
  });
  it('normalizes the application root to the feed', () => {
    expect(getAuthReturnPath('/')).toBe('/feed');
  });
  it.each(['/login', '/register?next=/login', '/check-email', '/login/'])(
    'returns to feed instead of re-entering authentication: %s',
    (destination) => expect(getAuthReturnPath(destination)).toBe('/feed')
  );
  it('keeps password-recovery destinations available', () => {
    expect(getAuthReturnPath('/reset-password')).toBe('/reset-password');
  });
});
