'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, Check, RefreshCw, Columns2, Swords } from 'lucide-react';
import { PlatformPageHeader, PlatformPageShell } from '@/components/PlatformPageShell';
import { EvaluatorGuide } from '@/components/evaluators/EvaluatorGuide';
import styles from '@/components/evaluators/EvaluatorPages.module.css';
import { parseProblemFromJson } from '@/lib/duel-problems';
import { getEvaluatorLevel } from '@/lib/evaluators/policy';

interface DuelSolutionItem {
  id: string;
  user_id: string;
  code: string;
  user: { id: string; username: string; avatar_url?: string | null };
}

interface DuelToEvaluate {
  id: string;
  problem_title: string;
  problem_body: string;
  language: string;
  status: string;
  challenger: { id: string; username: string; avatar_url: string | null; total_xp: number };
  opponent: { id: string; username: string; avatar_url: string | null; total_xp: number } | null;
  solutions: DuelSolutionItem[];
  evaluations: Array<{ type: string; score_player1: number; score_player2: number }>;
}

export function EvaluationsContent({ user }: { user: any }) {
  const [duels, setDuels] = useState<DuelToEvaluate[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingRequestedDuel, setMissingRequestedDuel] = useState<string | null>(null);
  const [selectedDuel, setSelectedDuel] = useState<DuelToEvaluate | null>(null);

  // Review Form state
  const [scoreP1, setScoreP1] = useState(800);
  const [scoreP2, setScoreP2] = useState(800);
  const [winnerId, setWinnerId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Responsive code view mode: 'both' | 'p1' | 'p2'
  const [codeViewMode, setCodeViewMode] = useState<'both' | 'p1' | 'p2'>('both');
  const [copiedPlayer, setCopiedPlayer] = useState<'p1' | 'p2' | null>(null);
  const [evaluatorProfile, setEvaluatorProfile] = useState<{
    reputation: number;
    evaluations_count: number;
    tech_stack: string[];
    status: string;
  } | null>(null);

  useEffect(() => {
    loadDuels();
  }, []);

  useEffect(() => {
    setWinnerId('');
    setFeedback('');
    setStrengths('');
    setImprovements('');
    setCodeViewMode('both');
    setCopiedPlayer(null);
    setScoreP1(800);
    setScoreP2(800);
    setErrorMessage(null);
    const automatic = selectedDuel?.evaluations.find(
      (evaluation) => evaluation.type === 'AUTOMATIC'
    );
    if (!automatic) return;
    setScoreP1(automatic.score_player1);
    setScoreP2(automatic.score_player2);
  }, [selectedDuel]);

  const selectDuel = (duel: DuelToEvaluate) => {
    setSelectedDuel(duel);
  };

  const loadDuels = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [res, profileRes] = await Promise.all([
        fetch(
          (() => {
            const requestedId = new URLSearchParams(window.location.search).get('duel');
            return requestedId
              ? `/api/evaluations?duel=${encodeURIComponent(requestedId)}`
              : '/api/evaluations';
          })()
        ),
        fetch('/api/evaluators/eligibility').catch(() => null),
      ]);
      if (res && 'ok' in res && res.ok) {
        const data = await res.json();
        const requestedId = new URLSearchParams(window.location.search).get('duel');
        setMissingRequestedDuel(
          requestedId && !data.some((duel: DuelToEvaluate) => duel.id === requestedId)
            ? requestedId
            : null
        );
        setDuels(data);
        if (data.length > 0) {
          setSelectedDuel((prev) => {
            if (!prev) {
              const requestedId = new URLSearchParams(window.location.search).get('duel');
              return data.find((duel: DuelToEvaluate) => duel.id === requestedId) || data[0];
            }
            const stillExists = data.find((d: DuelToEvaluate) => d.id === prev.id);
            return stillExists || data[0];
          });
        } else {
          setSelectedDuel(null);
        }
      } else if (res && 'ok' in res) {
        const errorData = await res.json().catch(() => null);
        setErrorMessage(
          errorData?.message ||
            errorData?.error ||
            'Não foi possível carregar a fila de avaliações.'
        );
      }
      if (profileRes && 'ok' in profileRes && profileRes.ok) {
        const profileData = await profileRes.json().catch(() => null);
        setEvaluatorProfile(profileData?.evaluatorProfile || null);
      }
    } catch (err) {
      console.error('Error loading evaluations:', err);
      setErrorMessage('Erro de conexão ao carregar a fila.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (code: string, player: 'p1' | 'p2') => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedPlayer(player);
      setTimeout(() => {
        setCopiedPlayer((prev) => (prev === player ? null : prev));
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
      setErrorMessage('Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedDuel ||
      !winnerId ||
      submitting ||
      !selectedDuel.solutions.some((s) => s.user_id === selectedDuel.challenger.id) ||
      !selectedDuel.solutions.some((s) => s.user_id === selectedDuel.opponent?.id)
    )
      return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duel_id: selectedDuel.id,
          score_player1: Number(scoreP1),
          score_player2: Number(scoreP2),
          winner_id: winnerId,
          human_feedback: feedback,
          strengths: strengths
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          improvements: improvements
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        setSuccessMessage('Avaliação de código homologada com sucesso!');
        loadDuels();
        setFeedback('');
        setStrengths('');
        setImprovements('');
        setWinnerId('');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.message || data?.error || 'Não foi possível enviar a avaliação.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro inesperado ao enviar avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  const p1Solution = selectedDuel?.solutions.find((s) => s.user_id === selectedDuel.challenger.id);
  const p2Solution = selectedDuel?.solutions.find((s) => s.user_id === selectedDuel.opponent?.id);
  const parsedProblem = selectedDuel ? parseProblemFromJson(selectedDuel.problem_body) : null;
  const problemDescription = parsedProblem?.description ?? selectedDuel?.problem_body ?? '';

  const participants = selectedDuel
    ? [selectedDuel.challenger, selectedDuel.opponent].filter(
        (player): player is NonNullable<typeof player> => Boolean(player)
      )
    : [];
  const solutionsReady = Boolean(p1Solution && p2Solution && selectedDuel?.opponent);

  return (
    <PlatformPageShell user={user}>
      <PlatformPageHeader
        title="Central de avaliações"
        actions={
          <button
            type="button"
            className={styles.secondary}
            onClick={() => void loadDuels()}
            disabled={loading}
            aria-label="Atualizar fila"
            title="Atualizar fila de duelos"
          >
            <RefreshCw size={17} aria-hidden="true" />
            <span>{loading ? 'Atualizando…' : 'Atualizar'}</span>
          </button>
        }
      />
      <div className={styles.body}>
        <section className={styles.intro}>
          <h2>Uma decisão bem fundamentada.</h2>
          <p>
            Revise os duelos encaminhados para análise humana nas suas tecnologias. Leia o desafio,
            compare os códigos e explique o resultado aos participantes.
          </p>
        </section>
        {successMessage && (
          <p role="status" className={styles.notice}>
            {successMessage}
          </p>
        )}
        {missingRequestedDuel && (
          <p role="status" className={styles.notice}>
            O duelo solicitado já foi resolvido ou não está disponível nesta fila.{' '}
            <Link
              className="underline underline-offset-4"
              href={`/duels/${encodeURIComponent(missingRequestedDuel)}`}
            >
              Abrir o duelo e conferir o resultado
            </Link>
            .
          </p>
        )}
        {errorMessage && (
          <p role="alert" className={`${styles.notice} ${styles.error}`}>
            {errorMessage}
          </p>
        )}
        {evaluatorProfile && (
          <section aria-label="Seu perfil de avaliador">
            <dl className={styles.metrics}>
              <div>
                <dt>Nível de avaliador</dt>
                <dd>
                  {getEvaluatorLevel(
                    evaluatorProfile.evaluations_count,
                    evaluatorProfile.reputation
                  )}
                </dd>
              </div>
              <div>
                <dt>Reputação</dt>
                <dd>{evaluatorProfile.reputation} / 100</dd>
              </div>
              <div>
                <dt>Avaliações concluídas</dt>
                <dd>{evaluatorProfile.evaluations_count}</dd>
              </div>
              <div>
                <dt>Situação</dt>
                <dd>
                  {(
                    {
                      ACTIVE: 'Ativo',
                      PROBATION: 'Em observação',
                      SUSPENDED: 'Suspenso',
                    } as Record<string, string>
                  )[evaluatorProfile.status] || evaluatorProfile.status}
                </dd>
              </div>
            </dl>
            <p className={styles.muted} style={{ marginTop: 12 }}>
              Tecnologias: {evaluatorProfile.tech_stack.join(', ')} · +10 XP por avaliação
              concluída.
            </p>
          </section>
        )}
        <EvaluatorGuide context="evaluation" />
        {loading ? (
          <p role="status" className={styles.muted}>
            Carregando duelos pendentes de avaliação…
          </p>
        ) : !duels.length && !errorMessage ? (
          <section className={styles.empty}>
            <CheckCircle2 size={32} aria-hidden="true" />
            <h2>Fila de Avaliações em Dia</h2>
            <p>Nenhum duelo pendente de homologação</p>
            <p>
              Novos duelos compatíveis com suas tecnologias aparecerão aqui. Você também receberá
              uma notificação quando houver uma revisão disponível.
            </p>
            <Link href="/duels" className={styles.secondary}>
              Ver duelos na plataforma
            </Link>
          </section>
        ) : (
          duels.length > 0 && (
            <>
              <section className={styles.section}>
                <h2>Fila de duelos ({duels.length})</h2>
                <p className={styles.muted}>
                  Selecione um duelo para revisar. Cada decisão pode ser homologada uma única vez.
                </p>
                <div className={styles.queue}>
                  {duels.map((duel) => (
                    <button
                      type="button"
                      key={duel.id}
                      className={styles.queueItem}
                      aria-pressed={selectedDuel?.id === duel.id}
                      disabled={submitting}
                      onClick={() => selectDuel(duel)}
                    >
                      <span>{duel.language}</span>
                      <strong>{duel.problem_title}</strong>
                      <span>
                        @{duel.challenger.username} × @{duel.opponent?.username || 'Sem oponente'}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              {selectedDuel && (
                <>
                  <section className={styles.section}>
                    <div className={styles.footer}>
                      <h2>{selectedDuel.problem_title}</h2>
                      <span className={styles.muted}>
                        <span>{parsedProblem?.difficulty}</span> ·{' '}
                        <span>{selectedDuel.language}</span>
                      </span>
                    </div>
                    <p className={styles.problem}>{problemDescription}</p>
                    {parsedProblem?.constraints?.length ? (
                      <ul className={styles.constraints}>
                        {parsedProblem.constraints.map((constraint) => (
                          <li key={constraint}>{constraint}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                  <section className={styles.section}>
                    <h2>Compare as soluções</h2>
                    <p className={styles.muted}>
                      Use os mesmos critérios para os dois participantes. Códigos longos podem ser
                      rolados dentro do bloco.
                    </p>
                    <div className={styles.chips} aria-label="Exibição dos códigos">
                      <button
                        type="button"
                        className={styles.chip}
                        aria-pressed={codeViewMode === 'both'}
                        onClick={() => setCodeViewMode('both')}
                      >
                        <Columns2
                          size={15}
                          style={{ display: 'inline', marginRight: 6 }}
                          aria-hidden="true"
                        />
                        Lado a lado
                      </button>
                      {participants.map((player, index) => (
                        <button
                          type="button"
                          key={player.id}
                          className={styles.chip}
                          aria-pressed={codeViewMode === (index === 0 ? 'p1' : 'p2')}
                          onClick={() => setCodeViewMode(index === 0 ? 'p1' : 'p2')}
                        >
                          @{player.username}
                        </button>
                      ))}
                    </div>
                    <div className={styles.codeGrid} data-both={codeViewMode === 'both'}>
                      {participants.map((player, index) => {
                        const key = index === 0 ? 'p1' : 'p2';
                        if (codeViewMode !== 'both' && codeViewMode !== key) return null;
                        const solution = index === 0 ? p1Solution : p2Solution;
                        return (
                          <article key={player.id} className={styles.codeCard}>
                            <header className={styles.codeHeader}>
                              <strong>@{player.username}</strong>
                              <button
                                type="button"
                                title={`Copiar código do Jogador ${index + 1}`}
                                disabled={!solution}
                                onClick={() => void handleCopyCode(solution?.code || '', key)}
                              >
                                {copiedPlayer === key ? <Check size={17} /> : <Copy size={17} />}
                                <span>{copiedPlayer === key ? 'Copiado' : 'Copiar'}</span>
                              </button>
                            </header>
                            <pre tabIndex={0} aria-label={`Código de @${player.username}`}>
                              <code>
                                {solution?.code || 'Este participante não enviou uma solução.'}
                              </code>
                            </pre>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                  <section className={styles.section}>
                    <h2>Formulário de homologação da avaliação</h2>
                    <p className={styles.muted}>
                      Revise as notas de 0 a 1.000, escolha o vencedor e registre uma justificativa
                      técnica. A decisão conclui o duelo e notifica os participantes.
                    </p>
                    {!solutionsReady && (
                      <p role="alert" className={styles.notice}>
                        Este duelo ainda não possui as duas soluções. Atualize a fila antes de
                        avaliar.
                      </p>
                    )}
                    <form
                      className={styles.form}
                      style={{ marginTop: 20 }}
                      onSubmit={handleSubmitEvaluation}
                    >
                      <fieldset disabled={submitting || !solutionsReady}>
                        <legend style={{ marginBottom: 10 }}>Quem venceu?</legend>
                        <div className={styles.twoFields}>
                          {participants.map((player) => (
                            <label key={player.id} className={styles.winner}>
                              <input
                                type="radio"
                                required
                                name="duel-winner"
                                value={player.id}
                                checked={winnerId === player.id}
                                onChange={(event) => setWinnerId(event.target.value)}
                              />
                              @{player.username}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <div className={styles.twoFields}>
                        {participants.map((player, index) => (
                          <div className={styles.field} key={player.id}>
                            <label htmlFor={`score-${index}`}>Nota de @{player.username}</label>
                            <input
                              id={`score-${index}`}
                              type="number"
                              required
                              min={0}
                              max={1000}
                              step={1}
                              value={index === 0 ? scoreP1 : scoreP2}
                              disabled={submitting || !solutionsReady}
                              onChange={(event) =>
                                (index === 0 ? setScoreP1 : setScoreP2)(Number(event.target.value))
                              }
                            />
                            <small>De 0 a 1.000 pontos</small>
                          </div>
                        ))}
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="human-feedback">Justificativa técnica</label>
                        <textarea
                          id="human-feedback"
                          required
                          minLength={5}
                          maxLength={10000}
                          disabled={submitting || !solutionsReady}
                          value={feedback}
                          onChange={(event) => setFeedback(event.target.value)}
                          placeholder="Explique a avaliação de legibilidade, desempenho, casos limite e a escolha do vencedor."
                        />
                        <small>
                          Cite cada participante e explique como o código sustenta sua decisão.
                        </small>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="strengths">
                          Pontos fortes <span className={styles.muted}>(opcional)</span>
                        </label>
                        <input
                          id="strengths"
                          value={strengths}
                          disabled={submitting || !solutionsReady}
                          onChange={(event) => setStrengths(event.target.value)}
                          placeholder="Clean code, tipagem estrita"
                        />
                        <small>Separe os pontos por vírgula.</small>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="improvements">
                          Oportunidades de melhoria <span className={styles.muted}>(opcional)</span>
                        </label>
                        <input
                          id="improvements"
                          value={improvements}
                          disabled={submitting || !solutionsReady}
                          onChange={(event) => setImprovements(event.target.value)}
                          placeholder="Tratamento de erros, nomenclatura"
                        />
                        <small>Separe as sugestões por vírgula.</small>
                      </div>
                      <button
                        type="submit"
                        className={styles.button}
                        disabled={
                          submitting || !solutionsReady || !winnerId || feedback.trim().length < 5
                        }
                      >
                        {submitting ? 'Homologando…' : 'Homologar avaliação e concluir duelo'}
                        <Swords size={17} aria-hidden="true" />
                      </button>
                    </form>
                  </section>
                </>
              )}
            </>
          )
        )}
      </div>
    </PlatformPageShell>
  );
}
