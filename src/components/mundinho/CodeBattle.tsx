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
import { PixelAvatar } from './PixelArt';

const OBJECT_SPRITES = [
  'Caminho',
  'Cristal',
  'Flor',
  'Lanterna',
  'Alavanca',
  'Rocha',
  'Baú',
  'Canteiro',
  'Bichinho',
  'Máquina',
  'Gaiola',
  'Fruto',
  'Muda',
  'Altar',
  'Concluído',
];

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
          aria-label={`Personagem na casa ${position + 1} de ${challenge.tiles.length}. ${completed.length} de ${challenge.target} objetivos concluídos. ${challenge.tiles.map((tile, index) => `Casa ${index + 1}: ${tile.label}${completed.includes(index) ? ' (concluído)' : ''}`).join('. ')}.`}
          style={{
            gridTemplateColumns: `repeat(${challenge.tiles.length}, var(--code-tile-width))`,
          }}
        >
          {challenge.tiles.map((tile, index) => {
            const done = completed.includes(index);
            const sprite = OBJECT_SPRITES.indexOf(done ? 'Concluído' : tile.label);
            return (
              <div
                key={index}
                data-player={position === index ? '' : undefined}
                className={`ad-code-tile${done ? ' is-complete' : ''}`}
              >
                <span
                  className="ad-code-object"
                  aria-hidden="true"
                  data-object={tile.label}
                  style={{
                    backgroundImage: `url(${adventureAsset('challenge-objects.png', '/assets/mundinho')})`,
                    backgroundPositionX: `${(Math.max(0, sprite) / (OBJECT_SPRITES.length - 1)) * 100}%`,
                  }}
                />
                {position === index && <PixelAvatar avatar={avatar} direction="right" />}
                <span className="ad-code-tile-label" aria-hidden="true">
                  {tile.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
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
        <pre aria-hidden="true">
          {source
            .split('\n')
            .map((_, index) => index + 1)
            .join('\n')}
        </pre>
        <textarea
          aria-label="Código da batalha"
          wrap="off"
          rows={6}
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
            ? 'Objetivo concluído! Confirme para atacar.'
            : (result.error ?? 'Revise o código e execute novamente.')
          : 'Execute para testar. Testar não consome o turno.'}
      </p>
    </section>
  );
}
