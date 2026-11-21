// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ recipient: vi.fn(), settings: vi.fn(), save: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: mock.recipient },
    mobileState: { findMany: mock.settings, upsert: mock.save },
  },
}));
import { defaultChatPrivacy } from '@/lib/chat-privacy';
import {
  assertCanSendMessage,
  getChatPrivacy,
  getConversationAccess,
  saveChatPrivacy,
} from '../chat-privacy.service';

const base = {
  following: [],
  followers: [],
  received_messages: [],
  sent_messages: [],
  mobile_state: [],
};

describe('chat privacy', () => {
  it.each([
    ['everyone', false, false, true],
    ['following', false, true, false],
    ['following', true, false, true],
    ['mutual', true, false, false],
    ['mutual', false, true, false],
    ['mutual', true, true, true],
    ['nobody', true, true, false],
  ] as const)(
    'audience %s, recipient follows %s, sender follows %s',
    async (value, following, follower, allowed) => {
      mock.recipient.mockResolvedValue({
        ...base,
        mobile_state: [{ key: 'chat:messages', value }],
        following: following ? [{}] : [],
        followers: follower ? [{}] : [],
      });
      const send = assertCanSendMessage('sender', 'recipient');
      if (allowed) await expect(send).resolves.toBeUndefined();
      else await expect(send).rejects.toMatchObject({ code: 'CHAT_PRIVACY', statusCode: 403 });
      expect(mock.recipient).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'recipient' },
          select: expect.objectContaining({
            following: expect.objectContaining({ where: { followingId: 'sender' } }),
            followers: expect.objectContaining({ where: { followerId: 'sender' } }),
          }),
        })
      );
    }
  );
  it.each([
    [false, true, 0, false],
    [true, false, 0, false],
    [true, true, 65, false],
    [true, true, 0, true],
  ])(
    'only shares a current opted-in heartbeat within an established conversation',
    async (existing, visible, age, online) => {
      mock.recipient.mockResolvedValue({
        ...base,
        sent_messages: existing ? [{}] : [],
        mobile_state: [
          { key: 'chat:messages', value: 'nobody' },
          { key: 'chat:showOnline', value: visible },
          { key: 'platform:presence', updated_at: new Date(Date.now() - Number(age) * 1000) },
        ],
      });
      expect(await getConversationAccess('sender', 'recipient')).toEqual({
        canSend: existing,
        online,
      });
    }
  );
  it('saves only the changed setting on the authenticated account and reads defaults for older accounts', async () => {
    mock.settings
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ key: 'chat:groups', value: 'nobody' }]);
    expect(await getChatPrivacy('me')).toEqual(defaultChatPrivacy);
    await saveChatPrivacy('me', { setting: 'groups', value: 'nobody' });
    expect(mock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id_key: { user_id: 'me', key: 'chat:groups' } },
        update: { value: 'nobody', version: { increment: 1 } },
      })
    );
    expect(await getChatPrivacy('me')).toEqual({ ...defaultChatPrivacy, groups: 'nobody' });
  });
});
