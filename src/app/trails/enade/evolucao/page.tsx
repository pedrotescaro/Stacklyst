import Link from 'next/link';
import {
  libraryOutline,
  loadHistory,
  requireEnadeUser,
  shellUser,
  topicCategories,
  topicTitles,
} from '@/lib/enade/hub.server';
import {
  computeStats,
  type StatsActivity,
  type StatsPeriod,
  type TopicStat,
} from '@/lib/enade/stats';
import { ENADE_YEARS } from '@/lib/enade/simulator';
import { percent, plural, shortDate, studyTime } from '@/lib/enade/format';
import { EnadeShell } from '../_components/EnadeShell';
import { ActivityHeatmap, ColumnChart, LineChart } from '../_components/Charts';
import { FilterSelect } from '../_components/FilterSelect';
import ui from '../_components/ui.module.css';

export const metadata = { title: 'Minha evolução ENADE · Stacklyst' };

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 3 meses' },
  { value: '365d', label: 'Último ano' },
  { value: 'all', label: 'Todo o período' },
];
const ACTIVITIES: { value: StatsActivity; label: string }[] = [
  { value: 'all', label: 'Todas as atividades' },
  { value: 'exam', label: 'Simulados' },
  { value: 'practice', label: 'Prática por assunto' },
  { value: 'review', label: 'Revisões' },
];

function weekLabel(key: string) {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}
function monthLabel(key: string) {
  return new Date(`${key}-15T12:00:00Z`).toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit',
  });
}

export default async function EvolutionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireEnadeUser();
  const params = await searchParams;
  const outline = libraryOutline();
  const period = PERIODS.some((p) => p.value === params.periodo)
    ? (params.periodo as StatsPeriod)
    : 'all';
  const activity = ACTIVITIES.some((a) => a.value === params.atividade)
    ? (params.atividade as StatsActivity)
    : 'all';
  const category = outline.categories.some((c) => c.slug === params.categoria)
    ? params.categoria!
    : null;
  const topic =
    outline.articles.find(
      (article) => article.slug === params.assunto && (!category || article.category === category)
    )?.slug ?? null;
  const year = ENADE_YEARS.includes(Number(params.ano)) ? Number(params.ano) : null;
  const history = await loadHistory(user.id);
  const stats = computeStats(
    { ...history, topicCategory: topicCategories() },
    { period, activity, category, topic, year }
  );
  const titles = topicTitles();
  const categoryTitle = new Map(outline.categories.map((c) => [c.slug, c.title]));
  const hasData =
    stats.totals.answered > 0 || stats.studyMs.total > 0 || stats.attempts.finished > 0;
  return (
    <EnadeShell
      user={shellUser(user)}
      title="Minha evolução"
      description="Indicadores calculados a partir das suas respostas registradas. Questões únicas e respostas repetidas aparecem separadas para não inflar o desempenho."
    >
      <form className={ui.filters} method="get" aria-label="Filtros do painel">
        <FilterSelect name="periodo" label="Período" value={period} options={PERIODS} />
        <FilterSelect name="atividade" label="Atividade" value={activity} options={ACTIVITIES} />
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
          name="ano"
          label="Ano da prova"
          value={year ? String(year) : ''}
          options={[
            { value: '', label: 'Todos' },
            ...ENADE_YEARS.map((y) => ({ value: String(y), label: String(y) })),
          ]}
        />
        <button className={ui.secondary} type="submit">
          Aplicar filtros
        </button>
        {(period !== 'all' || activity !== 'all' || category || topic || year) && (
          <Link className={ui.ghost} href="/trails/enade/evolucao">
            Limpar filtros
          </Link>
        )}
      </form>

      {!hasData ? (
        <div className={ui.empty}>
          <h3>Ainda não há dados para este recorte</h3>
          <p>
            O painel se preenche conforme você responde questões, conclui simulados e estuda na
            biblioteca. Nenhum número aqui é estimado.
          </p>
          <Link className={ui.primary} href="/trails/enade/simulados">
            Começar a praticar
          </Link>
        </div>
      ) : (
        <>
          <dl className={ui.metrics}>
            <div className={ui.metric}>
              <dt>Questões respondidas</dt>
              <dd>
                {stats.totals.answered}
                <small>
                  {stats.totals.correct} acertos · {stats.totals.wrong} erros
                </small>
              </dd>
            </div>
            <div className={ui.metric}>
              <dt>Questões únicas</dt>
              <dd>
                {stats.totals.uniqueAnswered}
                <small>
                  {plural(
                    stats.totals.answered - stats.totals.uniqueAnswered,
                    'resposta repetida',
                    'respostas repetidas'
                  )}
                </small>
              </dd>
            </div>
            <div className={ui.metric}>
              <dt>Taxa geral de acerto</dt>
              <dd>
                {percent(stats.totals.accuracy)}
                <small>
                  1ª tentativa {percent(stats.totals.firstTryAccuracy)} · atual{' '}
                  {percent(stats.totals.latestAccuracy)}
                </small>
              </dd>
            </div>
            <div className={ui.metric}>
              <dt>Simulados realizados</dt>
              <dd>
                {stats.attempts.finished}
                <small>
                  {stats.attempts.best
                    ? `melhor ${stats.attempts.best.percent}% · média ${stats.attempts.average}%`
                    : 'nenhum concluído'}
                </small>
              </dd>
            </div>
            <div className={ui.metric}>
              <dt>
                {stats.studyMs.isScoped ? 'Tempo das tentativas no recorte' : 'Tempo de estudo'}
              </dt>
              <dd>
                {studyTime(stats.studyMs.total)}
                {!stats.studyMs.isScoped && (
                  <small>
                    {studyTime(stats.studyMs.reading)} lendo · {studyTime(stats.studyMs.practice)}{' '}
                    praticando
                  </small>
                )}
              </dd>
            </div>
          </dl>

          <section className={ui.section} aria-labelledby="timeline-title">
            <div className={ui.sectionHead}>
              <h2 id="timeline-title">Desempenho nos simulados ao longo do tempo</h2>
              <p>Aproveitamento nas objetivas válidas de cada simulado concluído.</p>
            </div>
            {stats.timeline.length ? (
              <LineChart
                title="Aproveitamento por simulado concluído"
                points={stats.timeline.map((t) => ({
                  label: shortDate(t.date),
                  value: t.percent,
                  detail: t.title,
                }))}
              />
            ) : (
              <p className={ui.muted}>Conclua um simulado para ver a curva de evolução.</p>
            )}
          </section>

          <div className={ui.split}>
            <section className={ui.section} aria-labelledby="weekly-title">
              <div className={ui.sectionHead}>
                <h2 id="weekly-title">Evolução semanal</h2>
                <p>Respostas corrigidas por semana</p>
              </div>
              <ColumnChart
                title="Respostas corrigidas por semana"
                bars={stats.weekly.slice(-12).map((w) => ({
                  label: weekLabel(w.key),
                  value: w.responses,
                  display: `${w.responses} respostas`,
                  detail: `${percent(w.accuracy)} de acerto · ${studyTime(w.studyMs)} de estudo`,
                }))}
              />
            </section>
            <section className={ui.section} aria-labelledby="monthly-title">
              <div className={ui.sectionHead}>
                <h2 id="monthly-title">Evolução mensal</h2>
                <p>Taxa de acerto por mês</p>
              </div>
              {stats.monthly.some((m) => m.accuracy !== null) ? (
                <LineChart
                  title="Taxa de acerto por mês"
                  height={170}
                  points={stats.monthly
                    .filter((m) => m.accuracy !== null)
                    .map((m) => ({
                      label: monthLabel(m.key),
                      value: Math.round((m.accuracy ?? 0) * 100),
                      detail: `${m.responses} respostas · ${studyTime(m.studyMs)}`,
                    }))}
                />
              ) : (
                <p className={ui.muted}>Sem respostas no período.</p>
              )}
            </section>
          </div>

          <section className={ui.section} aria-labelledby="streak-title">
            <div className={ui.sectionHead}>
              <h2 id="streak-title">Sequência de dias estudados</h2>
              <p>
                Atual: {plural(stats.streak.current, 'dia', 'dias')} · recorde:{' '}
                {plural(stats.streak.longest, 'dia', 'dias')} ·{' '}
                {plural(stats.streak.activeDays, 'dia ativo', 'dias ativos')}
              </p>
            </div>
            <ActivityHeatmap days={stats.streak.calendar} />
          </section>

          <div className={ui.split}>
            <TopicTable
              id="category-title"
              title="Desempenho por categoria"
              rows={stats.byCategory}
              label={(slug) => categoryTitle.get(slug) ?? slug}
              href={(slug) => `/trails/enade/biblioteca/categoria/${slug}`}
            />
            <TopicTable
              id="topic-title"
              title="Desempenho por assunto"
              rows={stats.byTopic}
              label={(slug) => titles.get(slug) ?? slug}
              href={(slug) => `/trails/enade/biblioteca/${slug}`}
            />
          </div>

          <div className={ui.split}>
            <section className={ui.section} aria-labelledby="mastered-title">
              <div className={ui.sectionHead}>
                <h2 id="mastered-title">Assuntos dominados</h2>
                <p>≥ 3 questões diferentes e ≥ 80% na última resposta de cada uma.</p>
              </div>
              <TopicList
                items={stats.mastered}
                titles={titles}
                empty="Nenhum ainda — continue praticando."
              />
            </section>
            <section className={ui.section} aria-labelledby="struggling-title">
              <div className={ui.sectionHead}>
                <h2 id="struggling-title">Assuntos com dificuldade</h2>
                <p>≥ 2 respostas e menos de 60% de acerto.</p>
              </div>
              <TopicList
                items={stats.struggling}
                titles={titles}
                empty="Nenhum assunto crítico no recorte."
              />
            </section>
          </div>

          {stats.comparisons.length > 0 && (
            <section className={ui.section} aria-labelledby="compare-title">
              <div className={ui.sectionHead}>
                <h2 id="compare-title">Comparativo entre tentativas</h2>
                <p>Provas oficiais refeitas mais de uma vez.</p>
              </div>
              <div className={ui.scroll}>
                <table className={ui.table}>
                  <thead>
                    <tr>
                      <th>Edição</th>
                      <th>Tentativas (em ordem)</th>
                      <th className={ui.num}>Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.comparisons.map((c) => {
                      const delta =
                        c.attempts[c.attempts.length - 1].percent - c.attempts[0].percent;
                      return (
                        <tr key={c.year}>
                          <td>Enade {c.year}</td>
                          <td>
                            {c.attempts.map((a, i) => (
                              <span key={a.id}>
                                {i > 0 && ' → '}
                                <Link
                                  href={`/trails/enade/simulados/${a.id}`}
                                  title={shortDate(a.date)}
                                >
                                  {a.percent}%
                                </Link>
                              </span>
                            ))}
                          </td>
                          <td className={ui.num}>
                            {delta > 0 ? '+' : ''}
                            {delta} p.p.
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </EnadeShell>
  );
}

function TopicTable({
  id,
  title,
  rows,
  label,
  href,
}: {
  id: string;
  title: string;
  rows: TopicStat[];
  label: (slug: string) => string;
  href: (slug: string) => string;
}) {
  return (
    <section className={ui.section} aria-labelledby={id}>
      <div className={ui.sectionHead}>
        <h2 id={id}>{title}</h2>
      </div>
      {rows.length ? (
        <ul className={ui.rows}>
          {rows.slice(0, 12).map((row) => (
            <li key={row.slug} className={ui.row} style={{ padding: '10px 0' }}>
              <div className={ui.rowMain} style={{ flexBasis: 160 }}>
                <p className={ui.rowTitle} style={{ fontSize: 13.5 }}>
                  <Link href={href(row.slug)}>{label(row.slug)}</Link>
                </p>
                <p className={ui.rowMeta}>
                  {row.correct}/{row.responses} respostas · {row.unique} questões únicas
                </p>
              </div>
              <div className={ui.rowAside} style={{ width: 150 }}>
                <span className={ui.meter} aria-hidden="true">
                  <span style={{ width: `${(row.accuracy ?? 0) * 100}%` }} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {percent(row.accuracy)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={ui.muted}>Sem respostas no recorte.</p>
      )}
    </section>
  );
}

function TopicList({
  items,
  titles,
  empty,
}: {
  items: TopicStat[];
  titles: Map<string, string>;
  empty: string;
}) {
  if (!items.length) return <p className={ui.muted}>{empty}</p>;
  return (
    <ul className={ui.rows}>
      {items.slice(0, 8).map((item) => (
        <li key={item.slug} className={ui.row} style={{ padding: '10px 0' }}>
          <div className={ui.rowMain}>
            <Link className={ui.rowTitle} href={`/trails/enade/biblioteca/${item.slug}`}>
              {titles.get(item.slug) ?? item.slug}
            </Link>
          </div>
          <span className={ui.muted}>
            {percent(item.accuracy)} · {item.responses} respostas
          </span>
        </li>
      ))}
    </ul>
  );
}
