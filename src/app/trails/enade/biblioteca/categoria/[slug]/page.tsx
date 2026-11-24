import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { loadLibrary } from '@/lib/enade/library/load';
import { loadStudyState, requireEnadeUser } from '@/lib/enade/hub.server';
import { questionsForTopic } from '@/lib/enade/topics';
import ui from '../../../_components/ui.module.css';
import styles from '../../_components/library.module.css';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireEnadeUser();
  const { slug } = await params;
  const library = loadLibrary();
  const category = library.categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const study = await loadStudyState(user.id);
  const studied = new Set(study.studied);
  const articles = library.articles.filter((a) => a.category === slug);
  const roots = articles.filter((a) => !a.parent);
  const childrenOf = (s: string) => articles.filter((a) => a.parent === s);
  const row = (a: (typeof articles)[number], depth = 0) => (
    <li key={a.slug} className={ui.row} style={{ paddingLeft: depth * 20 }}>
      <div className={ui.rowMain}>
        <p className={ui.rowTitle}>
          <Link href={`/trails/enade/biblioteca/${a.slug}`}>{a.title}</Link>{' '}
          {studied.has(a.slug) && (
            <span className={ui.badge} data-tone="success">
              Estudado
            </span>
          )}
        </p>
        <p className={ui.rowMeta}>
          <span>{a.summary}</span>
        </p>
        <p className={ui.rowMeta}>
          <span>{a.readingMinutes} min</span>
          <span>Nível {a.level}</span>
          {questionsForTopic(a.slug).length > 0 && (
            <span>{questionsForTopic(a.slug).length} questões oficiais</span>
          )}
        </p>
      </div>
    </li>
  );
  return (
    <div style={{ maxWidth: 860 }}>
      <nav className={styles.breadcrumbs} aria-label="Você está em">
        <Link href="/trails/enade/biblioteca">Biblioteca</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span aria-current="page">{category.title}</span>
      </nav>
      <h1 className={styles.articleTitle}>{category.title}</h1>
      <p className={styles.articleSummary}>{category.description}</p>
      <p className={styles.articleMeta}>
        <span>{articles.length} páginas</span>
        <span>{articles.filter((a) => studied.has(a.slug)).length} estudadas</span>
        <span>≈ {articles.reduce((s, a) => s + a.readingMinutes, 0)} min de leitura</span>
      </p>
      <ul className={ui.rows} style={{ marginTop: 20 }}>
        {roots.flatMap((a) => [row(a), ...childrenOf(a.slug).map((c) => row(c, 1))])}
      </ul>
    </div>
  );
}
