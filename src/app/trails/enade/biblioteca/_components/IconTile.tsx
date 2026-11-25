import type { CSSProperties } from 'react';
import { categoryLook } from './categoryLook';
import styles from './gallery.module.css';

/** Notion-style page icon: the category glyph on a soft tile in its own hue. */
export function IconTile({ icon, size = 40 }: { icon?: string; size?: number }) {
  const look = categoryLook(icon);
  const Icon = look.icon;
  return (
    <span
      className={styles.iconTile}
      style={{ '--tile-hue': look.hue, '--tile-size': `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2.1} />
    </span>
  );
}

/** The CSS variable that tints cards and meters with the category hue. */
export function hueStyle(icon: string | undefined) {
  return { '--tile-hue': categoryLook(icon).hue } as CSSProperties;
}
