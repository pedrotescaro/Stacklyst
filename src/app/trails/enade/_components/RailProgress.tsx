'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PROGRESS_SECTIONS, isSectionActive } from './sections';
import styles from './EnadeRail.module.css';

/** The learner's personal pages, kept in the rail so the section tabs stay uncluttered. */
export function RailProgress() {
  const pathname = usePathname();
  return (
    <section className={styles.card} aria-labelledby="rail-progress">
      <h2 id="rail-progress" className={styles.cardTitle}>
        Meu progresso
      </h2>
      <ul>
        {PROGRESS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const active = isSectionActive(section, pathname);
          return (
            <li key={section.href}>
              <Link
                className={styles.link}
                href={section.href}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.linkIcon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
