import Link from 'next/link';
import {
  libraryOutline,
  loadStudyState,
  requireEnadeUser,
  shellUser,
} from '@/lib/enade/hub.server';
import { QUESTION_BY_ID } from '@/lib/enade/simulator';
import { questionLabel, primaryTopic } from '@/lib/enade/topics';
import { shortDate } from '@/lib/enade/format';
import { EnadeShell } from '../_components/EnadeShell';
import { FavoriteButton } from '../_components/FavoriteButton';
import { StartAttemptButton } from '../_components/StartAttemptButton';
import ui from '../_components/ui.module.css';

export const metadata = { title: 'Favoritos ENADE · Stacklyst' };

export default async function FavoritesPage() {
  const user = await requireEnadeUser();
  const study = await loadStudyState(user.id);
  const outline = libraryOutline();
  const articles = study.favorites
    .filter((f) => f.kind === 'ARTICLE')
    .map((f) => ({ favorite: f, article: outline.articles.find((a) => a.slug === f.ref) }))
    .filter((e) => e.article);
  const questions = study.favorites
    .filter((f) => f.kind === 'QUESTION')
    .map((f) => ({ favorite: f, question: QUESTION_BY_ID.get(f.ref) }))
    .filter((e) => e.question);
  const titles = new Map(outline.articles.map((a) => [a.slug, a.title]));
  const categories = new Map(outline.categories.map((c) => [c.slug, c.title]));
  return (
    <EnadeShell
      user={shellUser(user)}
      title="Favoritos"
      description="Conteúdos e questões que você marcou com a estrela para voltar depois."
    >
      <section className={ui.section} aria-labelledby="fav-articles">
        <div className={ui.sectionHead}>
          <h2 id="fav-articles">Conteúdos da biblioteca</h2>
        </div>
        {articles.length ? (
          <ul className={ui.rows}>
            {articles.map(({ favorite, article }) => (
              <li key={article!.slug} className={ui.row}>
                <div className={ui.rowMain}>
                  <p className={ui.rowTitle}>
                    <Link href={`/trails/enade/biblioteca/${article!.slug}`}>{article!.title}</Link>
                  </p>
                  <p className={ui.rowMeta}>
                    <span>{categories.get(article!.category)}</span>
                    <span>{article!.readingMinutes} min de leitura</span>
                    <span>Salvo em {shortDate(favorite.created_at)}</span>
                  </p>
                </div>
                <FavoriteButton
                  kind="ARTICLE"
                  refId={article!.slug}
                  initial
                  label={article!.title}
                  compact
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className={ui.muted}>Use a estrela no topo de um artigo para salvá-lo aqui.</p>
        )}
      </section>
      <section className={ui.section} aria-labelledby="fav-questions">
        <div className={ui.sectionHead}>
          <h2 id="fav-questions">Questões</h2>
        </div>
        {questions.length ? (
          <ul className={ui.rows}>
            {questions.map(({ favorite, question }) => {
              const topic = primaryTopic(question!.id);
              return (
                <li key={question!.id} className={ui.row}>
                  <div className={ui.rowMain}>
                    <p className={ui.rowTitle}>
                      <Link href={`/trails/enade/questoes/${question!.id}`}>
                        {questionLabel(question!)}
                      </Link>
                    </p>
                    <p className={ui.rowMeta}>
                      {topic && <span>{titles.get(topic)}</span>}
                      <span>Salva em {shortDate(favorite.created_at)}</span>
                    </p>
                  </div>
                  <StartAttemptButton
                    variant="ghost"
                    payload={{ kind: 'PRACTICE', questionId: question!.id }}
                  >
                    Resolver
                  </StartAttemptButton>
                  <FavoriteButton
                    kind="QUESTION"
                    refId={question!.id}
                    initial
                    label={questionLabel(question!)}
                    compact
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={ui.muted}>Use a estrela ao lado de uma questão para salvá-la aqui.</p>
        )}
      </section>
    </EnadeShell>
  );
}
