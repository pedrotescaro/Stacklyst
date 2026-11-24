import Link from 'next/link';
import { loadLibrary } from '@/lib/enade/library/load';
import { loadStudyState, requireEnadeUser } from '@/lib/enade/hub.server';
import { topicFrequency } from '@/lib/enade/topics';
import styles from '../_components/ui.module.css';
import library from './_components/library.module.css';

export const metadata = { title: 'Biblioteca ENADE · Stacklyst' };

export default async function LibraryHome() {
  const user = await requireEnadeUser();
  const study = await loadStudyState(user.id);
  const { categories, articles } = loadLibrary();
  const studied = new Set(study.studied);
  const frequency = topicFrequency();
  const mostAsked = [...articles]
    .filter((a) => (frequency.get(a.slug) ?? 0) > 0)
    .sort((a, b) => (frequency.get(b.slug) ?? 0) - (frequency.get(a.slug) ?? 0))
    .slice(0, 8);
  const minutes = articles.reduce((sum, a) => sum + a.readingMinutes, 0);
  return (
    <div style={{ maxWidth: 860 }}>
      <h1 className={library.articleTitle} style={{ marginTop: 0 }}>
        Biblioteca de estudos
      </h1>
      <p className={library.articleSummary}>
        Teoria completa para o ENADE de ADS, do básico às pegadinhas de prova. Cada página explica o
        que é, para que serve e como funciona, compara conceitos parecidos, mostra como o assunto
        cai no exame e termina com resumo e miniquestionário.
      </p>
      <p className={library.articleMeta}>
        <span>{articles.length} páginas</span>
        <span>{categories.length} categorias</span>
        <span>≈ {Math.round(minutes / 60)} h de leitura</span>
        <span>
          {studied.size} de {articles.length} estudadas
        </span>
        <span>Use Ctrl K para pesquisar</span>
      </p>
      {mostAsked.length > 0 && (
        <section className={styles.section} aria-labelledby="most-asked">
          <div className={styles.sectionHead}>
            <h2 id="most-asked">Mais cobrados nas provas oficiais</h2>
            <p>Contagem de questões das edições 2008–2021 por assunto.</p>
          </div>
          <ul className={styles.rows}>
            {mostAsked.map((a) => (
              <li key={a.slug} className={styles.row} style={{ padding: '10px 0' }}>
                <div className={styles.rowMain}>
                  <Link className={styles.rowTitle} href={`/trails/enade/biblioteca/${a.slug}`}>
                    {a.title}
                  </Link>
                </div>
                <span className={styles.muted}>{frequency.get(a.slug)} questões</span>
                {studied.has(a.slug) && (
                  <span className={styles.badge} data-tone="success">
                    Estudado
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {categories.map((category) => {
        const list = articles.filter((a) => a.category === category.slug);
        return (
          <section
            key={category.slug}
            className={styles.section}
            aria-labelledby={`cat-${category.slug}`}
          >
            <div className={styles.sectionHead}>
              <h2 id={`cat-${category.slug}`}>
                <Link href={`/trails/enade/biblioteca/categoria/${category.slug}`}>
                  {category.title}
                </Link>
              </h2>
              <p>
                {list.filter((a) => studied.has(a.slug)).length}/{list.length} estudadas
              </p>
            </div>
            <p className={styles.muted} style={{ marginBottom: 8 }}>
              {category.description}
            </p>
            <ul className={styles.rows}>
              {list.map((a) => (
                <li key={a.slug} className={styles.row} style={{ padding: '9px 0' }}>
                  <div className={styles.rowMain}>
                    <Link
                      className={styles.rowTitle}
                      style={{ fontSize: 14 }}
                      href={`/trails/enade/biblioteca/${a.slug}`}
                    >
                      {a.title}
                    </Link>
                  </div>
                  <span className={styles.muted}>{a.readingMinutes} min</span>
                  {studied.has(a.slug) && (
                    <span className={styles.badge} data-tone="success">
                      Estudado
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className={styles.muted} style={{ marginTop: 40 }}>
        Conteúdo autoral da equipe Stacklyst, versionado e revisado, com referências em cada página.
        Exercícios dos miniquestionários são autorais; questões oficiais são sempre identificadas
        como Inep.
      </p>
    </div>
  );
}
