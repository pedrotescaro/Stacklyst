import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSpotifyPreviewCache,
  getSpotifyPreviewUrl,
  parseSpotifyPreviewUrl,
  SpotifyPreviewError,
} from '../spotify-preview';

const TRACK = '4cOdK2wGLETKBW3PvgPWqT';
const PREVIEW = 'https://p.scdn.co/mp3-preview/40a780b231e5ed130483bec7917b6c9a4f8a4708';
const embedPage = (url: string) =>
  `<script id="__NEXT_DATA__">{"entity":{"audioPreview":{"url":"${url}"},"duration":213573}}</script>`;

describe('parseSpotifyPreviewUrl', () => {
  it('reads the preview MP3 from the embed page', () => {
    expect(parseSpotifyPreviewUrl(embedPage(PREVIEW))).toBe(PREVIEW);
  });

  it('rejects anything that is not Spotify’s preview CDN', () => {
    expect(parseSpotifyPreviewUrl(embedPage('https://evil.example/mp3-preview/x'))).toBeNull();
    expect(parseSpotifyPreviewUrl(embedPage('http://p.scdn.co/mp3-preview/x'))).toBeNull();
    expect(parseSpotifyPreviewUrl(embedPage('https://p.scdn.co/other/x'))).toBeNull();
    expect(parseSpotifyPreviewUrl('<html>no preview here</html>')).toBeNull();
  });
});

describe('getSpotifyPreviewUrl', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    clearSpotifyPreviewCache();
    fetchMock = vi.fn(async () => new Response(embedPage(PREVIEW)));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('fetches the public embed once and caches the result', async () => {
    expect(await getSpotifyPreviewUrl(TRACK)).toBe(PREVIEW);
    expect(await getSpotifyPreviewUrl(TRACK)).toBe(PREVIEW);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe(`https://open.spotify.com/embed/track/${TRACK}`);
  });

  it('ignores invalid ids without calling Spotify', async () => {
    expect(await getSpotifyPreviewUrl('../../etc/passwd')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null for unknown tracks and throws when Spotify is down', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 404 }));
    expect(await getSpotifyPreviewUrl(TRACK)).toBeNull();
    clearSpotifyPreviewCache();
    fetchMock.mockResolvedValueOnce(new Response('', { status: 502 }));
    await expect(getSpotifyPreviewUrl(TRACK)).rejects.toBeInstanceOf(SpotifyPreviewError);
  });
});
