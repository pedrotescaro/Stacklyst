import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isKlipyMediaUrl,
  isKlipyRateLimited,
  registerKlipyShare,
  resetKlipySearchCache,
  searchKlipyGifs,
} from '../klipy';

const media = (name: string, size = 1000) => ({
  url: `https://static.klipy.com/ii/abc/14/af/${name}.gif`,
  width: 220,
  height: 220,
  size,
});

afterEach(() => {
  vi.useRealTimers();
  resetKlipySearchCache();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('isKlipyMediaUrl', () => {
  it('accepts only HTTPS URLs on the KLIPY media CDN', () => {
    expect(isKlipyMediaUrl('https://static.klipy.com/ii/a/b.gif')).toBe(true);
    expect(isKlipyMediaUrl('https://static2.klipy.com/ii/a/b.gif')).toBe(true);
    for (const value of [
      'http://static.klipy.com/ii/a/b.gif',
      'https://api.klipy.com/ii/a/b.gif',
      'https://static.klipy.com.evil.example/b.gif',
      'https://evil.example/static.klipy.com/b.gif',
      'https://user:pass@static.klipy.com/b.gif',
      'https://static.klipy.com:8443/b.gif',
      `https://static.klipy.com/${'a'.repeat(2100)}`,
      '/api/posts/media/x',
      null,
    ])
      expect(isKlipyMediaUrl(value)).toBe(false);
  });
});

describe('searchKlipyGifs', () => {
  it('searches with the key in the path and keeps the largest GIF under 5 MB', async () => {
    const fetch = vi.fn(async (_url: string) =>
      Response.json({
        result: true,
        data: {
          data: [
            {
              id: 1,
              slug: 'hello-hi',
              title: 'Hello',
              type: 'gif',
              file: {
                hd: { gif: media('hd', 6 * 1024 * 1024) },
                md: { gif: media('md', 3 * 1024 * 1024) },
                sm: { gif: media('sm') },
              },
            },
            { id: 2, slug: 'sponsored', type: 'ad', file: { sm: { gif: media('ad') } } },
            {
              id: 3,
              slug: 'elsewhere',
              type: 'gif',
              file: { sm: { gif: { url: 'https://evil.example/x.gif' } } },
            },
          ],
        },
      })
    );
    vi.stubGlobal('fetch', fetch);

    const gifs = await searchKlipyGifs({ key: 'test-key', query: ' oi ', locale: 'br' });

    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.klipy.com/api/v1/test-key/gifs/search');
    expect(url.searchParams.get('q')).toBe('oi');
    expect(url.searchParams.get('locale')).toBe('br');
    expect(url.searchParams.get('customer_id')).toMatch(/^[a-f\d-]{36}$/);
    expect(gifs).toEqual([
      {
        id: '1',
        slug: 'hello-hi',
        title: 'Hello',
        preview: media('sm').url,
        url: media('md').url,
      },
    ]);
  });

  it('prefers the much lighter animated WebP over the GIF file', async () => {
    const webp = (name: string, size: number) => ({
      url: `https://static.klipy.com/ii/abc/14/af/${name}.webp`,
      size,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          result: true,
          data: {
            data: [
              {
                id: 9,
                slug: 'cat',
                title: 'Cat',
                type: 'gif',
                file: {
                  hd: { gif: media('hd', 30 * 1024 * 1024), webp: webp('hd', 1700 * 1024) },
                  md: { gif: media('md', 14 * 1024 * 1024), webp: webp('md', 1600 * 1024) },
                  sm: { gif: media('sm'), webp: webp('sm', 200 * 1024) },
                },
              },
            ],
          },
        })
      )
    );
    const [gif] = await searchKlipyGifs({ key: 'k', query: 'cat', locale: 'br' });
    expect(gif.url).toBe(webp('hd', 0).url);
    expect(gif.preview).toBe(webp('sm', 0).url);
  });

  it('uses trending when the query is empty and reuses the anonymous customer id', async () => {
    const fetch = vi.fn(async (_url: string) =>
      Response.json({ result: true, data: { data: [] } })
    );
    vi.stubGlobal('fetch', fetch);
    await searchKlipyGifs({ key: 'k', query: '  ', locale: 'us' });
    // The second request would come from the cache; clear it to compare customer ids.
    resetKlipySearchCache();
    await searchKlipyGifs({ key: 'k', query: '', locale: 'us' });
    const first = new URL(fetch.mock.calls[0][0]);
    const second = new URL(fetch.mock.calls[1][0]);
    expect(first.pathname).toBe('/api/v1/k/gifs/trending');
    expect(first.searchParams.has('q')).toBe(false);
    expect(first.searchParams.get('customer_id')).toBe(second.searchParams.get('customer_id'));
  });

  it('throws when KLIPY rejects the request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 401 }))
    );
    await expect(searchKlipyGifs({ key: 'bad', query: 'x', locale: 'br' })).rejects.toThrow();
  });
});

describe('registerKlipyShare', () => {
  it('posts the share without surfacing network failures', async () => {
    const fetch = vi.fn(async () => {
      throw new Error('offline');
    });
    vi.stubGlobal('fetch', fetch);
    expect(() => registerKlipyShare('k', 'hello-hi', 'oi')).not.toThrow();
    expect(fetch).toHaveBeenCalledWith(
      'https://api.klipy.com/api/v1/k/gifs/share/hello-hi',
      expect.objectContaining({ method: 'POST' })
    );
    expect(
      JSON.parse((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    ).toMatchObject({
      q: 'oi',
    });
  });
});

describe('searchKlipyGifs quota handling', () => {
  const ok = () =>
    Response.json({
      result: true,
      data: {
        data: [
          { id: 1, slug: 'cat', title: 'Cat', type: 'gif', file: { sm: { gif: media('sm') } } },
        ],
      },
    });

  it('reuses a recent search instead of spending the quota again', async () => {
    const fetch = vi.fn(async () => ok());
    vi.stubGlobal('fetch', fetch);
    await searchKlipyGifs({ key: 'k', query: 'Gato', locale: 'br' });
    await searchKlipyGifs({ key: 'k', query: ' gato ', locale: 'br' });
    expect(fetch).toHaveBeenCalledTimes(1);
    await searchKlipyGifs({ key: 'k', query: 'gato', locale: 'us' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('retries a rate limit and a server error, then succeeds', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429, headers: { 'Retry-After': '1' } }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(ok());
    vi.stubGlobal('fetch', fetch);
    const search = searchKlipyGifs({ key: 'k', query: 'retry', locale: 'br' });
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(1600);
    expect(await search).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('reports a rate limit that outlasts the retries, and never retries an invalid key', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 429 }))
    );
    const limited = searchKlipyGifs({ key: 'k', query: 'busy', locale: 'br' }).catch((e) => e);
    await vi.advanceTimersByTimeAsync(3000);
    expect(isKlipyRateLimited(await limited)).toBe(true);

    const fetch = vi.fn(async () => new Response(null, { status: 401 }));
    vi.stubGlobal('fetch', fetch);
    const refused = await searchKlipyGifs({ key: 'bad', query: 'x', locale: 'br' }).catch((e) => e);
    expect(isKlipyRateLimited(refused)).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
