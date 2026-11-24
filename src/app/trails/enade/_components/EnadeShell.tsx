'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  BrainCircuit,
  ClipboardList,
  History,
  LayoutDashboard,
  LineChart,
  List,
  ListChecks,
  NotebookPen,
  Star,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { LegacyDraftRecovery } from './LegacyDraftRecovery';
import styles from './EnadeShell.module.css';

export const ENADE_SECTIONS = [
  { href: '/trails/enade', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/trails/enade/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { href: '/trails/enade/simulados', label: 'Simulados', icon: ClipboardList },
  { href: '/trails/enade/questoes', label: 'Banco de questões', icon: ListChecks },
  { href: '/trails/enade/historico', label: 'Meu histórico', icon: History },
  { href: '/trails/enade/evolucao', label: 'Minha evolução', icon: LineChart },
  { href: '/trails/enade/erros', label: 'Caderno de erros', icon: NotebookPen },
  { href: '/trails/enade/favoritos', label: 'Favoritos', icon: Star },
  { href: '/trails/enade/revisao', label: 'Revisão inteligente', icon: BrainCircuit },
] as const;

type ShellUser = NonNullable<Parameters<typeof Sidebar>[0]['user']>;

export function EnadeShell({
  user,
  title,
  description,
  actions,
  wide = false,
  children,
}: {
  user: ShellUser;
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const tabs = useRef<HTMLUListElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const activeSection = ENADE_SECTIONS.find(
    (section) =>
      pathname === section.href ||
      (!('exact' in section) && pathname.startsWith(`${section.href}/`))
  );
  useEffect(() => {
    const list = tabs.current;
    const active = list?.querySelector('[aria-current="page"]');
    if (!list || !active) return;
    const tabBounds = active.getBoundingClientRect();
    const listBounds = list.getBoundingClientRect();
    if (tabBounds.right > listBounds.right) list.scrollLeft += tabBounds.right - listBounds.right;
    else if (tabBounds.left < listBounds.left) list.scrollLeft -= listBounds.left - tabBounds.left;
  }, [pathname]);
  return (
    <div className="dd-platform-shell dd-platform-shell--workspace relative min-h-screen bg-dd-bg">
      <Sidebar user={user} />
      <div className="dd-platform-body flex w-full min-w-0 flex-grow">
        <main className={`dd-platform-main ${styles.main}`} data-wide={wide}>
          <nav className={styles.nav} aria-label="Central ENADE">
            <Link href="/trails" className={styles.back}>
              ← Trilhas
            </Link>
            <ul ref={tabs} className={styles.tabs}>
              {ENADE_SECTIONS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={activeSection?.href === href ? 'page' : undefined}
                    className={styles.tab}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <details
              className={styles.navMenu}
              ref={menu}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  event.currentTarget.open = false;
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Escape' || !event.currentTarget.open) return;
                event.currentTarget.open = false;
                event.currentTarget.querySelector('summary')?.focus();
              }}
            >
              <summary aria-label="Todas as seções do ENADE" title="Todas as seções do ENADE">
                <List size={20} aria-hidden="true" />
              </summary>
              <ul>
                {ENADE_SECTIONS.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={activeSection?.href === href ? 'page' : undefined}
                      onClick={() => {
                        if (menu.current) menu.current.open = false;
                      }}
                    >
                      <Icon size={16} aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </nav>
          {title && (
            <header className={styles.header}>
              <div>
                <p className={styles.eyebrow}>ENADE · Análise e Desenvolvimento de Sistemas</p>
                <h1>{title}</h1>
                {description && <div className={styles.description}>{description}</div>}
              </div>
              {actions && <div className={styles.actions}>{actions}</div>}
            </header>
          )}
          <div className={styles.content}>
            <LegacyDraftRecovery userId={user.id} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
