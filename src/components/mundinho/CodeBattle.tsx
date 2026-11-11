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
import { useLocalizedText } from '../../i18n/useLocalizedText';
import { translateMundinho } from '../../lib/mundinho/i18n';

export function CodeBattle({
  question,
  avatar,
  busy,
  onExecute,
  onSkip,
  onEquipBugHunter,
  battleLanguage,
}: {
  question: PublicQuestion;
  avatar: Avatar;
  busy: boolean;
  onExecute: (
    code: string,
    submit: boolean
  ) => Promise<Pick<AdventureState, 'codeRun'> | undefined>;
  onSkip?: () => void;
  onEquipBugHunter?: () => void;
  battleLanguage?: BattleLanguage;
}) {
  const { text, isEnglish, language: uiLanguage } = useLocalizedText();
  const m = (value: string) => translateMundinho(value, uiLanguage);
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
    <section
      className="ad-code-challenge"
      aria-label={text('Desafio de código da batalha', 'Battle code challenge')}
    >
      <h3>{challenge.title}</h3>
      <p>{question.prompt}</p>
      {(onSkip || onEquipBugHunter) && (
        <div className="ad-code-ability">
          <p>
            {onSkip
              ? text(
                  'Caça-bugs equipado: você pode atacar sem resolver este exercício.',
                  'Bug Hunter equipped: you can attack without solving this exercise.'
                )
              : text(
                  'Você já possui Caça-bugs. Equipe o título para dispensar este exercício.',
                  'You already own Bug Hunter. Equip the title to skip this exercise.'
                )}
          </p>
          <button
            type="button"
            className="ad-code-skip"
            disabled={busy}
            onClick={onSkip ?? onEquipBugHunter}
          >
            {onSkip
              ? text('Usar Caça-bugs e atacar', 'Use Bug Hunter and attack')
              : text('Equipar Caça-bugs', 'Equip Bug Hunter')}
          </button>
        </div>
      )}
      {!!challenge.requiredStructures?.length && (
        <p className="ad-code-learning-hint">
          <strong>
            {text('Nível', 'Level')} {challenge.level}:{' '}
            {challenge.requiredStructures.includes('loop')
              ? text('condições e repetição', 'conditions and repetition')
              : text('decisões com if e else', 'decisions with if and else')}
          </strong>
          {challenge.hint}
        </p>
      )}
      {(battleLanguage === 'HTML' || battleLanguage === 'CSS') && (
        <p className="ad-code-language">
          {text(
            'Este desafio usa JavaScript para controlar o mundo.',
            'This challenge uses JavaScript to control the world.'
          )}
        </p>
      )}
      <div
        ref={boardScroll}
        className="ad-code-board-scroll"
        tabIndex={0}
        aria-label={text('Cenário do desafio', 'Challenge scene')}
      >
        <div
          className="ad-code-board"
          role="img"
          aria-label={
            isEnglish
              ? `Character on tile ${position + 1} of ${challenge.tiles.length}. ${completed.length} of ${challenge.target} goals completed. ${challenge.tiles
                  .map((tile, index) => {
                    const path = codePathInfo(question, index);
                    return `Tile ${index + 1}: ${path ? `${path.kind === 'long' ? 'Long' : 'Short'} path, ${path.steps} ${path.steps === 1 ? 'step' : 'steps'}` : m(tile.label)}${completed.includes(index) ? ' (done)' : ''}`;
                  })
                  .join('. ')}.`
              : `Personagem na casa ${position + 1} de ${challenge.tiles.length}. ${completed.length} de ${challenge.target} objetivos concluídos. ${challenge.tiles
                  .map((tile, index) => {
                    const path = codePathInfo(question, index);
                    return `Casa ${index + 1}: ${path ? `Caminho ${path.kind === 'long' ? 'longo' : 'curto'}, trecho de ${path.steps} ${path.steps === 1 ? 'passo' : 'passos'}` : tile.label}${completed.includes(index) ? ' (concluído)' : ''}`;
                  })
                  .join('. ')}.`
          }
          style={{
            gridTemplateColumns: `repeat(${challenge.tiles.length}, var(--code-tile-width))`,
          }}
        >
          {challenge.tiles.map((tile, index) => {
            const done = completed.includes(index);
            const path = codePathInfo(question, index);
            const label = path ? `Caminho ${path.kind === 'long' ? 'longo' : 'curto'}` : tile.label;
            const sprite = OBJECT_SPRITES.indexOf(done ? 'Concluído' : label);
            const displayLabel = path
              ? text(label, `${path.kind === 'long' ? 'Long' : 'Short'} path`)
              : m(label);
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
                <span className="ad-code-tile-label" aria-hidden="true" title={displayLabel}>
                  {path
                    ? path.kind === 'long'
                      ? text('Longo', 'Long')
                      : text('Curto', 'Short')
                    : displayLabel}
                  {path && (
                    <small>
                      {path.steps}{' '}
                      {path.steps === 1 ? text('passo', 'step') : text('passos', 'steps')}
                    </small>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="ad-code-path-hint">
        {text(
          'Cada comando de andar avança uma casa. Uma pedra indica trecho curto; duas, trecho longo. Os passos indicados são entre objetivos.',
          'Each move command advances one tile. One stone means a short stretch; two, a long one. The steps shown are between goals.'
        )}
      </p>
      {challenge.tiles.length > 4 && (
        <p className="ad-code-scroll-hint">
          {text('Deslize para ver todo o caminho.', 'Swipe to see the whole path.')}
        </p>
      )}
      <p className="ad-code-commands">
        {text('Comandos:', 'Commands:')}{' '}
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
          aria-label={text('Código da batalha', 'Battle code')}
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
          {busy ? text('Aguarde…', 'Please wait…') : text('Executar', 'Run')}
        </button>
        <button
          className="ad-primary"
          disabled={busy || !source.trim()}
          onClick={() => void execute(true)}
        >
          <Swords size={17} />
          {text('Confirmar ataque', 'Confirm attack')}
        </button>
      </div>
      <p role="status" aria-live="polite" className="ad-code-result">
        {result
          ? result.passed
            ? text('Objetivo concluído! Confirme para atacar.', 'Goal complete! Confirm to attack.')
            : result.error
              ? m(result.error)
              : text('Revise o código e execute novamente.', 'Review the code and run it again.')
          : text(
              'Execute para testar. Testar não consome o turno.',
              'Run to test. Testing does not use your turn.'
            )}
      </p>
    </section>
  );
}
