import Link from 'next/link';
import { loadLibrary } from '@/lib/enade/library/load';
import { topicFrequency } from '@/lib/enade/topics';
import { RailProgress } from './RailProgress';
import styles from './EnadeRail.module.css';
import { plural } from '@/lib/enade/format';

/**
 * Right column of the hub, in the platform's rail style. Everything here comes from
 * the content and the official question bank, so it renders without database work.
 */
export function EnadeRail() {
  const { categories, articles } = loadLibrary();
  const categoryTitle = new Map(categories.map((c) => [c.slug, c.title]));
  const frequency = topicFrequency();
  const trending = articles
    .filter((a) => (frequency.get(a.slug) ?? 0) > 0)
    .sort((a, b) => (frequency.get(b.slug) ?? 0) - (frequency.get(a.slug) ?? 0))
    .slice(0, 5);
  return (
    <aside className={styles.rail} aria-label="Atalhos da Central ENADE">
      <RailProgress />

      <section className={styles.card} aria-labelledby="rail-trending">
        <h2 id="rail-trending" className={styles.cardTitle}>
          Mais cobrados no ENADE
        </h2>
        <ol>
          {trending.map((article, index) => (
            <li key={article.slug}>
              <Link className={styles.item} href={`/trails/enade/biblioteca/${article.slug}`}>
                <span className={styles.kicker}>
                  {index + 1} · {categoryTitle.get(article.category) ?? 'Biblioteca'}
                </span>
                <strong>{article.title}</strong>
                <span className={styles.meta}>
                  {plural(frequency.get(article.slug) ?? 0, 'questão oficial', 'questões oficiais')}
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <Link className={styles.more} href="/trails/enade/biblioteca">
          Abrir a biblioteca
        </Link>
      </section>

      <p className={styles.footer}>
        Questões e gabaritos das provas oficiais do Inep. Explicações e materiais da equipe
        Stacklyst, sem vínculo com o Inep. © 2026 Stacklyst
      </p>
    </aside>
  );
}
