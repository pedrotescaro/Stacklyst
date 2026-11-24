import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { libraryOutline, requireEnadeUser, shellUser } from '@/lib/enade/hub.server';
import { ENADE_YEARS, QUESTION_BANK } from '@/lib/enade/simulator';
import { primaryTopic, questionLabel, topicsFor } from '@/lib/enade/topics';
import { insightFor } from '@/lib/enade/insights';
import { EnadeShell } from '../_components/EnadeShell';
import { FilterSelect } from '../_components/FilterSelect';
import { StartAttemptButton } from '../_components/StartAttemptButton';
import { FavoriteButton } from '../_components/FavoriteButton';
import ui from '../_components/ui.module.css';

export const metadata = { title: 'Banco de questões ENADE · Stacklyst' };

const PAGE = 30;

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireEnadeUser();
  const params = await searchParams;
  const outline = libraryOutline();
  const year = ENADE_YEARS.includes(Number(params.ano)) ? Number(params.ano) : null;
  const section = params.parte === 'general' || params.parte === 'specific' ? params.parte : null;
  const kind = params.tipo === 'objective' || params.tipo === 'discursive' ? params.tipo : null;
  const category = outline.categories.some((c) => c.slug === params.categoria)
    ? params.categoria!
    : null;
  const topic =
    outline.articles.find(
      (article) => article.slug === params.assunto && (!category || article.category === category)
    )?.slug ?? null;
  const status = ['nova', 'errada', 'acertada', 'favorita', 'comentada'].includes(
    params.status ?? ''
  )
    ? params.status!
    : null;

  const [answers, favorites] = await Promise.all([
    prisma.enadeAnswer.findMany({
      where: { user_id: user.id },
      orderBy: { answered_at: 'asc' },
      select: { question_id: true, correct: true },
    }),
    prisma.enadeFavorite.findMany({
      where: { user_id: user.id, kind: 'QUESTION' },
      select: { ref: true },
    }),
  ]);
  const latest = new Map<string, boolean | null>();
  const attemptsPerQuestion = new Map<string, number>();
  for (const a of answers) {
    latest.set(a.question_id, a.correct);
    attemptsPerQuestion.set(a.question_id, (attemptsPerQuestion.get(a.question_id) ?? 0) + 1);
  }
  const favoriteSet = new Set(favorites.map((f) => f.ref));
  const categoryOf = new Map(outline.articles.map((a) => [a.slug, a.category]));
  const titles = new Map(outline.articles.map((a) => [a.slug, a.title]));
  const filtered = QUESTION_BANK.filter((q) => {
    const tags = topicsFor(q.id);
    const state = latest.get(q.id);
    return (
      (!year || q.year === year) &&
      (!section || q.section === section) &&
      (!kind || q.kind === kind) &&
      (!topic || tags.includes(topic)) &&
      (!category || tags.some((t) => categoryOf.get(t) === category)) &&
      (!status ||
        (status === 'nova' && !latest.has(q.id)) ||
        (status === 'errada' && state === false) ||
        (status === 'acertada' && state === true) ||
        (status === 'favorita' && favoriteSet.has(q.id)) ||
        (status === 'comentada' && !!insightFor(q.id)))
    );
  }).sort((a, b) => b.year - a.year || a.number - b.number);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const requestedPage = Number(params.pagina);
  const page = Number.isSafeInteger(requestedPage)
    ? Math.min(pages, Math.max(1, requestedPage))
    : 1;
  const visible = filtered.slice((page - 1) * PAGE, page * PAGE);
  const pageLink = (n: number) => {
    const search = new URLSearchParams(
      Object.entries({ ...params, pagina: String(n) }).filter(([, v]) => v) as [string, string][]
    );
    return `/trails/enade/questoes?${search.toString()}`;
  };
  return (
    <EnadeShell
      user={shellUser(user)}
      title="Banco de questões"
      description="As 200 questões oficiais de ADS (Inep, 2008–2021), classificadas por assunto. Resolva uma a uma com correção comentada imediata."
    >
      <form className={ui.filters} method="get" aria-label="Filtrar questões">
        <FilterSelect
          name="ano"
          label="Ano"
          value={year ? String(year) : ''}
          options={[
            { value: '', label: 'Todos' },
            ...ENADE_YEARS.map((y) => ({ value: String(y), label: String(y) })),
          ]}
        />
        <FilterSelect
          name="parte"
          label="Parte da prova"
          value={section ?? ''}
          options={[
            { value: '', label: 'Todas' },
            { value: 'general', label: 'Formação geral' },
            { value: 'specific', label: 'Componente específico' },
          ]}
        />
        <FilterSelect
          name="categoria"
          label="Categoria"
          value={category ?? ''}
          options={[
            { value: '', label: 'Todas' },
            ...outline.categories.map((c) => ({ value: c.slug, label: c.title })),
          ]}
        />
        <FilterSelect
          name="assunto"
          label="Assunto"
          value={topic ?? ''}
          options={[
            { value: '', label: 'Todos' },
            ...outline.articles
              .filter((a) => !category || a.category === category)
              .map((a) => ({ value: a.slug, label: a.title })),
          ]}
        />
        <FilterSelect
          name="tipo"
          label="Tipo"
          value={kind ?? ''}
          options={[
            { value: '', label: 'Todos' },
            { value: 'objective', label: 'Objetivas' },
            { value: 'discursive', label: 'Discursivas' },
          ]}
        />
        <FilterSelect
          name="status"
          label="Situação"
          value={status ?? ''}
          options={[
            { value: '', label: 'Todas' },
            { value: 'nova', label: 'Nunca respondidas' },
            { value: 'errada', label: 'Errei por último' },
            { value: 'acertada', label: 'Acertei por último' },
            { value: 'favorita', label: 'Favoritas' },
            { value: 'comentada', label: 'Com comentário detalhado' },
          ]}
        />
        <button className={ui.secondary} type="submit">
          Aplicar filtros
        </button>
      </form>
      <div className={ui.sectionHead}>
        <p>
          {filtered.length} {filtered.length === 1 ? 'questão' : 'questões'}
          {pages > 1 ? ` · página ${page} de ${pages}` : ''}
        </p>
        {topic && (
          <StartAttemptButton
            variant="secondary"
            payload={{ kind: 'TOPIC', topic, limit: 20, mode: 'training' }}
          >
            Praticar este assunto em sequência
          </StartAttemptButton>
        )}
      </div>
      {visible.length === 0 ? (
        <div className={ui.empty}>
          <h3>Nenhuma questão com esses filtros</h3>
          <Link className={ui.link} href="/trails/enade/questoes">
            Limpar filtros
          </Link>
        </div>
      ) : (
        <ul className={ui.rows}>
          {visible.map((q) => {
            const state = latest.get(q.id);
            const main = primaryTopic(q.id);
            return (
              <li key={q.id} className={ui.row}>
                <div className={ui.rowMain}>
                  <p className={ui.rowTitle}>
                    <Link href={`/trails/enade/questoes/${q.id}`}>{questionLabel(q)}</Link>{' '}
                    {q.annulled && <span className={ui.badge}>Anulada</span>}
                    {state === true && (
                      <span className={ui.badge} data-tone="success">
                        Acertou
                      </span>
                    )}
                    {state === false && (
                      <span className={ui.badge} data-tone="danger">
                        Errou
                      </span>
                    )}
                    {insightFor(q.id) && (
                      <span className={ui.badge} data-tone="accent">
                        Comentada
                      </span>
                    )}
                  </p>
                  <p className={ui.rowMeta}>
                    <span>
                      {q.section === 'general' ? 'Formação geral' : 'Componente específico'}
                    </span>
                    {main && <span>{titles.get(main)}</span>}
                    {attemptsPerQuestion.get(q.id) ? (
                      <span>
                        {attemptsPerQuestion.get(q.id)}{' '}
                        {attemptsPerQuestion.get(q.id) === 1 ? 'resposta' : 'respostas'}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className={ui.rowAside}>
                  {!q.annulled && (
                    <StartAttemptButton
                      variant="secondary"
                      payload={{ kind: 'PRACTICE', questionId: q.id, mode: 'training' }}
                    >
                      Resolver
                    </StartAttemptButton>
                  )}
                  <FavoriteButton
                    kind="QUESTION"
                    refId={q.id}
                    initial={favoriteSet.has(q.id)}
                    label={questionLabel(q)}
                    compact
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {pages > 1 && (
        <nav className={ui.filters} style={{ marginTop: 16 }} aria-label="Paginação">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} className={ui.chip} aria-current={n === page} href={pageLink(n)}>
              {n}
            </Link>
          ))}
        </nav>
      )}
    </EnadeShell>
  );
}
