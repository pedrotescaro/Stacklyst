export function adventureAsset(file: string, base: string) {
  const bundled = (
    globalThis as typeof globalThis & { __MUNDINHO_ASSETS__?: Record<string, string> }
  ).__MUNDINHO_ASSETS__;
  return bundled?.[file] ?? `${base}/${file}`;
}
