'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ui from './ui.module.css';

const recovering = new Map<string, Promise<{ changed: boolean; failed: boolean }>>();

function recover(userId: string) {
  const existing = recovering.get(userId);
  if (existing) return existing;
  const task = restoreDrafts(userId).finally(() => recovering.delete(userId));
  recovering.set(userId, task);
  return task;
}

async function restoreDrafts(userId: string) {
  const custom = `stacklyst:enade:workspace:v1:${userId}`;
  const editionPrefix = `enade-ads:${userId}:`;
  const entries = new Map<string, string>();
  let changed = false;
  let failed = false;
  try {
    entries.set('enade-simulator-v1', custom);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(editionPrefix)) continue;
      const year = key.slice(editionPrefix.length);
      if (/^\d{4}$/.test(year)) entries.set(`enade-ads-${year}`, key);
    }
    for (const [key, storageKey] of entries) {
      const raw = localStorage.getItem(storageKey);
      if (!raw) continue;
      let value: { updatedAt?: number };
      try {
        value = JSON.parse(raw);
      } catch {
        continue;
      }
      if (!Number.isSafeInteger(value?.updatedAt)) continue;
      const marker = `stacklyst:enade:legacy-import:${storageKey}`;
      if (localStorage.getItem(marker) === String(value.updatedAt)) continue;
      try {
        const response = await fetch('/api/enade/attempts/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, key, value }),
        });
        if (!response.ok) throw new Error('import');
        const result = await response.json();
        changed ||= result.imported === true;
        localStorage.setItem(marker, String(value.updatedAt));
      } catch {
        failed = true;
      }
    }
  } catch {
    // Browsers can disable local storage altogether.
  }
  return { changed, failed };
}

export function LegacyDraftRecovery({ userId }: { userId: string }) {
  const router = useRouter();
  const [retry, setRetry] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void recover(userId).then((result) => {
      if (!active) return;
      setFailed(result.failed);
      if (result.changed) router.refresh();
    });
    return () => {
      active = false;
    };
  }, [retry, router, userId]);
  if (!failed) return null;
  return (
    <p className={ui.error} role="status">
      Alguns rascunhos antigos ainda estão neste navegador.{' '}
      <button type="button" className={ui.link} onClick={() => setRetry((count) => count + 1)}>
        Tentar importar novamente
      </button>
    </p>
  );
}
