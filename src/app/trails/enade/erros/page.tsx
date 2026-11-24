import Link from 'next/link';
import { loadReviewItems, requireEnadeUser, shellUser, topicTitles } from '@/lib/enade/hub.server';
import { QUESTION_BY_ID } from '@/lib/enade/simulator';
import { explanationFor } from '@/lib/enade/feedback';
import { questionLabel } from '@/lib/enade/topics';
import { isRecurring } from '@/lib/enade/srs';
import { plural, shortDate } from '@/lib/enade/format';
import { EnadeShell } from '../_components/EnadeShell';
import { StartAttemptButton } from '../_components/StartAttemptButton';
import ui from '../_components/ui.module.css';

export const metadata = { title: 'Caderno de erros ENADE · Stacklyst' };

type Filter = 'open' | 'recurring' | 'recovered' | 'all';

export default async function ErrorNotebookPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; assunto?: string }>;
}) {
  const user = await requireEnadeUser();
  const params = await searchParams;
  const filter: Filter = (['open', 'recurring', 'recovered', 'all'] as const).includes(
    params.filtro as Filter
  )
    ? (params.filtro as Filter)
    : 'open';
  const items = (await loadReviewItems(user.id)).filter((i) => QUESTION_BY_ID.has(i.question_id));
  const titles = topicTitles();
  const topic = params.assunto && titles.has(params.assunto) ? params.assunto : null;
  const topics = [...new Set(items.map((i) => i.topic).filter((t): t is string => !!t))].sort(
    (a, b) => (titles.get(a) ?? a).localeCompare(titles.get(b) ?? b, 'pt-BR')
  );
  const visible = items.filter(
    (i) =>
      (!topic || i.topic === topic) &&
      (filter === 'all' ||
        (filter === 'open' && i.status === 'OPEN') ||
        (filter === 'recovered' && i.status === 'RECOVERED') ||
        (filter === 'recurring' && isRecurring({ wrongCount: i.wrong_count })))
  );
  const counts = {
    open: items.filter((i) => i.status === 'OPEN').length,
    recurring: items.filter((i) => isRecurring({ wrongCount: i.wrong_count })).length,
    recovered: items.filter((i) => i.status === 'RECOVERED').length,
    all: items.length,
  };
  const link = (next: { filtro?: Filter; assunto?: string | null }) => {
    const search = new URLSearchParams();
    const f = next.filtro ?? filter;
    const t = next.assunto === undefined ? topic : next.assunto;
    if (f !== 'open') search.set('filtro', f);
    if (t) search.set('assunto', t);
    const query = search.toString();
    return `/trails/enade/erros${query ? `?${query}` : ''}`;
  };
  const labels: Record<Filter, string> = {
    open: 'Em aberto',
    recurring: 'Erros recorrentes',
    recovered: 'Recuperados',
    all: 'Todos',
  };
  return (
    <EnadeShell
      user={shellUser(user)}
      title="Caderno de erros"
      description="Toda questão objetiva que você errar entra aqui automaticamente. Ela é considerada recuperada depois de dois acertos seguidos em revisões espaçadas."
      actions={
        counts.open > 0 ? (
          <StartAttemptButton payload={{ kind: 'REVIEW', scope: 'open', topic, limit: 20 }}>
            Refazer {topic ? 'deste assunto' : 'os erros em aberto'}
          </StartAttemptButton>
        ) : undefined
      }
    >
      <nav className={ui.filters} aria-label="Filtrar caderno">
        {(Object.keys(labels) as Filter[]).map((f) => (
          <Link key={f} className={ui.chip} aria-current={filter === f} href={link({ filtro: f })}>
            {labels[f]} <span className={ui.muted}>{counts[f]}</span>
          </Link>
        ))}
      </nav>
      {topics.length > 1 && (
        <nav className={ui.filters} aria-label="Filtrar por assunto">
          <Link className={ui.chip} aria-current={!topic} href={link({ assunto: null })}>
            Todos os assuntos
          </Link>
          {topics.map((t) => (
            <Link
              key={t}
              className={ui.chip}
              aria-current={topic === t}
              href={link({ assunto: t })}
            >
              {titles.get(t) ?? t}
            </Link>
          ))}
        </nav>
      )}
      {visible.length === 0 ? (
        <div className={ui.empty}>
          <h3>{items.length ? 'Nada neste filtro' : 'Nenhum erro registrado ainda'}</h3>
          <p>
            {items.length
              ? 'Experimente outro filtro para ver os demais registros.'
              : 'Resolva questões no banco ou faça um simulado. Os erros aparecem aqui com o gabarito e a explicação.'}
          </p>
        </div>
      ) : (
        <ul className={ui.rows}>
          {visible.map((item) => {
            const q = QUESTION_BY_ID.get(item.question_id)!;
            return (
              <li key={item.question_id} className={ui.row} style={{ alignItems: 'flex-start' }}>
                <div className={ui.rowMain}>
                  <p className={ui.rowTitle}>
                    <Link href={`/trails/enade/questoes/${q.id}`}>{questionLabel(q)}</Link>{' '}
                    {item.status === 'RECOVERED' ? (
                      <span className={ui.badge} data-tone="success">
                        Recuperada
                      </span>
                    ) : isRecurring({ wrongCount: item.wrong_count }) ? (
                      <span className={ui.badge} data-tone="danger">
                        Errou {item.wrong_count}×
                      </span>
                    ) : (
                      <span className={ui.badge} data-tone="warning">
                        Em aberto
                      </span>
                    )}
                  </p>
                  <p className={ui.rowMeta}>
                    {item.topic && (
                      <Link href={`/trails/enade/biblioteca/${item.topic}`}>
                        {titles.get(item.topic) ?? item.topic}
                      </Link>
                    )}
                    <span>
                      Sua última resposta: <strong>{item.last_selected ?? '—'}</strong> · Gabarito:{' '}
                      <strong>{q.answer}</strong> (letras do caderno oficial)
                    </span>
                    <span>
                      {plural(item.correct_count, 'acerto', 'acertos')} depois do erro · próxima
                      revisão {shortDate(item.due_at)}
                    </span>
                  </p>
                  <details className={ui.muted} style={{ marginTop: 6 }}>
                    <summary style={{ cursor: 'pointer', width: 'fit-content' }}>
                      Explicação
                    </summary>
                    <p style={{ marginTop: 6, color: 'var(--color-dd-text)', lineHeight: 1.65 }}>
                      {explanationFor(q) ||
                        'Abra a questão para ver a correção comentada completa.'}
                    </p>
                  </details>
                </div>
                <div className={ui.rowAside}>
                  <Link className={ui.secondary} href={`/trails/enade/questoes/${q.id}`}>
                    Ver questão
                  </Link>
                  <StartAttemptButton
                    variant="ghost"
                    payload={{ kind: 'PRACTICE', questionId: q.id, mode: 'training' }}
                  >
                    Refazer
                  </StartAttemptButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </EnadeShell>
  );
}
