'use client';
import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { LegacyDraftRecovery } from './LegacyDraftRecovery';
import { PRIMARY_SECTIONS, PROGRESS_SECTIONS, isSectionActive } from './sections';
import styles from './EnadeShell.module.css';

/** A running or reviewed attempt is a focused, full-screen activity without the hub chrome. */
const FOCUSED_ROUTE = /^\/trails\/enade\/simulados\/[^/]+\/?$/;

type ShellUser = NonNullable<Parameters<typeof Sidebar>[0]['user']>;

/**
 * Persistent frame of the ENADE hub, mounted once by the route layout: sidebar, a
 * timeline-style column with sticky title and tabs, and the right rail. Because it
 * survives navigation only the page content swaps while the tabs and rail animate.
 */
export function EnadeFrame({
  user,
  rail,
  children,
}: {
  user: ShellUser;
  rail: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [pending, setPending] = useState<string | null>(null);
  // While the next page loads, the tab switches at once so the click feels instant.
  const current = pending ?? pathname;
  const section = [...PRIMARY_SECTIONS, ...PROGRESS_SECTIONS].find((item) =>
    isSectionActive(item, current)
  );
  const activeHref = section?.href ?? null;
  const library = pathname.startsWith('/trails/enade/biblioteca');

  useEffect(() => {
    setPending(null);
  }, [pathname]);

  if (FOCUSED_ROUTE.test(pathname)) return <>{children}</>;

  const go = (href: string) => (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (href !== pathname) setPending(href);
  };

  return (
    <div
      className={`dd-platform-shell dd-platform-shell--workspace relative min-h-screen bg-dd-bg ${styles.root}`}
    >
      <Sidebar user={user} />
      <div className="dd-platform-body flex w-full min-w-0 flex-grow items-start">
        <main data-library={library} className={`dd-platform-main w-full flex-grow ${styles.main}`}>
          <div className={styles.topbar}>
            <div className={styles.titleRow}>
              <Link
                href="/trails"
                className={styles.back}
                aria-label="Voltar às trilhas"
                title="Voltar às trilhas"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </Link>
              <strong className={styles.titleText}>Central ENADE</strong>
            </div>
            <nav className={styles.tabs} aria-label="Seções da Central ENADE">
              <ul className={styles.tabList}>
                {[...PRIMARY_SECTIONS, ...PROGRESS_SECTIONS].map((item, index) => {
                  const personal = index >= PRIMARY_SECTIONS.length;
                  return (
                    <li
                      key={item.href}
                      className={personal ? styles.personalTab : undefined}
                      data-first-personal={index === PRIMARY_SECTIONS.length || undefined}
                    >
                      <Link
                        href={item.href}
                        className={styles.tab}
                        aria-current={isSectionActive(item, pathname) ? 'page' : undefined}
                        data-selected={item.href === activeHref}
                        title={item.label}
                        aria-label={item.label}
                        onClick={go(item.href)}
                      >
                        <item.icon size={18} aria-hidden="true" className={styles.tabIcon} />
                        <span className={styles.tabText}>
                          <span>{item.label}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          <div className={styles.notices}>
            <LegacyDraftRecovery userId={user.id} />
          </div>
          {children}
        </main>
        <div className={styles.railSlot} data-collapsed={library} inert={library}>
          {rail}
        </div>
      </div>
    </div>
  );
}
