import type { PostAttachment } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';

export interface ReplyMedia {
  attachments: PostAttachment[];
  music: SpotifyProfileTrack | null;
}

/**
 * Replies have no media columns, so their attachments travel as a Markdown link
 * reference definition at the end of the body. Markdown renders nothing for it,
 * which keeps older readers clean, and no database migration is needed.
 */
const MARKER = /\n*\[stacklyst-reply-media\]: # \(([A-Za-z0-9_-]+)\)\s*$/;
const MEDIA_URL = /^\/api\/posts\/media\/[a-f0-9-]{36}$/i;
const SPOTIFY_ART = /^https:\/\/([a-z0-9-]+\.)*(scdn\.co|spotifycdn\.com)\//i;

/** Drops any hand-written marker so only server-validated media is stored. */
export function stripReplyMedia(body: string) {
  return body.replace(MARKER, '').trim();
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

export function encodeReplyMedia(body: string, media: ReplyMedia) {
  const trimmed = body.trim();
  if (!media.attachments.length && !media.music) return trimmed;
  const payload = toBase64Url(JSON.stringify(media));
  return `${trimmed}\n\n[stacklyst-reply-media]: # (${payload})`.trim();
}

export function parseReplyMedia(body: string): ReplyMedia & { content: string } {
  const match = body.match(MARKER);
  if (!match) return { content: body, attachments: [], music: null };
  const content = body.slice(0, match.index).trim();
  try {
    const parsed = JSON.parse(fromBase64Url(match[1]));
    // The body is user text, so only render media that points at our own storage
    // and Spotify, even if someone typed a marker by hand.
    const attachments = (Array.isArray(parsed?.attachments) ? parsed.attachments : [])
      .filter(
        (item: PostAttachment) =>
          ['image', 'gif', 'audio'].includes(item?.type) &&
          typeof item.url === 'string' &&
          MEDIA_URL.test(item.url)
      )
      .slice(0, 4);
    const music = parsed?.music;
    const validMusic =
      music &&
      typeof music.trackId === 'string' &&
      /^[a-zA-Z0-9]{22}$/.test(music.trackId) &&
      typeof music.title === 'string' &&
      (music.artworkUrl === null ||
        (typeof music.artworkUrl === 'string' && SPOTIFY_ART.test(music.artworkUrl)));
    return { content, attachments, music: validMusic ? music : null };
  } catch {
    return { content, attachments: [], music: null };
  }
}
