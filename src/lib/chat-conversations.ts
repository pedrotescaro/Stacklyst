export interface ChatItem {
  partnerId: string;
  lastMessage: string;
  lastMessageTime: string;
  lastSenderId: string;
  partner: { id: string; username: string; avatar_url: string | null };
}

export function createConversation(partner: ChatItem['partner'], currentUserId: string): ChatItem {
  return {
    partnerId: partner.id,
    lastMessage: '',
    lastMessageTime: new Date().toISOString(),
    lastSenderId: currentUserId,
    partner,
  };
}

/** Resolve profile links without sending a message or creating a server record. */
export async function resolveProfileConversation(
  username: string,
  currentUserId: string,
  chats: ChatItem[],
  signal?: AbortSignal
): Promise<ChatItem | null> {
  const existing = chats.find(
    (chat) => chat.partner.username.toLowerCase() === username.toLowerCase()
  );
  if (existing) return existing;
  const response = await fetch(`/api/profile/${encodeURIComponent(username)}`, {
    signal,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('RECIPIENT_UNAVAILABLE');
  const { user } = await response.json();
  if (
    !user ||
    typeof user.id !== 'string' ||
    typeof user.username !== 'string' ||
    user.username.toLowerCase() !== username.toLowerCase()
  )
    throw new Error('RECIPIENT_UNAVAILABLE');
  if (user.id === currentUserId) return null;
  return createConversation(
    {
      id: user.id,
      username: user.username,
      avatar_url: typeof user.avatar_url === 'string' ? user.avatar_url : null,
    },
    currentUserId
  );
}
