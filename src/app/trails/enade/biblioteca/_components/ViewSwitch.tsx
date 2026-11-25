'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ListChecks } from 'lucide-react';
import styles from './library.module.css';

type Mode = 'completo' | 'resumo';

/**
 * Full/summary reading switch. The blue pill slides to the clicked side right
 * away, while the other version of the page loads behind it.
 */
export function ViewSwitch({ slug, summary }: { slug: string; summary: boolean }) {
  const serverMode: Mode = summary ? 'resumo' : 'completo';
  const [mode, setMode] = useState<Mode>(serverMode);
  const [synced, setSynced] = useState<Mode>(serverMode);
  // Follow the URL when it changes some other way (back/forward).
  if (synced !== serverMode) {
    setSynced(serverMode);
    setMode(serverMode);
  }
  return (
    <div className={styles.viewSwitch} data-mode={mode} role="group" aria-label="Modo de leitura">
      <span className={styles.viewPill} aria-hidden="true" />
      <Link
        href={`/trails/enade/biblioteca/${slug}`}
        aria-current={mode === 'completo' ? 'true' : undefined}
        scroll={false}
        onClick={() => setMode('completo')}
      >
        <BookOpen size={14} aria-hidden="true" /> Completo
      </Link>
      <Link
        href={`/trails/enade/biblioteca/${slug}?view=resumo`}
        aria-current={mode === 'resumo' ? 'true' : undefined}
        scroll={false}
        onClick={() => setMode('resumo')}
      >
        <ListChecks size={14} aria-hidden="true" /> Resumo
      </Link>
    </div>
  );
}
