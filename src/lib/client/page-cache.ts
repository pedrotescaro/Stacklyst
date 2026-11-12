/**
 * Small in-memory cache for first pages of lists (feed filters, profile tabs).
 *
 * Switching back to a tab shows the last page instantly while a background
 * request refreshes it, and tabs can be prefetched before the user opens them.
 * It lives only for the current page session, so a reload always starts fresh.
 */

interface Entry {
  data: unknown;
  at: number;
}

const MAX_ENTRIES = 60;
/** Entries younger than this are shown without a background refresh. */
export const PAGE_CACHE_FRESH_MS = 20_000;
/** Older entries are dropped instead of being shown. */
const MAX_AGE_MS = 10 * 60_000;

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export function readCachedPage<T>(key: string): { data: T; age: number } | null {
  const entry = store.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.at;
  if (age > MAX_AGE_MS) {
    store.delete(key);
    return null;
  }
  return { data: entry.data as T, age };
}

export function writeCachedPage(key: string, data: unknown) {
  store.delete(key);
  store.set(key, { data, at: Date.now() });
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) break;
    store.delete(oldest);
  }
}

/** Updates an entry in place without marking it as freshly fetched. */
export function patchCachedPage(key: string, data: unknown) {
  const entry = store.get(key);
  if (entry) entry.data = data;
}

/** Patches an existing entry, or stores a new one when the key has never been cached. */
export function upsertCachedPage(key: string, data: unknown) {
  if (store.has(key)) patchCachedPage(key, data);
  else writeCachedPage(key, data);
}

export function clearPageCache() {
  store.clear();
  inflight.clear();
}

/**
 * Fetches JSON with `no-store` semantics, shares concurrent requests for the same
 * URL (a prefetch in flight is reused by the click), and caches the result.
 */
export function fetchPage<T>(url: string): Promise<T> {
  const pending = inflight.get(url);
  if (pending) return pending as Promise<T>;
  const request = fetch(url, { cache: 'no-store' })
    .then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          (body && (body.message || body.error)) || `Request failed (${response.status})`;
        throw new Error(String(message));
      }
      writeCachedPage(url, body);
      return body as T;
    })
    .finally(() => inflight.delete(url));
  inflight.set(url, request);
  return request;
}

/** Warms the cache in the background; failures are ignored. */
export function prefetchPage(url: string) {
  const cached = readCachedPage(url);
  if ((cached && cached.age < PAGE_CACHE_FRESH_MS) || inflight.has(url)) return;
  void fetchPage(url).catch(() => {});
}

/** Runs work when the browser is idle so prefetching never competes with the first paint. */
export function whenIdle(work: () => void, timeout = 1200) {
  if (typeof window === 'undefined') return () => {};
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(work, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(work, 250);
  return () => window.clearTimeout(id);
}
