import { describe, it, expect } from 'vitest';
import { createPostSchema } from '../validators';

describe('createPostSchema', () => {
  const spotifyTrack = {
    trackId: '11dFghVXANMlKmJXsNCbNl',
    title: 'Best Friend',
    artist: '',
    artworkUrl: 'https://i.scdn.co/image/album-artwork',
  };

  it('accepts a music-only post resolved by Spotify oEmbed without artist metadata', () => {
    const result = createPostSchema.parse({ body: '', music: spotifyTrack });

    expect(result.body).toBe('');
    expect(result.music).toEqual(spotifyTrack);
  });

  it('accepts a music-only post while Spotify metadata is unavailable', () => {
    const result = createPostSchema.parse({
      body: '   ',
      music: {
        ...spotifyTrack,
        title: 'Faixa do Spotify',
        artworkUrl: null,
        metadataUnavailable: true,
      },
    });

    expect(result.body).toBe('');
    expect(result.music?.trackId).toBe(spotifyTrack.trackId);
  });

  it.each([
    { trackId: 'invalid' },
    { title: '' },
    { artist: 'a'.repeat(201) },
    { artworkUrl: 'https://example.com/artwork.png' },
  ])('rejects malformed music even when the post has no text: %o', (invalidMetadata) => {
    expect(
      createPostSchema.safeParse({ body: '', music: { ...spotifyTrack, ...invalidMetadata } })
        .success
    ).toBe(false);
  });

  it('rejects an empty post after its music attachment is removed', () => {
    const result = createPostSchema.safeParse({ body: '', music: null });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Adicione texto ou um anexo para publicar.');
    }
  });

  it('should validate correct post data', async () => {
    const result = await createPostSchema.safeParseAsync({
      title: 'Valid Post Title',
      body: 'This is a valid post body with more than 10 characters.',
      language: 'TS',
      image_url: 'https://example.com/image.png',
    });
    expect(result.success).toBe(true);
  });

  it('should allow optional language', async () => {
    const result = await createPostSchema.safeParseAsync({
      title: 'Valid Post Title',
      body: 'This is a valid post body with more than 10 characters.',
      image_url: 'https://example.com/image.png',
    });
    expect(result.success).toBe(true);
  });

  it('should reject too short title', async () => {
    const result = await createPostSchema.safeParseAsync({
      title: 'Shor',
      body: 'This is a valid post body with more than 10 characters.',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty posts', async () => {
    const result = await createPostSchema.safeParseAsync({
      title: 'Valid Post Title',
      body: '   ',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid image_url formats (http, javascript, data, file)', async () => {
    const invalidUrls = [
      'http://example.com/image.png',
      'javascript:alert(1)',
      'data:image/png;base64,abc',
      'file:///etc/passwd',
    ];
    for (const url of invalidUrls) {
      const result = await createPostSchema.safeParseAsync({
        title: 'Valid Post Title',
        body: 'This is a valid post body with more than 10 characters.',
        image_url: url,
      });
      expect(result.success).toBe(false);
    }
  });

  it('should accept valid image_url formats (https, /uploads/)', async () => {
    const validUrls = ['https://example.com/image.png', '/uploads/image.png', '', null, undefined];
    for (const url of validUrls) {
      const result = await createPostSchema.safeParseAsync({
        title: 'Valid Post Title',
        body: 'This is a valid post body with more than 10 characters.',
        image_url: url,
      });
      expect(result.success).toBe(true);
    }
  });

  it('should reject more than 5 mentions in the body', async () => {
    const result = await createPostSchema.safeParseAsync({
      title: 'Valid Post Title',
      body: 'Hey @user1 @user2 @user3 @user4 @user5 @user6 check this out!',
    });
    expect(result.success).toBe(false);
  });

  it('should accept 5 or fewer mentions in the body', async () => {
    const result = await createPostSchema.safeParseAsync({
      title: 'Valid Post Title',
      body: 'Hey @user1 @user2 @user3 @user4 @user5 check this out!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty body', async () => {
    const result = await createPostSchema.safeParseAsync({
      title: 'Valid Post Title',
      body: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject http-only image_url that is not localhost or 127.0.0.1', async () => {
    const result = await createPostSchema.safeParseAsync({
      title: 'Valid Post Title',
      body: 'This is a valid post body with more than 10 characters.',
      image_url: 'http://example.com/image.png',
    });
    expect(result.success).toBe(false);
  });

  it('should accept http-only image_url for localhost and 127.0.0.1', async () => {
    const localhostResult = await createPostSchema.safeParseAsync({
      title: 'Valid Post Title',
      body: 'This is a valid post body with more than 10 characters.',
      image_url: 'http://localhost/image.png',
    });
    const loopbackResult = await createPostSchema.safeParseAsync({
      title: 'Valid Post Title',
      body: 'This is a valid post body with more than 10 characters.',
      image_url: 'http://127.0.0.1/image.png',
    });
    expect(localhostResult.success).toBe(true);
    expect(loopbackResult.success).toBe(true);
  });
});
