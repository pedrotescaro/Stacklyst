import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ClipboardCheck,
  Clock3,
  Flame,
  Info,
  ListChecks,
  Target,
} from 'lucide-react';
import {
  libraryOutline,
  loadHistory,
  loadReviewItems,
  loadStudyState,
  requireEnadeUserId,
  topicCategories,
  topicTitles,
} from '@/lib/enade/hub.server';
import { computeStats, SIMULATION_KINDS } from '@/lib/enade/stats';
import { recommendStudy } from '@/lib/enade/recommendations';
import { topicFrequency } from '@/lib/enade/topics';
import { percent, plural, studyTime } from '@/lib/enade/format';
import {
  parseTrailCoursePreferences,
  TRAIL_COURSE_PREFERENCES_COOKIE,
} from '../trailCoursePreferences';
import { EnadeShell } from './_components/EnadeShell';
import { CoursePreference } from './_components/CoursePreference';
import { StartAttemptButton } from './_components/StartAttemptButton';
import { Recommendations } from './_components/Recommendations';
import ui from './_components/ui.module.css';
import styles from './Overview.module.css';

export const metadata = { title: 'Central ENADE · Stacklyst' };

export default async function EnadeOverviewPage() {
  const userId = await requireEnadeUserId();
  const store = await cookies();
  const preferences = parseTrailCoursePreferences(
    store.get(TRAIL_COURSE_PREFERENCES_COOKIE)?.value,
    userId
  );
  const [history, study, reviewItems] = await Promise.all([
    loadHistory(userId),
    loadStudyState(userId),
    loadReviewItems(userId),
  ]);
  const outline = libraryOutline();
  const stats = computeStats(
    { ...history, topicCategory: topicCategories() },
    { period: 'all', activity: 'all' }
  );
  const now = new Date();
  const due = reviewItems.filter((i) => i.due_at <= now).length;
  const open = reviewItems.filter((i) => i.status === 'OPEN').length;
  const running = history.attempts
    .filter((a) => a.status === 'IN_PROGRESS' && SIMULATION_KINDS.includes(a.kind))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3);
  const lastRead = [...study.progress].sort(
    (a, b) => b.last_read_at.getTime() - a.last_read_at.getTime()
  )[0];
  const lastArticle = lastRead
    ? outline.articles.find((a) => a.slug === lastRead.article_slug)
    : null;
  const studied = new Set(study.studied);
  const recommendations = recommendStudy({
    byTopic: stats.byTopic,
    reviewItems,
    studied,
    titles: topicTitles(),
    frequency: topicFrequency(),
    limit: 4,
  });
  const hasContinue = running.length > 0 || Boolean(lastArticle);

  const reviewSection = (
    <section className={styles.section} aria-labelledby="review-title">
      <div className={styles.sectionHead}>
        <h2 id="review-title">Revisão de hoje</h2>
        <Link className={ui.link} href="/trails/enade/revisao">
          Revisão inteligente
        </Link>
      </div>
      {reviewItems.length ? (
        <div className={`${ui.row} ${ui.solo}`}>
          <BrainCircuit size={18} aria-hidden="true" />
          <div className={ui.rowMain}>
            <p className={ui.rowTitle}>
              {due ? plural(due, 'questão pronta', 'questões prontas') : 'Nada pendente agora'} para
              revisar
            </p>
            <p className={ui.rowMeta}>
              {plural(open, 'erro ainda aberto', 'erros ainda abertos')} no caderno · intervalos
              crescem a cada acerto
            </p>
          </div>
          <StartAttemptButton payload={{ kind: 'REVIEW', scope: 'due' }} disabled={!due}>
            Revisar agora
          </StartAttemptButton>
        </div>
      ) : (
        <div className={ui.empty}>
          <h3>Seu caderno de erros está vazio</h3>
          <p>
            Cada questão que você errar entra aqui automaticamente e volta para revisão no momento
            certo, até você acertar duas vezes seguidas.
          </p>
        </div>
      )}
    </section>
  );

  return (
    <EnadeShell
      title="Central de estudos ENADE"
      description="Estude a teoria na biblioteca, pratique com as provas oficiais do Inep, revise seus erros e acompanhe sua evolução com dados reais."
    >
      <CoursePreference startedLanguages={preferences.startedLanguages} />
      <div className={styles.layout}>
        <section aria-labelledby="overview-metrics">
          <h2 id="overview-metrics" className={ui.srOnly}>
            Resumo do seu desempenho
          </h2>
          <dl className={styles.metrics}>
            <div className={styles.metric}>
              <dt>
                <ListChecks size={15} aria-hidden="true" /> Questões únicas
              </dt>
              <dd>
                {stats.totals.uniqueQuestions}
                <small>
                  {plural(stats.totals.responses, 'resposta', 'respostas')} no total, com repetições
                </small>
              </dd>
            </div>
            <div className={styles.metric}>
              <dt>
                <Target size={15} aria-hidden="true" /> Aproveitamento
              </dt>
              <dd>
                {percent(stats.totals.latestAccuracy)}
                <small>atual, pela última resposta de cada questão</small>
              </dd>
            </div>
            <div className={styles.metric}>
              <dt>
                <ClipboardCheck size={15} aria-hidden="true" /> Simulados
              </dt>
              <dd>
                {stats.attempts.finished}
                <small>
                  {stats.attempts.average !== null
                    ? `concluídos · média de ${stats.attempts.average}%`
                    : 'nenhum concluído ainda'}
                </small>
              </dd>
            </div>
            <div className={styles.metric}>
              <dt>
                <Flame size={15} aria-hidden="true" /> Sequência
              </dt>
              <dd>
                {plural(stats.streak.current, 'dia', 'dias')}
                <small>seguidos · {studyTime(stats.studyMs.total)} estudados</small>
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="method-title">
          <div className={styles.sectionHead}>
            <div>
              <h2 id="method-title">Como estudar por aqui</h2>
              <p>Um ciclo simples, que se repete a cada assunto.</p>
            </div>
          </div>
          <ol className={`${ui.steps} ${styles.steps}`}>
            <li>
              <Link href="/trails/enade/biblioteca">
                <span className={ui.stepNumber}>1</span>
                <strong>Entenda a teoria</strong>
                <span>Leia o assunto na biblioteca e faça o miniquestionário.</span>
              </Link>
            </li>
            <li>
              <Link href="/trails/enade/questoes">
                <span className={ui.stepNumber}>2</span>
                <strong>Pratique com provas reais</strong>
                <span>Resolva questões oficiais com correção comentada.</span>
              </Link>
            </li>
            <li>
              <Link href="/trails/enade/revisao">
                <span className={ui.stepNumber}>3</span>
                <strong>Revise os erros</strong>
                <span>Eles voltam no momento certo até você dominar o assunto.</span>
              </Link>
            </li>
          </ol>
        </section>

        {hasContinue ? (
          <div className={styles.pair}>
            <section className={styles.section} aria-labelledby="continue-title">
              <div className={styles.sectionHead}>
                <h2 id="continue-title">Continue de onde parou</h2>
              </div>
              <ul className={ui.rows}>
                {running.map((attempt) => (
                  <li key={attempt.id} className={ui.row}>
                    <Clock3 size={18} aria-hidden="true" />
                    <div className={ui.rowMain}>
                      <p className={ui.rowTitle}>{attempt.title}</p>
                      <p className={ui.rowMeta}>
                        {attempt.answeredCount}/{attempt.questionCount} respondidas · salvo
                        automaticamente
                      </p>
                    </div>
                    <Link className={ui.primary} href={`/trails/enade/simulados/${attempt.id}`}>
                      Retomar <ArrowRight size={15} />
                    </Link>
                  </li>
                ))}
                {lastArticle && (
                  <li className={ui.row}>
                    <BookOpen size={18} aria-hidden="true" />
                    <div className={ui.rowMain}>
                      <p className={ui.rowTitle}>{lastArticle.title}</p>
                      <p className={ui.rowMeta}>
                        Último conteúdo aberto · {lastArticle.readingMinutes} min de leitura
                      </p>
                    </div>
                    <Link
                      className={ui.secondary}
                      href={`/trails/enade/biblioteca/${lastArticle.slug}`}
                    >
                      Continuar lendo
                    </Link>
                  </li>
                )}
              </ul>
            </section>
            {reviewSection}
          </div>
        ) : (
          reviewSection
        )}

        <section className={styles.section} aria-labelledby="reco-title">
          <div className={styles.sectionHead}>
            <div>
              <h2 id="reco-title">Recomendado para você</h2>
              <p>Com base nos seus erros e na frequência dos assuntos nas provas oficiais.</p>
            </div>
          </div>
          <Recommendations items={recommendations} />
        </section>

        <section className={styles.section} aria-labelledby="library-title">
          <div className={styles.sectionHead}>
            <h2 id="library-title">Biblioteca de estudos</h2>
            <Link className={ui.link} href="/trails/enade/biblioteca">
              Abrir biblioteca
            </Link>
          </div>
          <ul className={ui.rows}>
            {outline.categories.map((category) => {
              const articles = outline.articles.filter((a) => a.category === category.slug);
              const done = articles.filter((a) => studied.has(a.slug)).length;
              return (
                <li key={category.slug} className={`${ui.row} ${ui.rowCompact}`}>
                  <div className={ui.rowMain}>
                    <p className={ui.rowTitle}>
                      <Link href={`/trails/enade/biblioteca/categoria/${category.slug}`}>
                        {category.title}
                      </Link>
                    </p>
                    <p className={ui.rowMeta}>{category.description}</p>
                  </div>
                  <div className={ui.progressAside}>
                    <span className={ui.meter} aria-hidden="true">
                      <span
                        style={{
                          width: `${articles.length ? (done / articles.length) * 100 : 0}%`,
                        }}
                      />
                    </span>
                    <span className={ui.muted}>
                      {done}/{articles.length} estudados
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <p className={`${ui.footnote} ${styles.footnote}`}>
          <Info size={14} aria-hidden="true" />
          <span>
            Questões, cadernos e gabaritos são as provas oficiais do Inep (ADS 2008, 2011, 2014,
            2017 e 2021). Explicações, exercícios autorais e materiais teóricos são da equipe
            Stacklyst, uma preparação independente, sem vínculo com o Inep. A porcentagem de acertos
            não é a nota oficial do Enade.
          </span>
        </p>
      </div>
    </EnadeShell>
  );
}
