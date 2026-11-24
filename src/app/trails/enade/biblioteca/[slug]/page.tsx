import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ChevronRight, Clock3, History, ListChecks } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { loadLibrary } from '@/lib/enade/library/load';
import { summaryBlocks } from '@/lib/enade/library/markdown';
import { requireEnadeUser } from '@/lib/enade/hub.server';
import { questionsForTopic } from '@/lib/enade/topics';
import { shortDate } from '@/lib/enade/format';
import { ArticleBody } from '../_components/ArticleBody';
import { ArticleActions } from '../_components/ArticleActions';
import { TableOfContents } from '../_components/TableOfContents';
import { StartAttemptButton } from '../../_components/StartAttemptButton';
import styles from '../_components/library.module.css';
import ui from '../../_components/ui.module.css';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = loadLibrary().bySlug.get(slug);
  return { title: article ? `${article.title} · Biblioteca ENADE` : 'Biblioteca ENADE' };
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireEnadeUser();
  const { slug } = await params;
  const { view } = await searchParams;
  const library = loadLibrary();
  const article = library.bySlug.get(slug);
  if (!article) notFound();
  const summary = view === 'resumo';
  const [progress, favorite] = await Promise.all([
    prisma.enadeStudyProgress.findUnique({
      where: { user_id_article_slug: { user_id: user.id, article_slug: slug } },
    }),
    prisma.enadeFavorite.findUnique({
      where: { user_id_kind_ref: { user_id: user.id, kind: 'ARTICLE', ref: slug } },
    }),
  ]);
  const category = library.categories.find((c) => c.slug === article.category)!;
  const parent = article.parent ? library.bySlug.get(article.parent) : null;
  const siblings = library.articles.filter((a) => a.category === article.category);
  const index = siblings.findIndex((a) => a.slug === slug);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];
  const children = library.articles.filter((a) => a.parent === slug);
  const related = article.related.map((s) => library.bySlug.get(s)).filter((a) => !!a);
  const official = questionsForTopic(slug);
  const blocks = summary ? summaryBlocks(article.blocks) : article.blocks;
  const toc = summary ? [] : article.toc;
  return (
    <div className={styles.articleGrid}>
      <article aria-labelledby="article-title">
        <nav className={styles.breadcrumbs} aria-label="Você está em">
          <Link href="/trails/enade/biblioteca">Biblioteca</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link href={`/trails/enade/biblioteca/categoria/${category.slug}`}>{category.title}</Link>
          {parent && (
            <>
              <ChevronRight size={12} aria-hidden="true" />
              <Link href={`/trails/enade/biblioteca/${parent.slug}`}>{parent.title}</Link>
            </>
          )}
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">{article.title}</span>
        </nav>
        <h1 id="article-title" className={styles.articleTitle}>
          {article.title}
        </h1>
        <p className={styles.articleSummary}>{article.summary}</p>
        <p className={styles.articleMeta}>
          <span>
            <Clock3
              size={13}
              aria-hidden="true"
              style={{ display: 'inline', verticalAlign: '-2px' }}
            />{' '}
            {article.readingMinutes} min de leitura
          </span>
          <span>Nível {article.level}</span>
          <span>
            <History
              size={13}
              aria-hidden="true"
              style={{ display: 'inline', verticalAlign: '-2px' }}
            />{' '}
            versão {article.version} · revisado em {shortDate(`${article.updated}T12:00:00Z`)}
          </span>
          {official.length > 0 && <span>{official.length} questões oficiais relacionadas</span>}
        </p>
        <div className={styles.articleActions}>
          <div className={styles.viewSwitch} role="group" aria-label="Modo de leitura">
            <Link
              href={`/trails/enade/biblioteca/${slug}`}
              aria-current={!summary ? 'true' : undefined}
              scroll={false}
            >
              <BookOpen size={14} aria-hidden="true" /> Completo
            </Link>
            <Link
              href={`/trails/enade/biblioteca/${slug}?view=resumo`}
              aria-current={summary ? 'true' : undefined}
              scroll={false}
            >
              <ListChecks size={14} aria-hidden="true" /> Resumo
            </Link>
          </div>
          <ArticleActions
            key={slug}
            slug={slug}
            title={article.title}
            studied={!!progress?.studied}
            favorite={!!favorite}
          />
        </div>
        {summary && (
          <p className={styles.summaryNote}>
            Definições, comparações e dicas para revisar os conceitos.
          </p>
        )}
        <TableOfContents entries={toc} inline />
        <ArticleBody
          blocks={blocks}
          slug={slug}
          quizBest={{ best: progress?.quiz_best ?? null, total: progress?.quiz_total ?? null }}
        />
        {children.length > 0 && (
          <section className={styles.related} aria-labelledby="children-title">
            <h2 id="children-title">Subpáginas</h2>
            <ul>
              {children.map((child) => (
                <li key={child.slug}>
                  <Link href={`/trails/enade/biblioteca/${child.slug}`}>
                    {child.title} <span>{child.readingMinutes} min</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {official.length > 0 && (
          <section className={styles.related} aria-labelledby="practice-title">
            <h2 id="practice-title">Pratique com questões oficiais</h2>
            <p className={ui.muted} style={{ marginTop: 4 }}>
              {official.length} {official.length === 1 ? 'questão objetiva' : 'questões objetivas'}{' '}
              do Inep sobre este assunto, com correção comentada.
            </p>
            <div className={ui.filters} style={{ marginTop: 10 }}>
              <StartAttemptButton
                payload={{ kind: 'TOPIC', topic: slug, limit: 10, mode: 'training' }}
              >
                Praticar agora
              </StartAttemptButton>
              <Link className={ui.secondary} href={`/trails/enade/questoes?assunto=${slug}`}>
                Ver no banco de questões
              </Link>
            </div>
          </section>
        )}
        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-title">
            <h2 id="related-title">Assuntos relacionados</h2>
            <ul>
              {related.map((r) => (
                <li key={r!.slug}>
                  <Link href={`/trails/enade/biblioteca/${r!.slug}`}>
                    {r!.title}{' '}
                    <span>{library.categories.find((c) => c.slug === r!.category)?.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <nav className={styles.pager} aria-label="Navegação entre assuntos">
          {previous ? (
            <Link href={`/trails/enade/biblioteca/${previous.slug}`}>
              <span>← Anterior</span>
              {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/trails/enade/biblioteca/${next.slug}`}>
              <span>Próximo →</span>
              {next.title}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
      <TableOfContents entries={toc} />
    </div>
  );
}
