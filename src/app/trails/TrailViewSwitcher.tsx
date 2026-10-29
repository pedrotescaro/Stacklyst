'use client';

import { List, Network } from 'lucide-react';
import styles from '@/components/FeedRankingSwitcher.module.css';

export function TrailViewSwitcher({
  active,
  onChange,
}: {
  active: 'map' | 'trail';
  onChange: (mode: 'map' | 'trail') => void;
}) {
  const options = [
    { id: 'map' as const, label: 'Mapa', Icon: Network },
    { id: 'trail' as const, label: 'Trilha', Icon: List },
  ].sort((a, b) => Number(b.id === active) - Number(a.id === active));
  return (
    <div className={styles.switcher} role="group" aria-label="Visualização do aprendizado">
      {options.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          title={label}
          aria-pressed={id === active}
          onClick={() => {
            if (id !== active) onChange(id);
          }}
          className={id === active ? styles.active : styles.inactive}
        >
          <Icon size={19} aria-hidden="true" />
          {id === active && <span className={styles.label}>{label}</span>}
        </button>
      ))}
    </div>
  );
}
