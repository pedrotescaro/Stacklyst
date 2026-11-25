/**
 * KLIPY GIF API (https://docs.klipy.com). KLIPY's integration rules require the
 * requests and media loads to come from the user's browser and forbid
 * re-hosting the media, so a chosen GIF is stored as the KLIPY URL itself.
 */
const KLIPY_API = 'https://api.klipy.com/api/v1';
const KLIPY_MEDIA_HOST = /^static\d*\.klipy\.com$/;
/** Keeps a single feed or banner GIF from costing viewers more than a few MB. */
const MAX_GIF_BYTES = 5 * 1024 * 1024;

export interface KlipyGif {
  id: string;
  slug: string;
  title: string;
  /** Small animated preview for the picker grid. */
  preview: string;
  /** Animated file (WebP when available) used once the item is chosen. */
  url: string;
}

type KlipyFile = { url?: unknown; size?: unknown };
type KlipyItem = {
  id?: unknown;
  slug?: unknown;
  title?: unknown;
  type?: unknown;
  file?: Partial<Record<'hd' | 'md' | 'sm' | 'xs', { gif?: KlipyFile; webp?: KlipyFile }>>;
};

/** Only KLIPY's media CDN may be stored as a GIF attachment, banner, or avatar. */
export function isKlipyMediaUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      KLIPY_MEDIA_HOST.test(url.hostname) &&
      !url.port &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function klipyApiKey() {
  return process.env.NEXT_PUBLIC_KLIPY_API_KEY?.trim() || '';
}

/**
 * KLIPY asks for a stable, anonymous customer id. A random id kept in this
 * browser avoids sending the account id or any personal data.
 */
export function klipyCustomerId() {
  const storageKey = 'stacklyst:klipy-customer';
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved && /^[a-f\d-]{36}$/.test(saved)) return saved;
    const created = crypto.randomUUID();
    window.localStorage.setItem(storageKey, created);
    return created;
  } catch {
    return 'anonymous';
  }
}

function toGif(item: KlipyItem): KlipyGif | null {
  if (item.type !== undefined && item.type !== 'gif') return null;
  if (typeof item.slug !== 'string' || !item.slug) return null;
  const sizes = item.file || {};
  const valid = (file: KlipyFile | undefined) => isKlipyMediaUrl(file?.url);
  // Animated WebP is 5-15x smaller than the same GIF (an HD GIF can pass 30 MB),
  // so it is preferred everywhere and the GIF only fills in when WebP is missing.
  const preview = [sizes.sm?.webp, sizes.sm?.gif, sizes.xs?.webp, sizes.xs?.gif].find(valid);
  const full =
    [sizes.hd?.webp, sizes.md?.webp, sizes.hd?.gif, sizes.md?.gif].find(
      (file) => valid(file) && Number(file?.size || 0) <= MAX_GIF_BYTES
    ) ?? preview;
  if (!preview || !full) return null;
  return {
    id: String(item.id ?? item.slug),
    slug: item.slug,
    title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'GIF',
    preview: preview.url as string,
    url: full.url as string,
  };
}

export async function searchKlipyGifs({
  key,
  query,
  locale,
  signal,
}: {
  key: string;
  query: string;
  locale: string;
  signal?: AbortSignal;
}): Promise<KlipyGif[]> {
  const term = query.trim();
  const params = new URLSearchParams({
    page: '1',
    per_page: '24',
    customer_id: klipyCustomerId(),
    locale,
    content_filter: 'high',
    format_filter: 'webp,gif',
  });
  if (term) params.set('q', term);
  const response = await fetch(
    `${KLIPY_API}/${encodeURIComponent(key)}/gifs/${term ? 'search' : 'trending'}?${params}`,
    { signal }
  );
  if (!response.ok) throw new Error(`KLIPY ${response.status}`);
  const result = (await response.json()) as { result?: boolean; data?: { data?: KlipyItem[] } };
  if (result.result === false) throw new Error('KLIPY result=false');
  return (result.data?.data || []).flatMap((item) => {
    const gif = toGif(item);
    return gif ? [gif] : [];
  });
}

/** Tells KLIPY a GIF was chosen. Failures never block the user's action. */
export function registerKlipyShare(key: string, slug: string, query: string) {
  void fetch(`${KLIPY_API}/${encodeURIComponent(key)}/gifs/share/${encodeURIComponent(slug)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: klipyCustomerId(), q: query.trim() }),
    keepalive: true,
  }).catch(() => undefined);
}
