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

/** A KLIPY response that was not a success, kept so callers can explain a rate limit. */
export class KlipyRequestError extends Error {
  constructor(
    readonly status: number,
    readonly retryAt?: number
  ) {
    super(`KLIPY ${status}`);
    this.name = 'KlipyRequestError';
  }
}

export function isKlipyRateLimited(error: unknown): error is KlipyRequestError & { status: 429 } {
  return error instanceof KlipyRequestError && error.status === 429;
}

/**
 * The API key has a small request quota, so each search is remembered for a few
 * minutes: reopening a picker or retyping a word does not spend it again.
 */
const SEARCH_CACHE_MS = 5 * 60 * 1000;
const MAX_CACHED_SEARCHES = 60;
const RATE_LIMIT_FALLBACK_MS = 60_000;
const searchCache = new Map<string, { at: number; gifs: KlipyGif[] }>();
const rateLimits = new Map<string, number>();

export function resetKlipySearchCache() {
  searchCache.clear();
  rateLimits.clear();
}

const RETRY_DELAYS_MS = [700, 1600];

function waitFor(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function retryAtFromResponse(response: Response, now: number) {
  const header = response.headers.get('retry-after')?.trim();
  if (!header) return undefined;
  const retryAt = /^\d+$/.test(header) ? now + Number(header) * 1000 : Date.parse(header);
  return Number.isFinite(retryAt) ? Math.max(now, retryAt) : undefined;
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
  const cacheKey = `${key}|${locale}|${term.toLowerCase()}`;
  const now = Date.now();
  const cached = searchCache.get(cacheKey);
  if (cached && now - cached.at < SEARCH_CACHE_MS) return cached.gifs;

  const retryAt = Math.max(rateLimits.get(key) ?? 0, rateLimits.get(cacheKey) ?? 0);
  if (retryAt > now) throw new KlipyRequestError(429, retryAt);

  const params = new URLSearchParams({
    page: '1',
    per_page: '24',
    customer_id: klipyCustomerId(),
    locale,
    content_filter: 'high',
    format_filter: 'webp,gif',
  });
  if (term) params.set('q', term);
  const url = `${KLIPY_API}/${encodeURIComponent(key)}/gifs/${term ? 'search' : 'trending'}?${params}`;

  // Short retries are for server errors and dropped connections. A 429 starts a cooldown.
  for (let attempt = 0; ; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, { signal });
    } catch (error) {
      if (signal?.aborted || attempt >= RETRY_DELAYS_MS.length) throw error;
      await waitFor(RETRY_DELAYS_MS[attempt], signal);
      continue;
    }
    if (response.ok) {
      const result = (await response.json()) as {
        result?: boolean;
        data?: { data?: KlipyItem[] };
      };
      if (result.result === false) throw new Error('KLIPY result=false');
      const gifs = (result.data?.data || []).flatMap((item) => {
        const gif = toGif(item);
        return gif ? [gif] : [];
      });
      searchCache.set(cacheKey, { at: Date.now(), gifs });
      if (searchCache.size > MAX_CACHED_SEARCHES)
        searchCache.delete(searchCache.keys().next().value as string);
      return gifs;
    }
    if (response.status === 429) {
      const now = Date.now();
      const providerRetryAt = retryAtFromResponse(response, now);
      const retryAt = providerRetryAt ?? now + RATE_LIMIT_FALLBACK_MS;
      // Without Retry-After, another term may still be available in the provider's cache.
      rateLimits.set(providerRetryAt === undefined ? cacheKey : key, retryAt);
      for (const [entry, until] of rateLimits) {
        if (until <= now) rateLimits.delete(entry);
      }
      if (rateLimits.size > MAX_CACHED_SEARCHES)
        rateLimits.delete(rateLimits.keys().next().value as string);
      throw new KlipyRequestError(429, retryAt);
    }
    if (response.status < 500 || attempt >= RETRY_DELAYS_MS.length)
      throw new KlipyRequestError(response.status);
    const now = Date.now();
    const retryAt = retryAtFromResponse(response, now);
    await waitFor(
      retryAt === undefined ? RETRY_DELAYS_MS[attempt] : Math.min(retryAt - now, 5000),
      signal
    );
  }
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
