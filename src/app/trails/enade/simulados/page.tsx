import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import catalog from '@/lib/enade/exams.json';
import type { EnadeConfig } from '@/lib/enade/simulator';
import { attemptPercent, SIMULATION_KINDS } from '@/lib/enade/stats';
import { KIND_LABELS } from '@/lib/enade/attempts';
import { dateTime, shortDate } from '@/lib/enade/format';
import { questionsForTopic } from '@/lib/enade/topics';
import { libraryOutline, loadHistory, requireEnadeUserId } from '@/lib/enade/hub.server';
import { EnadeShell } from '../_components/EnadeShell';
import { StartAttemptButton } from '../_components/StartAttemptButton';
import { DiscardAttemptButton } from '../_components/DiscardAttemptButton';
import { TopicPractice } from '../_components/TopicPractice';
import { EnadeConfiguration } from '../EnadeConfiguration';
import ui from '../_components/ui.module.css';

export const metadata = { title: 'Simulados ENADE · Stacklyst' };

export default async function SimulationsPage() {
  const userId = await requireEnadeUserId();
  const [history, lastCustom] = await Promise.all([
    loadHistory(userId),
    prisma.enadeAttempt.findFirst({
      where: { user_id: userId, kind: 'CUSTOM' },
      orderBy: { created_at: 'desc' },
      select: { state: true },
    }),
  ]);
  const running = history.attempts
    .filter((a) => a.status === 'IN_PROGRESS' && SIMULATION_KINDS.includes(a.kind))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const outline = libraryOutline();
  const topics = outline.articles
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      count: questionsForTopic(a.slug).length,
    }))
    .filter((t) => t.count > 0);
  const editions = [...catalog].reverse();
  return (
    <EnadeShell
      title="Simulados"
      description="Provas oficiais completas, simulados sob medida e prática por assunto. Cada tentativa fica salva no seu histórico — refazer nunca apaga a anterior."
    >
      {running.length > 0 && (
        <section className={ui.section} aria-labelledby="running-title">
          <div className={ui.sectionHead}>
            <h2 id="running-title">Em andamento</h2>
            <p>O progresso é salvo automaticamente; continue de qualquer dispositivo.</p>
          </div>
          <ul className={ui.rows}>
            {running.map((a) => (
              <li key={a.id} className={ui.row}>
                <div className={ui.rowMain}>
                  <p className={ui.rowTitle}>{a.title}</p>
                  <p className={ui.rowMeta}>
                    <span>{KIND_LABELS[a.kind]}</span>
                    <span>
                      {a.answeredCount}/{a.questionCount} respondidas
                    </span>
                    <span>Atualizado em {dateTime(a.updatedAt)}</span>
                  </p>
                </div>
                <div className={ui.rowAside}>
                  <DiscardAttemptButton id={a.id} title={a.title} />
                  <Link className={ui.primary} href={`/trails/enade/simulados/${a.id}`}>
                    Continuar <ArrowRight size={15} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={ui.section} aria-labelledby="official-title">
        <div className={ui.sectionHead}>
          <h2 id="official-title">Provas oficiais completas</h2>
          <p>
            40 questões · 4 horas · formação geral e componente específico, na ordem do caderno.
          </p>
        </div>
        <ul className={ui.rows}>
          {editions.map((edition) => {
            const attempts = history.attempts.filter(
              (a) =>
                a.kind === 'STANDARD' && a.sourceYear === edition.year && a.status !== 'ABANDONED'
            );
            const finished = attempts.filter((a) => a.status === 'FINISHED');
            const best = finished.length ? Math.max(...finished.map(attemptPercent)) : null;
            const last = finished.sort(
              (a, b) => b.finishedAt!.getTime() - a.finishedAt!.getTime()
            )[0];
            const inProgress = attempts.find((a) => a.status === 'IN_PROGRESS');
            return (
              <li key={edition.year} className={ui.row}>
                <div className={ui.rowMain}>
                  <p className={ui.rowTitle}>
                    Enade {edition.year}{' '}
                    {finished.length > 0 && (
                      <span className={ui.badge} data-tone="success">
                        <Check size={12} aria-hidden="true" /> {finished.length}{' '}
                        {finished.length === 1 ? 'tentativa' : 'tentativas'}
                      </span>
                    )}
                  </p>
                  <p className={ui.rowMeta}>
                    {last ? (
                      <>
                        <span>
                          Última: {attemptPercent(last)}% em {shortDate(last.finishedAt!)}
                        </span>
                        <span>Melhor: {best}%</span>
                      </>
                    ) : (
                      <span>Ainda não realizada</span>
                    )}
                    <a href={`/enade/${edition.year}/prova.pdf`} target="_blank" rel="noreferrer">
                      Caderno oficial (PDF)
                    </a>
                  </p>
                </div>
                <div className={ui.rowAside}>
                  {inProgress ? (
                    <Link className={ui.primary} href={`/trails/enade/simulados/${inProgress.id}`}>
                      Continuar <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <StartAttemptButton payload={{ kind: 'STANDARD', year: edition.year }}>
                      {finished.length ? 'Fazer novamente' : 'Iniciar prova'}
                    </StartAttemptButton>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={ui.section} id="personalizado">
        <EnadeConfiguration
          initialConfig={(lastCustom?.state as { config?: EnadeConfig } | null)?.config ?? null}
        />
      </section>

      <section className={ui.section} aria-labelledby="topic-title">
        <div className={ui.sectionHead}>
          <h2 id="topic-title">Prática por assunto</h2>
          <p>
            Questões oficiais de um único assunto, priorizando as que você ainda não acertou.
            Escolha o modo estudo para ver a correção comentada logo após cada resposta.
          </p>
        </div>
        <TopicPractice
          topics={topics}
          categories={outline.categories.map((c) => ({ slug: c.slug, title: c.title }))}
        />
      </section>
    </EnadeShell>
  );
}
