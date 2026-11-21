'use client';

import type { CSSProperties } from 'react';
import { BrandWordmarkTrace } from './BrandWordmarkTrace';
import styles from './BrandReveal.module.css';

export function BrandReveal({
  size = 44,
  className = '',
  title,
  subtitle,
}: {
  size?: number;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className={`${styles.reveal} ${className}`} role="status" aria-live="polite">
      <span
        className={styles.wordmark}
        role="img"
        aria-label="Stacklyst"
        style={{ '--reveal-size': `${size}px` } as CSSProperties}
      >
        <BrandWordmarkTrace />
      </span>
      {(title || subtitle) && (
        <div className={styles.copy}>
          {title && <p className={styles.title}>{title}</p>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      {!title && <span className="sr-only">Carregando Stacklyst</span>}
    </div>
  );
}
