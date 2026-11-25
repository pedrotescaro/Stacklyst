'use client';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CheckCircle2,
  ChevronRight,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Star,
} from 'lucide-react';
import type { LibraryCategory } from '@/lib/enade/library/catalog';
import { LibrarySearch } from './LibrarySearch';
import { IconTile } from './IconTile';
import { splitTitle } from '@/lib/enade/library/title';
import styles from './library.module.css';

type Entry = { slug: string; title: string; category: string; parent: string | null };
const STORAGE = 'stacklyst:enade:library';

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`${STORAGE}:${key}`);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(`${STORAGE}:${key}`, JSON.stringify(value));
  } catch {
    /* Preferences are a convenience only. */
  }
}

export function LibraryFrame({
  categories,
  articles,
  studied,
  favorites,
  children,
}: {
  categories: LibraryCategory[];
  articles: Entry[];
  studied: string[];
  favorites: string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const current = pathname.split('/').at(-1) ?? '';
  const currentArticle = articles.find((a) => a.slug === current);
  const currentCategory =
    currentArticle?.category ?? (pathname.includes('/categoria/') ? current : null);
  const parentPath = useMemo(() => {
    const keys = new Set<string>();
    let parent = currentArticle?.parent;
    while (parent && !keys.has(`article:${parent}`)) {
      keys.add(`article:${parent}`);
      parent = articles.find((article) => article.slug === parent)?.parent;
    }
    return [...keys];
  }, [articles, currentArticle]);
  const [collapsed, setCollapsed] = useState(false);
  // Off until the first click, so restoring a saved state never plays the animation.
  const [animate, setAnimate] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    setCollapsed(read('collapsed', false));
    setOpen(read<string[]>('open', []));
  }, []);
  useEffect(() => {
    if (currentCategory)
      setOpen((items) => [...new Set([...items, currentCategory, ...parentPath])]);
    setMobileOpen(false);
  }, [currentCategory, parentPath, pathname]);
  const studiedSet = useMemo(() => new Set(studied), [studied]);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const toggleBranch = (slug: string) => {
    const next = open.includes(slug) ? open.filter((s) => s !== slug) : [...open, slug];
    setOpen(next);
    write('open', next);
  };
  const toggleCollapsed = () => {
    setAnimate(true);
    setCollapsed(!collapsed);
    write('collapsed', !collapsed);
  };
  const renderArticles = (list: Entry[], depth = 0): ReactNode => (
    <ul className={styles.treeList} data-depth={depth}>
      {list.map((article) => {
        const children = articles.filter((a) => a.parent === article.slug);
        const active = article.slug === current;
        const fold = `article:${article.slug}`;
        const expanded = open.includes(fold);
        const favorite = favoriteSet.has(article.slug);
        const done = studiedSet.has(article.slug);
        return (
          <li key={article.slug}>
            <div className={styles.treeBranch}>
              {children.length > 0 && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => toggleBranch(fold)}
                  aria-label={`${expanded ? 'Recolher' : 'Expandir'} subpáginas de ${article.title}`}
                >
                  <ChevronRight size={14} aria-hidden="true" className={styles.chevron} />
                </button>
              )}
              <Link
                href={`/trails/enade/biblioteca/${article.slug}`}
                className={styles.treeLink}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.treeTitle} title={article.title}>
                  {splitTitle(article.title).main}
                </span>
                {favorite && (
                  <Star
                    size={12}
                    aria-hidden="true"
                    className={styles.treeStar}
                    fill="currentColor"
                  />
                )}
                {done && <CheckCircle2 size={13} aria-hidden="true" className={styles.treeDone} />}
                {(favorite || done) && (
                  <span className="sr-only">
                    {favorite ? ' · Favorito' : ''}
                    {done ? ' · Estudado' : ''}
                  </span>
                )}
              </Link>
            </div>
            {expanded && children.length > 0 && renderArticles(children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );
  return (
    <div className={styles.frame} data-collapsed={collapsed} data-animate={animate}>
      <div className={styles.mobileTools}>
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="library-tree"
        >
          <Library size={16} aria-hidden="true" /> Conteúdos
        </button>
        <button type="button" className={styles.searchButton} onClick={() => setSearching(true)}>
          <Search size={16} aria-hidden="true" /> Pesquisar
        </button>
      </div>
      <aside
        id="library-tree"
        className={styles.sidebar}
        data-open={mobileOpen}
        aria-label="Navegação da biblioteca"
      >
        <div className={styles.sidebarTop}>
          <button type="button" className={styles.searchButton} onClick={() => setSearching(true)}>
            <Search size={15} aria-hidden="true" />
            <span>Pesquisar</span>
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={toggleCollapsed}
            aria-controls="library-tree"
            aria-expanded="true"
            aria-label="Recolher navegação"
            title="Recolher navegação"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
        <Link
          href="/trails/enade/biblioteca"
          className={styles.treeLink}
          aria-current={pathname === '/trails/enade/biblioteca' ? 'page' : undefined}
        >
          <Library size={14} aria-hidden="true" />{' '}
          <span className={styles.treeTitle}>Início da biblioteca</span>
        </Link>
        <nav>
          {categories.map((category) => {
            const expanded = open.includes(category.slug);
            const list = articles.filter((a) => a.category === category.slug && !a.parent);
            const total = articles.filter((a) => a.category === category.slug);
            const done = total.filter((a) => studiedSet.has(a.slug)).length;
            return (
              <div key={category.slug} className={styles.treeGroup}>
                <div className={styles.treeCategory}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggleBranch(category.slug)}
                    aria-label={`${expanded ? 'Recolher' : 'Expandir'} ${category.title}`}
                  >
                    <ChevronRight size={14} aria-hidden="true" className={styles.chevron} />
                  </button>
                  <Link
                    href={`/trails/enade/biblioteca/categoria/${category.slug}`}
                    aria-current={
                      pathname.endsWith(`/categoria/${category.slug}`) ? 'page' : undefined
                    }
                    className={styles.treeCategoryLink}
                  >
                    <IconTile icon={category.icon} size={22} />
                    <span>{category.title}</span>
                  </Link>
                  <span className={styles.treeCount}>
                    {done}/{total.length}
                  </span>
                </div>
                {expanded && renderArticles(list)}
              </div>
            );
          })}
        </nav>
      </aside>
      {collapsed && (
        <div className={styles.collapsedTools}>
          <button
            type="button"
            className={styles.expandButton}
            onClick={toggleCollapsed}
            aria-controls="library-tree"
            aria-expanded="false"
            aria-label="Mostrar navegação"
            title="Mostrar navegação"
          >
            <PanelLeftOpen size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.expandButton}
            onClick={() => setSearching(true)}
            aria-label="Pesquisar na biblioteca"
            title="Pesquisar"
          >
            <Search size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      <div className={styles.page}>
        <div className={styles.pageInner}>{children}</div>
      </div>
      {searching && <LibrarySearch onClose={() => setSearching(false)} />}
    </div>
  );
}
