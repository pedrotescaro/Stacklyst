import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Flame, Library } from 'lucide-react';
import { loadLibrary } from '@/lib/enade/library/load';
import { loadStudyState, requireEnadeUserId } from '@/lib/enade/hub.server';
import { topicFrequency } from '@/lib/enade/topics';
import { IconTile, hueStyle } from './_components/IconTile';
import { splitTitle } from '@/lib/enade/library/title';
import styles from './_components/gallery.module.css';
import { plural } from '@/lib/enade/format';

export const metadata = { title: 'Biblioteca ENADE · Stacklyst' };

export default async function LibraryHome() {
  const userId = await requireEnadeUserId();
  const study = await loadStudyState(userId);
  const { categories, articles, bySlug } = loadLibrary();
  const studied = new Set(study.studied);
  const frequency = topicFrequency();
  const categoryOf = new Map(categories.map((c) => [c.slug, c]));
  const mostAsked = [...articles]
    .filter((a) => (frequency.get(a.slug) ?? 0) > 0)
    .sort((a, b) => (frequency.get(b.slug) ?? 0) - (frequency.get(a.slug) ?? 0))
    .slice(0, 6);
  const hours = Math.round(articles.reduce((sum, a) => sum + a.readingMinutes, 0) / 60);
  const done = articles.filter((a) => studied.has(a.slug)).length;
  const share = articles.length ? Math.round((done / articles.length) * 100) : 0;
  const lastRead = [...study.progress].sort(
    (a, b) => b.last_read_at.getTime() - a.last_read_at.getTime()
  )[0];
  const resume = lastRead ? bySlug.get(lastRead.article_slug) : null;

  return (
    <div>
      <header className={styles.hero}>
        <span
          className={styles.iconTile}
          style={{ '--tile-hue': 211, '--tile-size': '48px' } as CSSProperties}
        >
          <Library size={24} strokeWidth={2.1} aria-hidden="true" />
        </span>
        <h1 className={styles.heroTitle}>Biblioteca de estudos</h1>
        <p className={styles.heroLead}>
          Toda a teoria do ENADE de ADS em páginas curtas: o que é, para que serve, como funciona,
          como cai na prova e um miniquestionário no fim.
        </p>
        <div className={styles.statRow}>
          <span className={styles.stat}>
            <BookOpen size={14} aria-hidden="true" /> <strong>{articles.length}</strong> páginas
          </span>
          <span className={styles.stat}>
            <strong>{categories.length}</strong> assuntos
          </span>
          <span className={styles.stat}>
            <Clock3 size={14} aria-hidden="true" /> ≈ <strong>{hours} h</strong> de leitura
          </span>
          <span className={styles.stat}>
            Pesquisar <kbd>Ctrl</kbd>
            <kbd>K</kbd>
          </span>
        </div>
      </header>

      <div className={styles.progressCard}>
        <div>
          <strong>Seu progresso na biblioteca</strong>
          <div className={styles.bigMeter} aria-hidden="true">
            <span style={{ width: `${share}%` }} />
          </div>
          <small>
            {done} de {articles.length} páginas estudadas · {share}%
          </small>
        </div>
        {resume ? (
          <Link className={styles.continueCard} href={`/trails/enade/biblioteca/${resume.slug}`}>
            <IconTile icon={categoryOf.get(resume.category)?.icon} size={36} />
            <div>
              <small>Continuar de onde parou</small>
              <b>{splitTitle(resume.title).main}</b>
            </div>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          mostAsked[0] && (
            <Link
              className={styles.continueCard}
              href={`/trails/enade/biblioteca/${mostAsked[0].slug}`}
            >
              <IconTile icon={categoryOf.get(mostAsked[0].category)?.icon} size={36} />
              <div>
                <small>Comece pelo mais cobrado</small>
                <b>{splitTitle(mostAsked[0].title).main}</b>
              </div>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )
        )}
      </div>

      <section aria-labelledby="library-categories">
        <div className={styles.blockTitle}>
          <h2 id="library-categories">Assuntos</h2>
          <p>Escolha um assunto e siga as páginas na ordem.</p>
        </div>
        <ul className={styles.gallery}>
          {categories.map((category) => {
            const list = articles.filter((a) => a.category === category.slug);
            const read = list.filter((a) => studied.has(a.slug)).length;
            const minutes = list.reduce((sum, a) => sum + a.readingMinutes, 0);
            return (
              <li key={category.slug}>
                <Link
                  className={styles.galleryCard}
                  href={`/trails/enade/biblioteca/categoria/${category.slug}`}
                  style={hueStyle(category.icon)}
                >
                  <IconTile icon={category.icon} />
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <span className={styles.galleryFoot}>
                    <span>
                      <span>
                        {list.length} páginas · {minutes} min
                      </span>
                      <span>
                        {read}/{list.length}
                      </span>
                    </span>
                    <span className={styles.thinMeter} aria-hidden="true">
                      <span style={{ width: `${list.length ? (read / list.length) * 100 : 0}%` }} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {mostAsked.length > 0 && (
        <section aria-labelledby="most-asked">
          <div className={styles.blockTitle}>
            <h2 id="most-asked">
              <Flame size={18} aria-hidden="true" style={{ display: 'inline', color: '#ff7a1a' }} />{' '}
              Mais cobrados no ENADE
            </h2>
            <p>Questões oficiais por assunto, edições 2008 a 2021.</p>
          </div>
          <ol className={styles.trending}>
            {mostAsked.map((article, index) => (
              <li key={article.slug}>
                <Link href={`/trails/enade/biblioteca/${article.slug}`}>
                  <span className={styles.rank}>{index + 1}</span>
                  <span>
                    <strong>{splitTitle(article.title).main}</strong>
                    <small>
                      <span>{categoryOf.get(article.category)?.title}</span>
                      <span>{plural(frequency.get(article.slug) ?? 0, 'questão', 'questões')}</span>
                      {studied.has(article.slug) && (
                        <span style={{ color: 'var(--enade-success)' }}>
                          <CheckCircle2
                            size={12}
                            aria-hidden="true"
                            style={{ display: 'inline', verticalAlign: '-2px' }}
                          />{' '}
                          Estudado
                        </span>
                      )}
                    </small>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className={styles.footnote}>
        Conteúdo autoral da equipe Stacklyst, revisado e com referências em cada página. Exercícios
        dos miniquestionários são autorais; questões oficiais são sempre identificadas como Inep.
      </p>
    </div>
  );
}
