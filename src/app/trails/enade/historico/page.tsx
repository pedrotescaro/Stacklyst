import Link from 'next/link';
import { loadHistory, requireEnadeUser, shellUser, topicTitles } from '@/lib/enade/hub.server';
import { attemptPercent, SIMULATION_KINDS, type AttemptKind } from '@/lib/enade/stats';
import { KIND_LABELS } from '@/lib/enade/attempts';
import { dateTime, percent, studyTime } from '@/lib/enade/format';
import { formatDuration } from '@/lib/enade/simulator';
import { EnadeShell } from '../_components/EnadeShell';
import { StartAttemptButton } from '../_components/StartAttemptButton';
import ui from '../_components/ui.module.css';

export const metadata = { title: 'Meu histórico ENADE · Stacklyst' };

const STATUS = {
  IN_PROGRESS: { text: 'Em andamento', tone: 'accent' },
  FINISHED: { text: 'Concluído', tone: 'success' },
  ABANDONED: { text: 'Descartado', tone: '' },
} as const;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string }>;
}) {
  const user = await requireEnadeUser();
  const params = await searchParams;
  const history = await loadHistory(user.id);
  const kind = (SIMULATION_KINDS as string[]).includes(params.tipo ?? '')
    ? (params.tipo as AttemptKind)
    : null;
  const status = params.status && Object.hasOwn(STATUS, params.status) ? params.status : null;
  const attempts = history.attempts.filter(
    (a) =>
      SIMULATION_KINDS.includes(a.kind) &&
      (!kind || a.kind === kind) &&
      (!status || a.status === status)
  );
  // Per-subject breakdown for each finished attempt, from its own graded answers.
  const titles = topicTitles();
  const byAttempt = new Map<string, Map<string, { correct: number; total: number }>>();
  for (const answer of history.answers) {
    if (answer.correct === null || !answer.topic) continue;
    const topics = byAttempt.get(answer.attemptId) ?? new Map();
    const entry = topics.get(answer.topic) ?? { correct: 0, total: 0 };
    entry.total++;
    if (answer.correct) entry.correct++;
    topics.set(answer.topic, entry);
    byAttempt.set(answer.attemptId, topics);
  }
  const query = (next: Record<string, string | null>) => {
    const merged = { tipo: kind, status, ...next };
    const search = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => v) as [string, string][]
    ).toString();
    return `/trails/enade/historico${search ? `?${search}` : ''}`;
  };
  return (
    <EnadeShell
      user={shellUser(user)}
      title="Meu histórico"
      description="Todas as suas tentativas, inclusive as repetidas. Abra qualquer uma para revisar respostas e explicações, refazer ou praticar só as erradas."
    >
      <nav className={ui.filters} aria-label="Filtrar histórico">
        <Link className={ui.chip} aria-current={!kind && !status} href="/trails/enade/historico">
          Todos
        </Link>
        {SIMULATION_KINDS.map((k) => (
          <Link
            key={k}
            className={ui.chip}
            aria-current={kind === k}
            href={query({ tipo: kind === k ? null : k })}
          >
            {KIND_LABELS[k]}
          </Link>
        ))}
        {Object.entries(STATUS).map(([key, { text }]) => (
          <Link
            key={key}
            className={ui.chip}
            aria-current={status === key}
            href={query({ status: status === key ? null : key })}
          >
            {text}
          </Link>
        ))}
      </nav>
      {attempts.length === 0 ? (
        <div className={ui.empty}>
          <h3>Nenhuma tentativa {kind || status ? 'com esses filtros' : 'ainda'}</h3>
          <p>Faça uma prova oficial ou monte um simulado. Cada tentativa fica registrada aqui.</p>
          <Link className={ui.primary} href="/trails/enade/simulados">
            Ir para simulados
          </Link>
        </div>
      ) : (
        <ol className={ui.rows}>
          {attempts.map((a) => {
            const topics = [...(byAttempt.get(a.id)?.entries() ?? [])].sort(
              (x, y) => y[1].total - x[1].total
            );
            const percentValue = attemptPercent(a);
            const average = a.questionCount ? a.elapsedMs / a.questionCount : 0;
            const years = [...new Set(a.questions.map((question) => question.year))].sort(
              (x, y) => y - x
            );
            return (
              <li key={a.id} className={ui.row} style={{ alignItems: 'flex-start' }}>
                <div className={ui.rowMain}>
                  <p className={ui.rowTitle}>
                    {a.status === 'ABANDONED' ? (
                      a.title
                    ) : (
                      <Link href={`/trails/enade/simulados/${a.id}`}>{a.title}</Link>
                    )}{' '}
                    <span className={ui.badge} data-tone={STATUS[a.status].tone}>
                      {STATUS[a.status].text}
                    </span>
                  </p>
                  <p className={ui.rowMeta}>
                    <span>{dateTime(a.startedAt)}</span>
                    <span>{KIND_LABELS[a.kind]}</span>
                    <span>{a.mode === 'training' ? 'Modo estudo' : 'Modo simulado'}</span>
                    {years.length > 0 && <span>Inep · {years.join(', ')}</span>}
                    <span>{a.questionCount} questões</span>
                  </p>
                  {a.status === 'FINISHED' ? (
                    <p className={ui.rowMeta}>
                      <span>
                        <strong>{a.correctCount}</strong> acertos
                      </span>
                      <span>{a.wrongCount - a.blankCount} erros</span>
                      <span>{a.blankCount} em branco</span>
                      <span>Tempo {formatDuration(a.elapsedMs)}</span>
                      <span>Média {formatDuration(average)} por questão</span>
                    </p>
                  ) : (
                    <p className={ui.rowMeta}>
                      {a.answeredCount}/{a.questionCount} respondidas · {studyTime(a.elapsedMs)}
                    </p>
                  )}
                  {topics.length > 0 && (
                    <details className={ui.muted} style={{ marginTop: 6 }}>
                      <summary style={{ cursor: 'pointer', width: 'fit-content' }}>
                        Desempenho por assunto
                      </summary>
                      <div className={ui.scroll} style={{ marginTop: 6 }}>
                        <table className={ui.table}>
                          <thead>
                            <tr>
                              <th>Assunto</th>
                              <th className={ui.num}>Acertos</th>
                              <th className={ui.num}>Aproveitamento</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topics.map(([slug, entry]) => (
                              <tr key={slug}>
                                <td>
                                  <Link href={`/trails/enade/biblioteca/${slug}`}>
                                    {titles.get(slug) ?? slug}
                                  </Link>
                                </td>
                                <td className={ui.num}>
                                  {entry.correct}/{entry.total}
                                </td>
                                <td className={ui.num}>{percent(entry.correct / entry.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  )}
                </div>
                <div
                  className={ui.rowAside}
                  style={{ flexDirection: 'column', alignItems: 'flex-end' }}
                >
                  {a.status === 'FINISHED' && (
                    <strong style={{ fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>
                      {a.scoredCount ? `${percentValue}%` : '—'}
                    </strong>
                  )}
                  <span className={ui.rowAside}>
                    {a.status !== 'ABANDONED' && (
                      <Link className={ui.secondary} href={`/trails/enade/simulados/${a.id}`}>
                        {a.status === 'FINISHED' ? 'Revisar' : 'Continuar'}
                      </Link>
                    )}
                    {a.status === 'FINISHED' && (
                      <StartAttemptButton
                        variant="ghost"
                        payload={{ kind: 'REPEAT', parentId: a.id }}
                      >
                        Refazer
                      </StartAttemptButton>
                    )}
                    {a.status === 'FINISHED' && a.wrongCount > 0 && (
                      <StartAttemptButton
                        variant="ghost"
                        payload={{ kind: 'WRONG_ONLY', parentId: a.id }}
                      >
                        Só as erradas
                      </StartAttemptButton>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </EnadeShell>
  );
}
