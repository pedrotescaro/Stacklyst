import { useEffect, useState } from 'react';
import { Play, Swords } from 'lucide-react';
import type { AdventureState, Avatar, CodeRun, PublicQuestion } from '../../lib/mundinho/types';
import { PixelAvatar } from './PixelArt';

export function CodeBattle({
  question,
  avatar,
  busy,
  onExecute,
}: {
  question: PublicQuestion;
  avatar: Avatar;
  busy: boolean;
  onExecute: (code: string, submit: boolean) => Promise<AdventureState | undefined>;
}) {
  const [source, setSource] = useState(question.code!.starter);
  const [result, setResult] = useState<CodeRun | null>(null);
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    if (!result) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(result.trace.length);
      return;
    }
    const timer = setInterval(
      () =>
        setStep((value) => {
          if (value >= result.trace.length) {
            clearInterval(timer);
            return value;
          }
          return value + 1;
        }),
      240
    );
    return () => clearInterval(timer);
  }, [result]);
  let position = 0;
  const collected = new Set<number>();
  for (const command of result?.trace.slice(0, step) ?? []) {
    if (command === 'andar') position = Math.min(3, position + 1);
    else if (command === 'coletar' && position > 0) collected.add(position);
  }
  const execute = async (submit: boolean) => {
    const response = await onExecute(source, submit);
    if (response?.codeRun) setResult(response.codeRun);
  };
  return (
    <section className="ad-code-challenge" aria-label="Desafio de código da batalha">
      <h3>Clareira dos cristais</h3>
      <p>{question.prompt}</p>
      <div
        className="ad-code-board"
        role="img"
        aria-label={`${collected.size} de 3 cristais coletados`}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="ad-code-tile">
            {index > 0 && !collected.has(index) && (
              <span className="ad-code-crystal" aria-label="Cristal" />
            )}
            {position === index && <PixelAvatar avatar={avatar} direction="right" />}
          </div>
        ))}
      </div>
      <p className="ad-code-commands">
        Comandos:{' '}
        {question.code!.commands.map((command) => (
          <code key={command}>{command}</code>
        ))}
      </p>
      <div className="ad-code-editor">
        <pre aria-hidden="true">
          {source
            .split('\n')
            .map((_, index) => index + 1)
            .join('\n')}
        </pre>
        <textarea
          aria-label="Código da batalha"
          wrap="off"
          value={source}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          disabled={busy}
          onChange={(event) => {
            setSource(event.target.value);
            setResult(null);
          }}
        />
      </div>
      <div className="ad-code-actions">
        <button
          className="ad-code-run"
          disabled={busy || !source.trim()}
          onClick={() => void execute(false)}
        >
          <Play size={17} />
          {busy ? 'Aguarde…' : 'Executar'}
        </button>
        <button
          className="ad-primary"
          disabled={busy || !source.trim()}
          onClick={() => void execute(true)}
        >
          <Swords size={17} />
          Confirmar ataque
        </button>
      </div>
      <p role="status" aria-live="polite" className="ad-code-result">
        {result
          ? result.passed
            ? 'Três cristais coletados! Confirme para atacar.'
            : (result.error ?? 'Revise o código e execute novamente.')
          : 'Execute para testar. Testar não consome o turno.'}
      </p>
    </section>
  );
}
