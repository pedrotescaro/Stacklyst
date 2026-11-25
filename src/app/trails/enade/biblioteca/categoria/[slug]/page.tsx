import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, ChevronRight, Clock3, Flame, Gauge } from 'lucide-react';
import { loadLibrary } from '@/lib/enade/library/load';
import { loadStudyState, requireEnadeUserId } from '@/lib/enade/hub.server';
import { questionsForTopic } from '@/lib/enade/topics';
import { plural } from '@/lib/enade/format';
import { IconTile, hueStyle } from '../../_components/IconTile';
import { splitTitle } from '@/lib/enade/library/title';
import styles from '../../_components/gallery.module.css';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = loadLibrary().categories.find((c) => c.slug === slug);
  return { title: category ? `${category.title} · Biblioteca ENADE` : 'Biblioteca ENADE' };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const userId = await requireEnadeUserId();
  const { slug } = await params;
  const library = loadLibrary();
  const category = library.categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const study = await loadStudyState(userId);
  const studied = new Set(study.studied);
  const articles = library.articles.filter((a) => a.category === slug);
  const roots = articles.filter((a) => !a.parent);
  const childrenOf = (s: string) => articles.filter((a) => a.parent === s);
  const ordered = roots.flatMap((a) => [
    { article: a, depth: 0 },
    ...childrenOf(a.slug).map((c) => ({ article: c, depth: 1 })),
  ]);
  const done = articles.filter((a) => studied.has(a.slug)).length;
  const minutes = articles.reduce((s, a) => s + a.readingMinutes, 0);
  const share = articles.length ? Math.round((done / articles.length) * 100) : 0;
  const next = ordered.find(({ article }) => !studied.has(article.slug))?.article;

  return (
    <div style={hueStyle(category.icon)}>
      <header className={styles.hero}>
        <IconTile icon={category.icon} size={48} />
        <nav className={styles.breadcrumbs} aria-label="Você está em">
          <Link href="/trails/enade/biblioteca">Biblioteca</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">{category.title}</span>
        </nav>
        <h1 className={styles.heroTitle}>{category.title}</h1>
        <p className={styles.heroLead}>{category.description}</p>
        <div className={styles.statRow}>
          <span className={styles.stat}>
            <strong>{articles.length}</strong> páginas
          </span>
          <span className={styles.stat}>
            <Clock3 size={14} aria-hidden="true" /> <strong>{minutes} min</strong> de leitura
          </span>
          <span className={styles.stat}>
            <CheckCircle2 size={14} aria-hidden="true" /> <strong>{done}</strong> estudadas
          </span>
        </div>
      </header>

      <div className={styles.progressCard}>
        <div>
          <strong>Progresso neste assunto</strong>
          <div className={styles.bigMeter} aria-hidden="true">
            <span style={{ width: `${share}%` }} />
          </div>
          <small>
            {done} de {articles.length} páginas · {share}%
          </small>
        </div>
        {next && (
          <Link className={styles.continueCard} href={`/trails/enade/biblioteca/${next.slug}`}>
            <IconTile icon={category.icon} size={36} />
            <div>
              <small>{done ? 'Próxima página' : 'Comece por aqui'}</small>
              <b>{splitTitle(next.title).main}</b>
            </div>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className={styles.blockTitle}>
        <h2>Páginas</h2>
        <p>Na ordem sugerida de estudo.</p>
      </div>
      <ol className={styles.pageList}>
        {ordered.map(({ article, depth }, index) => {
          const isDone = studied.has(article.slug);
          const official = questionsForTopic(article.slug).length;
          return (
            <li key={article.slug} className={styles.pageItem} data-depth={depth}>
              <Link className={styles.pageCard} href={`/trails/enade/biblioteca/${article.slug}`}>
                <span className={styles.pageNumber} data-done={isDone}>
                  {isDone ? <CheckCircle2 size={16} aria-label="Estudado" /> : index + 1}
                </span>
                <div className={styles.pageBody}>
                  <h3>{splitTitle(article.title).main}</h3>
                  {splitTitle(article.title).detail && (
                    <p className={styles.pageDetail}>{splitTitle(article.title).detail}</p>
                  )}
                  <p>{article.summary}</p>
                  <span className={styles.chips}>
                    <span className={styles.chip}>
                      <Clock3 size={12} aria-hidden="true" /> {article.readingMinutes} min
                    </span>
                    <span className={styles.chip}>
                      <Gauge size={12} aria-hidden="true" /> {article.level}
                    </span>
                    {official > 0 && (
                      <span className={styles.chip} data-tone={official >= 5 ? 'hot' : undefined}>
                        <Flame size={12} aria-hidden="true" />{' '}
                        {plural(official, 'questão oficial', 'questões oficiais')}
                      </span>
                    )}
                    {isDone && (
                      <span className={styles.chip} data-tone="done">
                        Estudado
                      </span>
                    )}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
