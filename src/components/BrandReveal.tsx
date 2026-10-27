'use client';

import { BrandLogo } from './BrandLogo';
import styles from './BrandReveal.module.css';

export function BrandReveal({
  size = 72,
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
      <BrandLogo size={size} animated className={styles.wordmark} />
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
