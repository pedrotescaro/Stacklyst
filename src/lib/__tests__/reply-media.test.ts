import { describe, expect, it } from 'vitest';
import { encodeReplyMedia, parseReplyMedia, stripReplyMedia } from '../reply-media';

const image = {
  type: 'image' as const,
  url: '/api/posts/media/0b9f1c3e-8c1a-4a7e-9d6f-2f8a1b2c3d4e',
};
const music = {
  trackId: '4cOdK2wGLETKBW3PvgPWqT',
  title: 'Canção – ação',
  artist: 'Artista',
  artworkUrl: 'https://i.scdn.co/image/abc',
};

describe('reply media', () => {
  it('round-trips attachments and music without leaking into the text', () => {
    const body = encodeReplyMedia('Eu acho super bonito', { attachments: [image], music });
    const parsed = parseReplyMedia(body);
    expect(parsed.content).toBe('Eu acho super bonito');
    expect(parsed.attachments).toEqual([image]);
    expect(parsed.music).toEqual(music);
  });

  it('leaves plain replies untouched', () => {
    expect(encodeReplyMedia('  oi tudo bem  ', { attachments: [], music: null })).toBe(
      'oi tudo bem'
    );
    expect(parseReplyMedia('oi tudo bem')).toEqual({
      content: 'oi tudo bem',
      attachments: [],
      music: null,
    });
  });

  it('ignores hand-written markers pointing outside our storage', () => {
    const forged = encodeReplyMedia('x', {
      attachments: [{ type: 'image', url: 'https://evil.example/pixel.png' }],
      music: { ...music, artworkUrl: 'https://evil.example/a.png' },
    });
    const parsed = parseReplyMedia(forged);
    expect(parsed.attachments).toEqual([]);
    expect(parsed.music).toBeNull();
    expect(stripReplyMedia(forged)).toBe('x');
  });
});
