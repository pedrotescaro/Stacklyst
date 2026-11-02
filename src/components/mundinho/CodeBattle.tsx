import { useEffect, useRef, useState } from 'react';
import { Play, Swords } from 'lucide-react';
import { adventureAsset } from './assets';
import type {
  AdventureState,
  Avatar,
  BattleLanguage,
  CodeRun,
  PublicQuestion,
} from '../../lib/mundinho/types';
import { replayTrace } from '../../lib/mundinho/codeChallenges';
import { codePathInfo } from '../../lib/mundinho/code-paths';
import OBJECT_SPRITES from '../../lib/mundinho/challenge-sprites.json';
import { PixelAvatar } from './PixelArt';

export function CodeBattle({
  question,
  avatar,
  busy,
  onExecute,
  battleLanguage,
}: {
  question: PublicQuestion;
  avatar: Avatar;
  busy: boolean;
  onExecute: (code: string, submit: boolean) => Promise<AdventureState | undefined>;
  battleLanguage?: BattleLanguage;
}) {
  const [source, setSource] = useState(question.code!.starter);
  const [result, setResult] = useState<CodeRun | null>(null);
  const [step, setStep] = useState(0);
  const boardScroll = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const lineNumbers = useRef<HTMLPreElement>(null);
  const sourceLines = source.split('\n');
  const syncEditorScroll = (scrollTop: number) => {
    if (lineNumbers.current) lineNumbers.current.style.transform = `translateY(${-scrollTop}px)`;
  };
  useEffect(() => {
    syncEditorScroll(editor.current?.scrollTop ?? 0);
  }, [source]);
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
  const challenge = question.code!;
  const { position, completed } = replayTrace(question, result?.trace.slice(0, step) ?? []);
  useEffect(() => {
    const scroll = boardScroll.current;
    const player = scroll?.querySelector<HTMLElement>('[data-player]');
    if (!scroll || !player || scroll.scrollWidth <= scroll.clientWidth) return;
    scroll.scrollLeft = player.offsetLeft + player.offsetWidth / 2 - scroll.clientWidth / 2;
  }, [position]);
  const execute = async (submit: boolean) => {
    const response = await onExecute(source, submit);
    if (response?.codeRun) setResult(response.codeRun);
  };
  return (
    <section className="ad-code-challenge" aria-label="Desafio de código da batalha">
      <h3>{challenge.title}</h3>
      <p>{question.prompt}</p>
      {!!challenge.requiredStructures?.length && (
        <p className="ad-code-learning-hint">
          <strong>
            Nível {challenge.level}:{' '}
            {challenge.requiredStructures.includes('loop')
              ? 'condições e repetição'
              : 'decisões com if e else'}
          </strong>
          {challenge.hint}
        </p>
      )}
      {(battleLanguage === 'HTML' || battleLanguage === 'CSS') && (
        <p className="ad-code-language">Este desafio usa JavaScript para controlar o mundo.</p>
      )}
      <div
        ref={boardScroll}
        className="ad-code-board-scroll"
        tabIndex={0}
        aria-label="Cenário do desafio"
      >
        <div
          className="ad-code-board"
          role="img"
          aria-label={`Personagem na casa ${position + 1} de ${challenge.tiles.length}. ${completed.length} de ${challenge.target} objetivos concluídos. ${challenge.tiles
            .map((tile, index) => {
              const path = codePathInfo(question, index);
              return `Casa ${index + 1}: ${path ? `Caminho ${path.kind === 'long' ? 'longo' : 'curto'}, trecho de ${path.steps} ${path.steps === 1 ? 'passo' : 'passos'}` : tile.label}${completed.includes(index) ? ' (concluído)' : ''}`;
            })
            .join('. ')}.`}
          style={{
            gridTemplateColumns: `repeat(${challenge.tiles.length}, var(--code-tile-width))`,
          }}
        >
          {challenge.tiles.map((tile, index) => {
            const done = completed.includes(index);
            const path = codePathInfo(question, index);
            const label = path ? `Caminho ${path.kind === 'long' ? 'longo' : 'curto'}` : tile.label;
            const sprite = OBJECT_SPRITES.indexOf(done ? 'Concluído' : label);
            return (
              <div
                key={index}
                data-player={position === index ? '' : undefined}
                data-path={path?.kind}
                className={`ad-code-tile${done ? ' is-complete' : ''}`}
              >
                <span
                  className="ad-code-object"
                  aria-hidden="true"
                  data-object={tile.label}
                  style={{
                    backgroundImage: `url(${adventureAsset('challenge-objects.png', '/assets/mundinho')})`,
                    backgroundPositionX: `${(Math.max(0, sprite) / (OBJECT_SPRITES.length - 1)) * 100}%`,
                    backgroundSize: `${OBJECT_SPRITES.length * 100}% 100%`,
                  }}
                />
                {position === index && <PixelAvatar avatar={avatar} direction="right" />}
                <span className="ad-code-tile-label" aria-hidden="true" title={label}>
                  {path ? (path.kind === 'long' ? 'Longo' : 'Curto') : label}
                  {path && (
                    <small>
                      {path.steps} {path.steps === 1 ? 'passo' : 'passos'}
                    </small>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="ad-code-path-hint">
        Cada comando de andar avança uma casa. Uma pedra indica trecho curto; duas, trecho longo. Os
        passos indicados são entre objetivos.
      </p>
      {challenge.tiles.length > 4 && (
        <p className="ad-code-scroll-hint">Deslize para ver todo o caminho.</p>
      )}
      <p className="ad-code-commands">
        Comandos:{' '}
        {challenge.commands.map((command) => (
          <code key={command}>{command}</code>
        ))}
      </p>
      <div className="ad-code-editor">
        <div
          className="ad-code-line-numbers"
          aria-hidden="true"
          style={{ width: `calc(${Math.max(2, String(sourceLines.length).length)}ch + 20px)` }}
        >
          <pre ref={lineNumbers}>{sourceLines.map((_, index) => index + 1).join('\n')}</pre>
        </div>
        <textarea
          ref={editor}
          aria-label="Código da batalha"
          wrap="off"
          rows={6}
          maxLength={8000}
          value={source}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          disabled={busy}
          onScroll={(event) => syncEditorScroll(event.currentTarget.scrollTop)}
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
            ? 'Objetivo concluído! Confirme para atacar.'
            : (result.error ?? 'Revise o código e execute novamente.')
          : 'Execute para testar. Testar não consome o turno.'}
      </p>
    </section>
  );
}
