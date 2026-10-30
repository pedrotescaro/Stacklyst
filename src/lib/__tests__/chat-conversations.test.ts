import { afterEach, describe, expect, it, vi } from 'vitest';
import { createConversation, resolveProfileConversation } from '../chat-conversations';

afterEach(() => vi.unstubAllGlobals());

describe('message links from profiles', () => {
  it('opens the existing conversation with the exact username, regardless of case', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const existing = createConversation(
      { id: 'other', username: 'Developer', avatar_url: null },
      'me'
    );
    expect(await resolveProfileConversation('developer', 'me', [existing])).toBe(existing);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('opens a draft for a new recipient using fresh profile data without sending a message', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ user: { id: 'other', username: 'developer', avatar_url: '/avatar.png' } })
      );
    vi.stubGlobal('fetch', fetchMock);
    const result = await resolveProfileConversation('developer', 'me', []);
    expect(result).toMatchObject({
      partnerId: 'other',
      lastMessage: '',
      partner: { username: 'developer', avatar_url: '/avatar.png' },
    });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      '/api/profile/developer',
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('does not open unavailable or blocked profiles', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })));
    await expect(resolveProfileConversation('blocked', 'me', [])).rejects.toThrow(
      'RECIPIENT_UNAVAILABLE'
    );
  });

  it('does not open the wrong person or a self-conversation', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ user: { id: 'other', username: 'different' } }))
      .mockResolvedValueOnce(Response.json({ user: { id: 'me', username: 'myself' } }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(resolveProfileConversation('developer', 'me', [])).rejects.toThrow(
      'RECIPIENT_UNAVAILABLE'
    );
    expect(await resolveProfileConversation('myself', 'me', [])).toBeNull();
  });
});
