'use client';
import { useEffect, useState } from 'react';
import { DEFAULT_CHAT_PREFERENCES, parsePrivateChat } from '@/lib/profile-customization';

export function usePrivateChat(userId?: string) {
  const [chat, setChat] = useState(DEFAULT_CHAT_PREFERENCES);
  useEffect(() => {
    setChat(DEFAULT_CHAT_PREFERENCES);
    if (!userId) return;
    const controller = new AbortController();
    void fetch('/api/profile/customization', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        if (!controller.signal.aborted) setChat(parsePrivateChat(result.chat));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [userId]);
  return chat;
}
