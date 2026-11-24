'use client';
import { useEffect, useState } from 'react';
import type { TocEntry } from '@/lib/enade/library/markdown';
import styles from './library.module.css';

/** "Nesta página" index with the section being read highlighted. */
export function TableOfContents({
  entries,
  inline = false,
}: {
  entries: TocEntry[];
  inline?: boolean;
}) {
  const [active, setActive] = useState(entries[0]?.id ?? '');
  useEffect(() => {
    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => !!el);
    if (!headings.length || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px' }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [entries]);
  if (!entries.length) return null;
  const list = (
    <nav className={styles.toc} aria-label="Nesta página">
      {entries.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          data-depth={entry.depth}
          aria-current={active === entry.id ? 'true' : undefined}
        >
          {entry.text}
        </a>
      ))}
    </nav>
  );
  if (inline)
    return (
      <details className={styles.tocInline}>
        <summary>Nesta página ({entries.filter((e) => e.depth === 2).length} seções)</summary>
        {list}
      </details>
    );
  return (
    <div className={styles.tocRail}>
      <p className={styles.tocTitle}>Nesta página</p>
      {list}
    </div>
  );
}
