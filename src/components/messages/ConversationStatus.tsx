'use client';

import { useEffect, useState } from 'react';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export function useConversationStatus(partnerId?: string) {
  const [status, setStatus] = useState<{
    partnerId: string;
    online: boolean;
    canSend: boolean;
  } | null>(null);
  useEffect(() => {
    if (!partnerId) return;
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const res = await fetch(`/api/messages/access?partner=${encodeURIComponent(partnerId)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!controller.signal.aborted)
          setStatus({ partnerId, online: data.online === true, canSend: data.canSend === true });
      } catch {
        if (!controller.signal.aborted) setStatus(null);
      } finally {
        pending = false;
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 20000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [partnerId]);
  return status?.partnerId === partnerId ? status : null;
}

export function ConversationOnlineIndicator() {
  const { text } = useLocalizedText();
  return (
    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-dd-muted">
      <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
      {text('Online agora', 'Online now')}
    </p>
  );
}
