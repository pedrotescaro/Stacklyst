export function safeRoute(path: string | undefined) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || /[\\\u0000-\u001f]/.test(path))
    return '/';
  try {
    const parsed = new URL(path, 'https://stacklyst.invalid');
    const allowed =
      /^\/(?:$|(?:post|profile|lesson|knowledge|exercise|duel|conversation|events|jobs|communities|company|recruitment|evaluation)\/[a-zA-Z0-9_-]+$|(?:learn|practice|duels|profile|events|jobs|communities|notifications|messages|explore|ranking|settings|bookmarks|applications|onboarding|edit-profile|compose|evaluator|recruiter|admin)$)/;
    return parsed.origin === 'https://stacklyst.invalid' && allowed.test(parsed.pathname)
      ? parsed.pathname + parsed.search
      : '/';
  } catch {
    return '/';
  }
}
export function notificationRoute(path?: string) {
  if (path === '/feed') return '/';
  if (path === '/duels') return '/duels';
  if (path === '/trails') return '/learn';
  return safeRoute(path);
}
