/** Keep post-auth navigation on this site, including deep-link queries/fragments. */
export function getAuthReturnPath(next: unknown): string {
  if (
    typeof next !== 'string' ||
    !next.startsWith('/') ||
    next.startsWith('//') ||
    /[\\\u0000-\u001f\u007f]/.test(next)
  ) {
    return '/feed';
  }

  const origin = 'https://stacklyst.local';
  const destination = new URL(next, origin);
  if (destination.origin !== origin) return '/feed';
  if (['/login', '/register', '/check-email'].includes(destination.pathname.replace(/\/+$/, ''))) {
    return '/feed';
  }
  const pathname = destination.pathname === '/' ? '/feed' : destination.pathname;
  return `${pathname}${destination.search}${destination.hash}`;
}
