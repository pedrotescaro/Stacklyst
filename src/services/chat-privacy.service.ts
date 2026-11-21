import {
  chatAudience,
  defaultChatPrivacy,
  type ChatPrivacy,
  type ChatPrivacyChange,
} from '@/lib/chat-privacy';
import { AppError } from '@/lib/errors';
import { PRESENCE_KEY, PRESENCE_WINDOW_SECONDS } from '@/lib/platform-presence';
import { prisma } from '@/lib/prisma';

// Separate keys let different tabs update individual settings without overwriting one another.
const keys = {
  showOnline: 'chat:showOnline',
  messages: 'chat:messages',
  groups: 'chat:groups',
};

function readPreferences(rows: { key: string; value: unknown }[]): ChatPrivacy {
  const values = new Map(rows.map((row) => [row.key, row.value]));
  return {
    showOnline: values.has(keys.showOnline)
      ? values.get(keys.showOnline) === true
      : defaultChatPrivacy.showOnline,
    messages: chatAudience.safeParse(values.get(keys.messages)).data ?? defaultChatPrivacy.messages,
    groups: chatAudience.safeParse(values.get(keys.groups)).data ?? defaultChatPrivacy.groups,
  };
}

export async function getChatPrivacy(userId: string) {
  const rows = await prisma.mobileState.findMany({
    where: { user_id: userId, key: { in: Object.values(keys) } },
    select: { key: true, value: true },
  });
  return readPreferences(rows);
}

export async function saveChatPrivacy(userId: string, { setting, value }: ChatPrivacyChange) {
  const key = keys[setting];
  await prisma.mobileState.upsert({
    where: { user_id_key: { user_id: userId, key } },
    create: { user_id: userId, key, value },
    update: { value, version: { increment: 1 } },
  });
}

export async function getConversationAccess(senderId: string, recipientId: string) {
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: {
      mobile_state: {
        where: { key: { in: [keys.messages, keys.showOnline, PRESENCE_KEY] } },
        select: { key: true, value: true, updated_at: true },
      },
      following: { where: { followingId: senderId }, select: { followingId: true } },
      followers: { where: { followerId: senderId }, select: { followerId: true } },
      sent_messages: { where: { receiver_id: senderId }, take: 1, select: { id: true } },
      received_messages: { where: { sender_id: senderId }, take: 1, select: { id: true } },
    },
  });
  if (!recipient) throw new AppError('USER_NOT_FOUND', 'Destinatário não encontrado.', 404);
  const { messages, showOnline } = readPreferences(recipient.mobile_state);
  const existing = recipient.sent_messages.length > 0 || recipient.received_messages.length > 0;
  const followsSender = recipient.following.length > 0;
  const canSend =
    existing ||
    messages === 'everyone' ||
    (followsSender &&
      (messages === 'following' || (messages === 'mutual' && recipient.followers.length > 0)));
  const heartbeat = recipient.mobile_state.find((row) => row.key === PRESENCE_KEY);
  const online = Boolean(
    existing &&
    showOnline &&
    heartbeat &&
    heartbeat.updated_at.getTime() >= Date.now() - PRESENCE_WINDOW_SECONDS * 1000
  );
  return { canSend, online };
}

export async function assertCanSendMessage(senderId: string, recipientId: string) {
  if (!(await getConversationAccess(senderId, recipientId)).canSend) {
    throw new AppError(
      'CHAT_PRIVACY',
      'As configurações de privacidade desta pessoa impedem que você inicie uma conversa.',
      403
    );
  }
}
