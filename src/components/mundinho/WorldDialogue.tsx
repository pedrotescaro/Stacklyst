import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Avatar } from '../../lib/mundinho/types';
import { AdaPortrait, Portrait } from './Portrait';
import { useLocalizedText } from '../../i18n/useLocalizedText';

type Line = readonly [pt: string, en: string];

/** Ada's answers come in short pages, like an old RPG text box. */
const topics: readonly { question: Line; answer: readonly Line[] }[] = [
  {
    question: ['Quem é você?', 'Who are you?'],
    answer: [
      [
        'Meu nome é uma homenagem a Ada Lovelace. Em 1843, ela publicou o primeiro algoritmo pensado para uma máquina: a Máquina Analítica de Charles Babbage.',
        'My name honours Ada Lovelace. In 1843 she published the first algorithm meant for a machine: Charles Babbage’s Analytical Engine.',
      ],
      [
        'Ela imaginou que essas máquinas poderiam ir além dos números e até compor música. Eu cuido desta clareira para ajudar você a dar os seus primeiros passos também.',
        'She imagined those machines could go beyond numbers and even compose music. I look after this clearing to help you take your first steps too.',
      ],
    ],
  },
  {
    question: ['Como enfrento os bugs?', 'How do I fight the bugs?'],
    answer: [
      [
        'Aproxime-se de uma criatura do seu nível e interaja com ela para começar a batalha.',
        'Approach a creature at your level and interact with it to start the battle.',
      ],
      [
        'Aplicar conceito causa dano, Depurar ajuda a recuperar vida e Refatorar aposta em um ataque mais forte.',
        'Apply concept deals damage, Debug helps restore HP and Refactor bets on a stronger attack.',
      ],
      [
        'Leia a pergunta com calma: entender o código faz parte da aventura!',
        'Read the question calmly: understanding the code is part of the adventure!',
      ],
    ],
  },
  {
    question: ['Quero mudar meu visual.', 'I want to change my look.'],
    answer: [
      [
        'Abra o editor de personagem na tela inicial. Lá você escolhe a silhueta do retrato, pele, olhos, cabelo, roupas e acessórios.',
        'Open the character editor on the home screen. There you choose the portrait silhouette, skin, eyes, hair, outfits and accessories.',
      ],
      [
        'Salve as alterações e vou reconhecer seu novo visual na próxima conversa. Os itens com moedas ficam na loja.',
        'Save your changes and I will recognize your new look in our next conversation. Items that cost coins are in the store.',
      ],
    ],
  },
  {
    question: ['O que há nesta clareira?', 'What is in this clearing?'],
    answer: [
      [
        'A placa tem uma dica de programação e o baú guarda 10 moedas por dia.',
        'The sign has a programming tip and the chest holds 10 coins a day.',
      ],
      [
        'O buraco com escadaria leva à arena: lá você pode convidar um amigo que também segue você.',
        'The hole with stairs leads to the arena: there you can invite a friend who also follows you.',
      ],
      [
        'As criaturas aparecem nas moitas. O Titã do Vazio é nível 10; continue suas lições nas Trilhas para enfrentá-lo!',
        'Creatures show up in the bushes. The Void Titan is level 10; keep up your lessons in Trails to face it!',
      ],
    ],
  },
];

/** Characters revealed per tick of the typewriter. */
const TYPE_STEP = 2;
const TYPE_MS = 28;

function prefersInstantText() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return Boolean(window.matchMedia('(prefers-reduced-motion: reduce)')?.matches);
}

/** Reveals `line` a few letters at a time; `finish` shows the rest at once. */
function useTypewriter(line: string) {
  const [state, setState] = useState({ line, shown: 0 });
  const shown = state.line === line ? state.shown : 0;
  if (state.line !== line) setState({ line, shown: 0 });
  const done = shown >= line.length;
  useEffect(() => {
    if (prefersInstantText()) {
      setState({ line, shown: line.length });
      return;
    }
    const timer = setInterval(() => {
      setState((current) => {
        if (current.line !== line || current.shown >= line.length) {
          clearInterval(timer);
          return current;
        }
        return { line, shown: Math.min(line.length, current.shown + TYPE_STEP) };
      });
    }, TYPE_MS);
    return () => clearInterval(timer);
  }, [line]);
  return {
    visible: line.slice(0, shown),
    done,
    finish: () => setState({ line, shown: line.length }),
  };
}

type Turn =
  | { speaker: 'greeting' }
  | { speaker: 'player'; topic: number }
  | { speaker: 'ada'; topic: number; page: number };

export function WorldDialogue({
  text,
  conversation,
  avatar,
  username,
  assetBase,
  onClose,
}: {
  text: string;
  conversation: boolean;
  avatar: Avatar;
  username: string;
  assetBase: string;
  onClose: () => void;
}) {
  const { text: tr } = useLocalizedText();
  const [turn, setTurn] = useState<Turn>({ speaker: 'greeting' });
  const panel = useRef<HTMLElement>(null);
  const titleId = useId();
  const textId = useId();
  const playerSpeaking = conversation && turn.speaker === 'player';
  const name = conversation ? (playerSpeaking ? username : 'Ada') : tr('Clareira', 'Clearing');
  const line = !conversation
    ? text
    : turn.speaker === 'greeting'
      ? tr(
          `Oi, ${username}! Sou a Ada. Cada erro é uma pista para a próxima tentativa. Sobre o que vamos conversar?`,
          `Hi, ${username}! I'm Ada. Every mistake is a clue for the next try. What shall we talk about?`
        )
      : turn.speaker === 'player'
        ? tr(...topics[turn.topic].question)
        : tr(...topics[turn.topic].answer[turn.page]);
  const typing = useTypewriter(line);
  const lastPage = turn.speaker === 'ada' && turn.page === topics[turn.topic].answer.length - 1;
  // A single "Continue" shows the classic blinking arrow once the text is out.
  const continues =
    !conversation || turn.speaker === 'player' || (turn.speaker === 'ada' && !lastPage);

  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
  }, [turn]);

  const advance = () => {
    if (!conversation) onClose();
    else if (turn.speaker === 'player') setTurn({ speaker: 'ada', topic: turn.topic, page: 0 });
    else if (turn.speaker === 'ada' && !lastPage) setTurn({ ...turn, page: turn.page + 1 });
  };

  return (
    <section
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={textId}
      className={`world-dialogue-panel ${conversation ? 'has-portrait' : ''}`}
      onClick={(event) => {
        // Tapping the box while text is still appearing shows it all at once.
        if (!typing.done && !(event.target as HTMLElement).closest('button')) typing.finish();
      }}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          return;
        }
        const key = event.key.toLowerCase();
        if (!typing.done && (key === 'enter' || key === ' ' || key === 'e')) {
          event.preventDefault();
          event.stopPropagation();
          typing.finish();
          return;
        }
        const buttons = Array.from(
          panel.current?.querySelectorAll<HTMLButtonElement>('.world-dialogue-actions button') ?? []
        );
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const delta = ['arrowleft', 'arrowup', 'a', 'w'].includes(key)
          ? -1
          : ['arrowright', 'arrowdown', 'd', 's'].includes(key)
            ? 1
            : 0;
        if (delta && buttons.length) {
          event.preventDefault();
          event.stopPropagation();
          buttons[
            current < 0
              ? delta > 0
                ? 0
                : buttons.length - 1
              : (current + delta + buttons.length) % buttons.length
          ].focus();
        }
        if ((key === 'enter' || key === ' ') && event.target === panel.current) {
          event.preventDefault();
          event.stopPropagation();
          if (!event.repeat) buttons[0]?.click();
        }
      }}
    >
      {conversation &&
        (playerSpeaking ? (
          <Portrait avatar={avatar} name={name} assetBase={assetBase} />
        ) : (
          <AdaPortrait assetBase={assetBase} />
        ))}
      <div className="world-dialogue-copy">
        <h2 id={titleId} className="world-dialogue-name">
          {name}
        </h2>
        <p id={textId} className="world-dialogue-text">
          {typing.visible}
          {/* The untyped rest stays in place, transparent: the box keeps its
              size and screen readers still read the whole line at once. */}
          <span className="world-dialogue-pending">{line.slice(typing.visible.length)}</span>
          {typing.done && continues && <span className="world-dialogue-next" aria-hidden="true" />}
        </p>
        <div className="world-dialogue-actions" hidden={!typing.done}>
          {continues ? (
            <button onClick={advance}>{tr('Continuar', 'Continue')}</button>
          ) : turn.speaker === 'greeting' ? (
            topics.map((entry, index) => (
              <button
                key={entry.question[0]}
                onClick={() => setTurn({ speaker: 'player', topic: index })}
              >
                <span className="dialogue-choice-pointer" aria-hidden="true" />
                {tr(...entry.question)}
              </button>
            ))
          ) : (
            <>
              <button onClick={() => setTurn({ speaker: 'greeting' })}>
                <span className="dialogue-choice-pointer" aria-hidden="true" />
                {tr('Perguntar outra coisa', 'Ask something else')}
              </button>
              <button onClick={onClose}>
                <span className="dialogue-choice-pointer" aria-hidden="true" />
                {tr('Até logo, Ada!', 'See you, Ada!')}
              </button>
            </>
          )}
        </div>
      </div>
      <button
        aria-label={tr('Fechar diálogo', 'Close dialogue')}
        className="world-dialogue-close"
        onClick={onClose}
      >
        <X size={18} />
      </button>
    </section>
  );
}
