'use client';

import { useCallback, useEffect, useState } from 'react';
import { Braces, CheckCircle, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { LanguageTag } from '@/components/LanguageTag';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import {
  MAX_EVENT_CHALLENGE_EXAMPLES,
  MAX_EVENT_CHALLENGES,
  MIN_EVENT_CHALLENGES,
  type EventChallengeExample,
} from '@/lib/event-challenges';

const LANGUAGES = ['PYTHON', 'JS', 'TS', 'JAVA', 'RUST', 'GO', 'KOTLIN', 'SWIFT', 'CPP'] as const;

interface EventChallengeItem {
  id: string;
  position: number;
  title: string;
  statement: string;
  language: (typeof LANGUAGES)[number];
  expected_answer?: string;
  examples: EventChallengeExample[];
}

interface EventChallengesResponse {
  challenges: EventChallengeItem[];
  can_manage: boolean;
  can_edit: boolean;
  event_status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  limits: { min: number; max: number };
}

interface ChallengeDraft {
  localId: string;
  title: string;
  statement: string;
  language: (typeof LANGUAGES)[number];
  expected_answer: string;
  examples: EventChallengeExample[];
}

function emptyExample(): EventChallengeExample {
  return { input: '', output: '', explanation: '' };
}

function emptyChallenge(): ChallengeDraft {
  return {
    localId: crypto.randomUUID(),
    title: '',
    statement: '',
    language: 'TS',
    expected_answer: '',
    examples: [emptyExample()],
  };
}

function toDraft(challenge: EventChallengeItem): ChallengeDraft {
  return {
    localId: challenge.id,
    title: challenge.title,
    statement: challenge.statement,
    language: challenge.language,
    expected_answer: challenge.expected_answer ?? '',
    examples: challenge.examples.map((example) => ({ ...example })),
  };
}

export function EventChallengesSection({ eventId }: { eventId: string }) {
  const { text } = useLocalizedText();
  const [data, setData] = useState<EventChallengesResponse | null>(null);
  const [drafts, setDrafts] = useState<ChallengeDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/challenges`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Falha ao carregar os desafios.');
      }
      setData(result);
      setDrafts(result.challenges.map(toDraft));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Não foi possível carregar os desafios.'
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadChallenges();
  }, [loadChallenges]);

  const beginEditing = () => {
    const initialDrafts = data?.challenges.length
      ? data.challenges.map(toDraft)
      : Array.from({ length: MIN_EVENT_CHALLENGES }, emptyChallenge);
    setDrafts(initialDrafts);
    setError(null);
    setSuccess(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDrafts(data?.challenges.map(toDraft) ?? []);
    setError(null);
    setEditing(false);
  };

  const updateChallenge = (index: number, updates: Partial<ChallengeDraft>) => {
    setDrafts((current) =>
      current.map((challenge, challengeIndex) =>
        challengeIndex === index ? { ...challenge, ...updates } : challenge
      )
    );
  };

  const updateExample = (
    challengeIndex: number,
    exampleIndex: number,
    updates: Partial<EventChallengeExample>
  ) => {
    setDrafts((current) =>
      current.map((challenge, currentChallengeIndex) => {
        if (currentChallengeIndex !== challengeIndex) return challenge;
        return {
          ...challenge,
          examples: challenge.examples.map((example, currentExampleIndex) =>
            currentExampleIndex === exampleIndex ? { ...example, ...updates } : example
          ),
        };
      })
    );
  };

  const addExample = (challengeIndex: number) => {
    const challenge = drafts[challengeIndex];
    if (!challenge || challenge.examples.length >= MAX_EVENT_CHALLENGE_EXAMPLES) return;
    updateChallenge(challengeIndex, { examples: [...challenge.examples, emptyExample()] });
  };

  const removeExample = (challengeIndex: number, exampleIndex: number) => {
    const challenge = drafts[challengeIndex];
    if (!challenge || challenge.examples.length <= 1) return;
    updateChallenge(challengeIndex, {
      examples: challenge.examples.filter((_, index) => index !== exampleIndex),
    });
  };

  const saveChallenges = async () => {
    if (drafts.length < MIN_EVENT_CHALLENGES || drafts.length > MAX_EVENT_CHALLENGES) {
      setError(
        text(
          `Crie entre ${MIN_EVENT_CHALLENGES} e ${MAX_EVENT_CHALLENGES} desafios.`,
          `Create between ${MIN_EVENT_CHALLENGES} and ${MAX_EVENT_CHALLENGES} challenges.`
        )
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/events/${eventId}/challenges`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenges: drafts.map(({ title, statement, language, expected_answer, examples }) => ({
            title,
            statement,
            language,
            expected_answer,
            examples,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Falha ao salvar os desafios.');
      }

      setData(result);
      setDrafts(result.challenges.map(toDraft));
      setEditing(false);
      setSuccess(text('Desafios salvos com sucesso.', 'Challenges saved successfully.'));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dd-border bg-dd-surface p-4 text-xs font-bold text-dd-muted">
        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
        {text('Carregando desafios de código...', 'Loading coding challenges...')}
      </div>
    );
  }

  return (
    <section aria-labelledby="event-challenges-title" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3
            id="event-challenges-title"
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-400"
          >
            <Braces className="h-4 w-4" />
            {text('Desafios de código', 'Coding challenges')}
            {data && data.challenges.length > 0 && ` (${data.challenges.length})`}
          </h3>
          <p className="mt-1 text-[11px] font-medium text-dd-muted">
            {text(
              `O conjunto deve ter de ${MIN_EVENT_CHALLENGES} a ${MAX_EVENT_CHALLENGES} desafios.`,
              `The set must contain ${MIN_EVENT_CHALLENGES} to ${MAX_EVENT_CHALLENGES} challenges.`
            )}
          </p>
        </div>

        {!editing && data?.can_edit && (
          <button
            type="button"
            onClick={beginEditing}
            className="dd-focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 text-xs font-black text-purple-300 hover:bg-purple-500/20"
          >
            <Pencil className="h-3.5 w-3.5" />
            {data.challenges.length > 0
              ? text('Editar desafios', 'Edit challenges')
              : text('Criar desafios', 'Create challenges')}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {editing ? (
        <div className="space-y-4">
          {drafts.map((challenge, challengeIndex) => (
            <div
              key={challenge.localId}
              className="space-y-4 rounded-2xl border border-dd-border bg-dd-surface p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-dd-text">
                  {text('Desafio', 'Challenge')} {challengeIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDrafts((current) =>
                      current.filter((_, currentIndex) => currentIndex !== challengeIndex)
                    )
                  }
                  disabled={drafts.length <= MIN_EVENT_CHALLENGES}
                  aria-label={text('Remover desafio', 'Remove challenge')}
                  className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
                <label className="space-y-1 text-[11px] font-bold text-dd-muted">
                  {text('Título', 'Title')}
                  <input
                    value={challenge.title}
                    onChange={(event) =>
                      updateChallenge(challengeIndex, { title: event.target.value })
                    }
                    maxLength={120}
                    className="dd-focus-ring mt-1 w-full rounded-xl border border-dd-border bg-dd-bg px-3 py-2.5 text-xs font-semibold text-dd-text"
                    placeholder={text('Ex.: Soma eficiente', 'E.g. Efficient sum')}
                  />
                </label>
                <label className="space-y-1 text-[11px] font-bold text-dd-muted">
                  {text('Linguagem', 'Language')}
                  <select
                    value={challenge.language}
                    onChange={(event) =>
                      updateChallenge(challengeIndex, {
                        language: event.target.value as ChallengeDraft['language'],
                      })
                    }
                    className="dd-focus-ring mt-1 w-full rounded-xl border border-dd-border bg-dd-bg px-3 py-2.5 text-xs font-semibold text-dd-text"
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1 text-[11px] font-bold text-dd-muted">
                {text('Enunciado', 'Statement')}
                <textarea
                  value={challenge.statement}
                  onChange={(event) =>
                    updateChallenge(challengeIndex, { statement: event.target.value })
                  }
                  maxLength={10_000}
                  rows={5}
                  className="dd-focus-ring mt-1 w-full resize-y rounded-xl border border-dd-border bg-dd-bg px-3 py-2.5 text-xs font-semibold leading-5 text-dd-text"
                  placeholder={text(
                    'Explique o problema, as entradas, as saídas e as restrições.',
                    'Explain the problem, inputs, outputs, and constraints.'
                  )}
                />
              </label>

              <label className="block space-y-1 text-[11px] font-bold text-dd-muted">
                {text('Resposta esperada', 'Expected answer')}
                <textarea
                  value={challenge.expected_answer}
                  onChange={(event) =>
                    updateChallenge(challengeIndex, { expected_answer: event.target.value })
                  }
                  maxLength={20_000}
                  rows={4}
                  className="dd-focus-ring mt-1 w-full resize-y rounded-xl border border-dd-border bg-dd-bg px-3 py-2.5 font-mono text-xs leading-5 text-dd-text"
                  placeholder={text(
                    'Informe a saída ou solução usada como referência privada.',
                    'Enter the output or solution used as the private reference.'
                  )}
                />
                <span className="block font-medium text-dd-muted/80">
                  {text(
                    'Visível somente para o criador do evento e administradores.',
                    'Visible only to the event creator and administrators.'
                  )}
                </span>
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-black uppercase tracking-wide text-dd-muted">
                    {text('Exemplos', 'Examples')}
                  </span>
                  <button
                    type="button"
                    onClick={() => addExample(challengeIndex)}
                    disabled={challenge.examples.length >= MAX_EVENT_CHALLENGE_EXAMPLES}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-black text-purple-300 hover:bg-purple-500/10 disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {text('Adicionar exemplo', 'Add example')}
                  </button>
                </div>

                {challenge.examples.map((example, exampleIndex) => (
                  <div
                    key={`${challenge.localId}-example-${exampleIndex}`}
                    className="grid gap-3 rounded-xl border border-dd-border/70 bg-dd-bg/60 p-3 sm:grid-cols-2"
                  >
                    <label className="text-[10px] font-bold text-dd-muted">
                      {text('Entrada', 'Input')}
                      <textarea
                        value={example.input}
                        onChange={(event) =>
                          updateExample(challengeIndex, exampleIndex, { input: event.target.value })
                        }
                        rows={2}
                        className="dd-focus-ring mt-1 w-full resize-y rounded-lg border border-dd-border bg-dd-bg p-2 font-mono text-xs text-dd-text"
                      />
                    </label>
                    <label className="text-[10px] font-bold text-dd-muted">
                      {text('Saída', 'Output')}
                      <textarea
                        value={example.output}
                        onChange={(event) =>
                          updateExample(challengeIndex, exampleIndex, {
                            output: event.target.value,
                          })
                        }
                        rows={2}
                        className="dd-focus-ring mt-1 w-full resize-y rounded-lg border border-dd-border bg-dd-bg p-2 font-mono text-xs text-dd-text"
                      />
                    </label>
                    <label className="text-[10px] font-bold text-dd-muted sm:col-span-2">
                      {text('Explicação opcional', 'Optional explanation')}
                      <input
                        value={example.explanation ?? ''}
                        onChange={(event) =>
                          updateExample(challengeIndex, exampleIndex, {
                            explanation: event.target.value,
                          })
                        }
                        className="dd-focus-ring mt-1 w-full rounded-lg border border-dd-border bg-dd-bg p-2 text-xs text-dd-text"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeExample(challengeIndex, exampleIndex)}
                      disabled={challenge.examples.length <= 1}
                      className="justify-self-end rounded-lg px-2 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/10 disabled:opacity-30 sm:col-span-2"
                    >
                      {text('Remover exemplo', 'Remove example')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDrafts((current) => [...current, emptyChallenge()])}
              disabled={drafts.length >= MAX_EVENT_CHALLENGES}
              className="dd-focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-dd-border px-3 text-xs font-black text-dd-text hover:border-purple-500/50 disabled:opacity-40"
            >
              <Plus className="h-4 w-4 text-purple-400" />
              {text('Adicionar desafio', 'Add challenge')} ({drafts.length}/{MAX_EVENT_CHALLENGES})
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="min-h-10 rounded-xl px-3 text-xs font-bold text-dd-muted hover:bg-dd-surface"
              >
                {text('Cancelar', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={saveChallenges}
                disabled={saving}
                className="dd-focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-purple-600 px-4 text-xs font-black text-white hover:bg-purple-500 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {text('Salvar conjunto', 'Save set')}
              </button>
            </div>
          </div>
        </div>
      ) : data && data.challenges.length > 0 ? (
        <div className="space-y-2">
          {data.challenges.map((challenge) => (
            <details
              key={challenge.id}
              className="group rounded-xl border border-dd-border bg-dd-surface open:border-purple-500/35"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                <span className="min-w-0 text-xs font-black text-dd-text">
                  {challenge.position}. {challenge.title}
                </span>
                <LanguageTag language={challenge.language} size="sm" />
              </summary>
              <div className="space-y-4 border-t border-dd-border px-4 py-4">
                <p className="whitespace-pre-line text-xs font-medium leading-5 text-dd-text">
                  {challenge.statement}
                </p>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wide text-dd-muted">
                    {text('Exemplos', 'Examples')}
                  </span>
                  {challenge.examples.map((example, index) => (
                    <div
                      key={`${challenge.id}-view-example-${index}`}
                      className="grid gap-2 rounded-lg border border-dd-border/70 bg-dd-bg p-3 sm:grid-cols-2"
                    >
                      <div>
                        <span className="text-[9px] font-black uppercase text-dd-muted">
                          {text('Entrada', 'Input')}
                        </span>
                        <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] text-dd-text">
                          {example.input || text('Sem entrada', 'No input')}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-dd-muted">
                          {text('Saída', 'Output')}
                        </span>
                        <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] text-dd-text">
                          {example.output}
                        </pre>
                      </div>
                      {example.explanation && (
                        <p className="text-[11px] font-medium leading-5 text-dd-muted sm:col-span-2">
                          {example.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {challenge.expected_answer && data.can_manage && (
                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
                    <span className="text-[9px] font-black uppercase text-amber-400">
                      {text('Resposta esperada — privada', 'Expected answer — private')}
                    </span>
                    <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[11px] text-dd-text">
                      {challenge.expected_answer}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-dd-border bg-dd-surface/50 p-5 text-center text-xs font-medium text-dd-muted">
          {data?.can_manage
            ? text(
                'Este evento ainda não possui desafios. Crie o conjunto antes do encerramento.',
                'This event has no challenges yet. Create the set before it ends.'
              )
            : text(
                'O organizador ainda não publicou os desafios deste evento.',
                'The organizer has not published this event’s challenges yet.'
              )}
        </div>
      )}

      {data?.can_manage && !data.can_edit && (
        <p className="text-[11px] font-medium text-dd-muted">
          {text(
            'O evento foi encerrado; os desafios agora estão disponíveis somente para leitura.',
            'The event has ended; challenges are now read-only.'
          )}
        </p>
      )}
    </section>
  );
}
