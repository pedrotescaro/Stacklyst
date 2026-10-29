/** Self-contained so the same resolver can run before hydration and on page restore. */
export function syncTheme() {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem('theme');
  } catch {
    /* Storage may be unavailable. */
  }
  const theme =
    stored === 'dark' || stored === 'light'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  return theme;
}

export function saveTheme(theme: 'light' | 'dark') {
  // Keep the selected theme applied even if persistent storage is unavailable.
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* Optional persistence. */
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event('stacklyst:theme-changed'));
}

export const themeBootstrap = `(${syncTheme.toString()})();`;
