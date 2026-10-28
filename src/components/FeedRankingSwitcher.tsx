'use client';

import Link from 'next/link';
import { BarChart2, Newspaper } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './FeedRankingSwitcher.module.css';

export const feedRankingSurfaceClassName = styles.surface;

export function FeedRankingSwitcher({ active }: { active: 'feed' | 'ranking' }) {
  const { text } = useLocalizedText();
  const links = [
    { id: 'feed' as const, href: '/feed', label: 'Feed', icon: Newspaper },
    { id: 'ranking' as const, href: '/ranking', label: 'Ranking', icon: BarChart2 },
  ].sort((a, b) => Number(b.id === active) - Number(a.id === active));

  return (
    <nav className={styles.switcher} aria-label={text('Feed e ranking', 'Feed and ranking')}>
      {links.map(({ id, href, label, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          aria-current={id === active ? 'page' : undefined}
          aria-label={
            id === active
              ? label
              : id === 'feed'
                ? text('Voltar ao feed', 'Back to feed')
                : text('Ver ranking', 'View ranking')
          }
          title={label}
          className={id === active ? styles.active : styles.inactive}
        >
          <Icon aria-hidden="true" size={19} />
          {id === active && <span className={styles.label}>{label}</span>}
        </Link>
      ))}
    </nav>
  );
}
