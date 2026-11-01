'use client';

import { useEffect, useState, type ComponentProps, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, ShieldCheck, Zap } from 'lucide-react';
import { PlatformPageHeader, PlatformPageShell } from '@/components/PlatformPageShell';
import { EvaluatorGuide } from '@/components/evaluators/EvaluatorGuide';
import { EVALUATOR_MIN_MOTIVATION_LENGTH, EVALUATOR_MIN_XP } from '@/lib/evaluators/policy';
import styles from '@/components/evaluators/EvaluatorPages.module.css';

interface EligibilityData {
  eligible: boolean;
  totalXp: number;
  completedTrails: string[];
  isAlreadyEvaluator: boolean;
  hasPendingApplication: boolean;
  requirements: { hasCompletedTrail: boolean; hasSufficientXp: boolean };
  latestApplication?: { status: string; reviewer_notes?: string | null } | null;
  evaluatorProfile?: { status: string; sanction_reason?: string | null } | null;
}
const TECHNOLOGIES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Rust',
  'Go',
  'Java',
  'Kotlin',
  'Swift',
  'C++',
  'React',
  'Node.js',
];

export function EvaluatorApplyContent({
  user,
}: {
  user: ComponentProps<typeof PlatformPageShell>['user'];
}) {
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [motivation, setMotivation] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  async function loadEligibility() {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch('/api/evaluators/eligibility');
      if (!response.ok) throw new Error('Falha na consulta');
      setEligibility(await response.json());
    } catch {
      setLoadError(
        'Não foi possível consultar os requisitos. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void loadEligibility();
  }, []);

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eligibility?.eligible || eligibility.hasPendingApplication || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/evaluators/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivation: motivation.trim(), tech_stack: selectedTechs }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || data.error || 'Não foi possível enviar a candidatura.');
      setFeedback({
        type: 'success',
        message:
          'Candidatura enviada. Acompanhe a análise nesta página e a decisão nas suas notificações.',
      });
      setEligibility((current) =>
        current
          ? { ...current, hasPendingApplication: true, latestApplication: { status: 'PENDING' } }
          : current
      );
      void loadEligibility();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Falha de conexão. Tente novamente.',
      });
    } finally {
      setSubmitting(false);
    }
  }
  const suspended = user?.role !== 'ADMIN' && eligibility?.evaluatorProfile?.status === 'SUSPENDED';
  const canApply =
    eligibility?.eligible &&
    !eligibility.isAlreadyEvaluator &&
    !eligibility.hasPendingApplication &&
    !suspended;

  return (
    <PlatformPageShell user={user}>
      <PlatformPageHeader title="Avaliador de código" />
      <div className={styles.body}>
        <section className={styles.intro}>
          <h2>Ajude a decidir o próximo duelo.</h2>
          <p>
            Compare soluções, explique sua decisão e ajude outros desenvolvedores a melhorar. A
            função exige aprovação da administração.
          </p>
        </section>
        {feedback && (
          <p
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`${styles.notice} ${feedback.type === 'error' ? styles.error : ''}`}
          >
            {feedback.message}
          </p>
        )}
        {loading ? (
          <p role="status" className={styles.muted}>
            Consultando seus requisitos…
          </p>
        ) : loadError ? (
          <div role="alert" className={`${styles.notice} ${styles.error}`}>
            <p>{loadError}</p>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => void loadEligibility()}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          eligibility && (
            <>
              {suspended ? (
                <section className={styles.notice}>
                  <h2>
                    <ShieldCheck size={20} />
                    Função suspensa
                  </h2>
                  <p>
                    Seu perfil de avaliador está suspenso. A administração precisa revisar a
                    suspensão para liberar novas avaliações.
                  </p>
                  {eligibility.evaluatorProfile?.sanction_reason && (
                    <p>Motivo: {eligibility.evaluatorProfile.sanction_reason}</p>
                  )}
                </section>
              ) : eligibility.isAlreadyEvaluator ? (
                <section className={styles.notice}>
                  <h2>
                    <CheckCircle2 className={styles.accent} size={20} />
                    Você já pode avaliar
                  </h2>
                  <p>
                    A central mostra os duelos disponíveis nas suas tecnologias. Você não pode
                    avaliar seus próprios duelos.
                  </p>
                  {eligibility.latestApplication?.reviewer_notes && (
                    <p>Parecer da administração: {eligibility.latestApplication.reviewer_notes}</p>
                  )}
                  <Link href="/evaluations" className={styles.button}>
                    Abrir central de avaliações
                    <ArrowRight size={17} />
                  </Link>
                </section>
              ) : eligibility.hasPendingApplication ? (
                <section className={styles.notice}>
                  <h2>
                    <Clock3 className={styles.accent} size={20} />
                    Candidatura em análise
                  </h2>
                  <p>
                    Sua candidatura está na fila da administração. Quando a análise for concluída,
                    você receberá a decisão nas notificações.
                  </p>
                  <p className={styles.muted}>Não é preciso enviar outra candidatura.</p>
                </section>
              ) : (
                <>
                  {eligibility.latestApplication?.status === 'REJECTED' && (
                    <section className={styles.notice}>
                      <h2>Última candidatura não aprovada</h2>
                      <p>
                        {eligibility.latestApplication.reviewer_notes ||
                          'A administração não informou uma observação nesta análise.'}
                      </p>
                      <p>
                        Revise as informações e envie uma nova candidatura quando estiver pronto.
                      </p>
                    </section>
                  )}
                  <section className={styles.section}>
                    <h2>O que você precisa</h2>
                    <p className={styles.muted}>
                      Basta cumprir um dos requisitos abaixo. A experiência nas tecnologias será
                      analisada na candidatura.
                    </p>
                    <div className={styles.requirements}>
                      <div className={styles.requirement}>
                        <BookOpen size={22} className={styles.accent} />
                        <strong>Concluir 1 trilha</strong>
                        <p className={styles.muted}>
                          Complete todas as atividades de uma trilha de linguagem.
                        </p>
                        <p>
                          {eligibility.requirements.hasCompletedTrail
                            ? `Concluída: ${eligibility.completedTrails.join(', ')}`
                            : 'Você ainda não concluiu uma trilha.'}
                        </p>
                      </div>
                      <span className={styles.muted}>ou</span>
                      <div className={styles.requirement}>
                        <Zap size={22} className={styles.accent} />
                        <strong>Acumular 1.000 XP</strong>
                        <p className={styles.muted}>
                          Seu progresso: {eligibility.totalXp.toLocaleString('pt-BR')} /{' '}
                          {EVALUATOR_MIN_XP.toLocaleString('pt-BR')} XP.
                        </p>
                        <p>
                          {eligibility.requirements.hasSufficientXp
                            ? 'Requisito cumprido.'
                            : `Faltam ${Math.max(0, EVALUATOR_MIN_XP - eligibility.totalXp).toLocaleString('pt-BR')} XP.`}
                        </p>
                      </div>
                    </div>
                    {!eligibility.eligible && (
                      <Link href="/trails" className={styles.secondary}>
                        Continuar aprendendo
                        <ArrowRight size={17} />
                      </Link>
                    )}
                  </section>
                </>
              )}
              {canApply && (
                <section className={styles.section}>
                  <h2>Sua candidatura</h2>
                  <p className={styles.muted}>
                    Conte o que você domina. Selecione apenas as tecnologias em que consegue revisar
                    o código de outra pessoa.
                  </p>
                  <form className={styles.form} onSubmit={handleApply} style={{ marginTop: 20 }}>
                    <fieldset disabled={submitting}>
                      <legend>
                        Tecnologias que você domina{' '}
                        <span className={styles.muted}>(selecione pelo menos uma)</span>
                      </legend>
                      <div className={styles.chips}>
                        {TECHNOLOGIES.map((tech) => (
                          <button
                            type="button"
                            key={tech}
                            aria-pressed={selectedTechs.includes(tech)}
                            className={styles.chip}
                            onClick={() =>
                              setSelectedTechs((current) =>
                                current.includes(tech)
                                  ? current.filter((item) => item !== tech)
                                  : [...current, tech]
                              )
                            }
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <div className={styles.field}>
                      <label htmlFor="evaluator-motivation">Por que você quer ser avaliador?</label>
                      <textarea
                        id="evaluator-motivation"
                        required
                        minLength={EVALUATOR_MIN_MOTIVATION_LENGTH}
                        maxLength={5000}
                        disabled={submitting}
                        value={motivation}
                        onChange={(event) => setMotivation(event.target.value)}
                        aria-describedby="motivation-help"
                        placeholder="Conte sua experiência, como você revisa código e o que pode trazer para a comunidade."
                      />
                      <small id="motivation-help">
                        {motivation.trim().length} / {EVALUATOR_MIN_MOTIVATION_LENGTH} caracteres
                        mínimos. Cite sua experiência e como daria um feedback útil.
                      </small>
                    </div>
                    <div className={styles.footer}>
                      <span className={styles.muted}>A aprovação não é automática.</span>
                      <button
                        className={styles.button}
                        type="submit"
                        disabled={
                          submitting ||
                          !selectedTechs.length ||
                          motivation.trim().length < EVALUATOR_MIN_MOTIVATION_LENGTH
                        }
                      >
                        {submitting ? 'Enviando…' : 'Enviar candidatura'}
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </>
          )
        )}
        <section className={styles.section}>
          <h2>Como funciona</h2>
          <ol className={styles.steps}>
            <li>Você envia sua experiência e suas tecnologias para análise.</li>
            <li>A administração aprova ou recusa a candidatura, e você recebe uma notificação.</li>
            <li>
              Após a aprovação, revise os duelos encaminhados para análise humana. Cada avaliação
              concluída rende 10 XP.
            </li>
          </ol>
        </section>
        <EvaluatorGuide context="application" defaultExpanded={false} />
      </div>
    </PlatformPageShell>
  );
}
