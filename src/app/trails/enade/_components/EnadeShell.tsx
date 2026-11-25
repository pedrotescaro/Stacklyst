import type { ReactNode } from 'react';
import styles from './EnadeShell.module.css';

/**
 * Page header and content column of a hub page. The navigation around it is the
 * persistent `EnadeFrame`, mounted once by the ENADE layout.
 */
export function EnadeShell({
  title,
  description,
  actions,
  children,
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      {title && (
        <header className={styles.header}>
          <div>
            <h1>{title}</h1>
            {description && <div className={styles.description}>{description}</div>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
