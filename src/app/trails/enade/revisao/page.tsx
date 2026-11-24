import {
  loadHistory,
  loadReviewItems,
  loadStudyState,
  requireEnadeUser,
  shellUser,
  topicCategories,
  topicTitles,
} from '@/lib/enade/hub.server';
import { computeStats, dayKey } from '@/lib/enade/stats';
import { recommendStudy } from '@/lib/enade/recommendations';
import { topicFrequency } from '@/lib/enade/topics';
import { plural } from '@/lib/enade/format';
import { RECOVERY_STREAK } from '@/lib/enade/srs';
import { EnadeShell } from '../_components/EnadeShell';
import { StartAttemptButton } from '../_components/StartAttemptButton';
import { Recommendations } from '../_components/Recommendations';
import { ColumnChart } from '../_components/Charts';
import ui from '../_components/ui.module.css';

export const metadata = { title: 'Revisão inteligente ENADE · Stacklyst' };

export default async function SmartReviewPage() {
  const user = await requireEnadeUser();
  const [items, history, study] = await Promise.all([
    loadReviewItems(user.id),
    loadHistory(user.id),
    loadStudyState(user.id),
  ]);
  const now = new Date();
  const due = items.filter((i) => i.due_at <= now);
  const dueOpen = due.filter((i) => i.status === 'OPEN').length;
  const titles = topicTitles();
  const stats = computeStats(
    { ...history, topicCategory: topicCategories() },
    { period: 'all', activity: 'all' }
  );
  const recommendations = recommendStudy({
    byTopic: stats.byTopic,
    reviewItems: items,
    studied: new Set(study.studied),
    titles,
    frequency: topicFrequency(),
    limit: 8,
  });
  const today = dayKey(now);
  const upcoming = Array.from({ length: 14 }, (_, i) => {
    const day = dayKey(new Date(now.getTime() + i * 86400000));
    return {
      day,
      count: items.filter((item) =>
        i === 0 ? item.due_at <= now || dayKey(item.due_at) === today : dayKey(item.due_at) === day
      ).length,
    };
  });
  const dueByTopic = new Map<string, number>();
  for (const item of due)
    if (item.topic) dueByTopic.set(item.topic, (dueByTopic.get(item.topic) ?? 0) + 1);
  return (
    <EnadeShell
      user={shellUser(user)}
      title="Revisão inteligente"
      description={
        <>
          Repetição espaçada sobre os seus próprios erros: uma questão errada volta no dia seguinte;
          cada acerto aumenta o intervalo (3 dias, depois cerca de uma semana, e assim por diante).
          Com {RECOVERY_STREAK} acertos seguidos o conceito é marcado como recuperado.
        </>
      }
    >
      <section className={ui.section} aria-labelledby="due-title">
        <div className={ui.sectionHead}>
          <h2 id="due-title">Para revisar hoje</h2>
        </div>
        {items.length === 0 ? (
          <div className={ui.empty}>
            <h3>Nenhuma revisão agendada</h3>
            <p>
              As revisões nascem dos seus erros. Responda questões no banco ou em simulados e elas
              aparecerão aqui na hora certa.
            </p>
          </div>
        ) : (
          <div className={ui.row} style={{ borderTop: '1px solid var(--enade-line)' }}>
            <div className={ui.rowMain}>
              <p className={ui.rowTitle}>
                {due.length
                  ? plural(due.length, 'questão vencida', 'questões vencidas')
                  : 'Revisões em dia'}
              </p>
              <p className={ui.rowMeta}>
                {dueOpen} ainda não recuperadas · {due.length - dueOpen} de manutenção ·{' '}
                {plural(items.length, 'item', 'itens')} no caderno
              </p>
            </div>
            <StartAttemptButton
              payload={{ kind: 'REVIEW', scope: 'due', limit: 15 }}
              disabled={!due.length}
            >
              Começar revisão ({Math.min(15, due.length)})
            </StartAttemptButton>
          </div>
        )}
        {dueByTopic.size > 1 && (
          <ul className={ui.rows} style={{ marginTop: 12 }}>
            {[...dueByTopic.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([topic, count]) => (
                <li key={topic} className={ui.row} style={{ padding: '10px 0' }}>
                  <div className={ui.rowMain}>
                    <p className={ui.rowTitle} style={{ fontSize: 13.5 }}>
                      {titles.get(topic) ?? topic}
                    </p>
                  </div>
                  <span className={ui.muted}>{plural(count, 'vencida', 'vencidas')}</span>
                  <StartAttemptButton
                    variant="ghost"
                    payload={{ kind: 'REVIEW', scope: 'due', topic }}
                  >
                    Revisar assunto
                  </StartAttemptButton>
                </li>
              ))}
          </ul>
        )}
      </section>

      {items.length > 0 && (
        <section className={ui.section} aria-labelledby="schedule-title">
          <div className={ui.sectionHead}>
            <h2 id="schedule-title">Próximos 14 dias</h2>
            <p>Quantas revisões vencem em cada dia.</p>
          </div>
          <ColumnChart
            title="Revisões agendadas por dia"
            bars={upcoming.map((u, i) => ({
              label:
                i === 0
                  ? 'Hoje'
                  : new Date(`${u.day}T12:00:00Z`).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    }),
              value: u.count,
              display: plural(u.count, 'revisão', 'revisões'),
            }))}
          />
        </section>
      )}

      <section className={ui.section} aria-labelledby="plan-title">
        <div className={ui.sectionHead}>
          <h2 id="plan-title">Plano de estudo recomendado</h2>
          <p>
            Prioridade: assuntos em que você mais erra, depois erros em aberto, depois os assuntos
            mais cobrados nas provas oficiais que você ainda não estudou.
          </p>
        </div>
        <Recommendations items={recommendations} />
      </section>
    </EnadeShell>
  );
}
