import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { ADA_AVATAR, type Avatar } from '../../lib/mundinho/types';
import { Portrait } from './Portrait';

const topics = [
  {
    question: 'Como enfrento os bugs?',
    answer:
      'Aproxime-se de uma criatura do seu nível e interaja. Aplicar conceito causa dano, Depurar ajuda a recuperar vida e Refatorar aposta em um ataque mais forte. Leia a pergunta com calma: entender o código faz parte da aventura!',
  },
  {
    question: 'Quero mudar meu visual.',
    answer:
      'Abra o editor de personagem na tela inicial. Você pode escolher a silhueta do retrato, pele, olhos, cabelo, roupas e acessórios. Salve as alterações e vou reconhecer seu novo visual na próxima conversa. Os itens com moedas ficam na loja.',
  },
  {
    question: 'O que há nesta clareira?',
    answer:
      'A placa tem uma dica de programação e o baú guarda uma recompensa. As criaturas aparecem nas moitas. Se alguma exigir um nível maior, continue suas lições nas Trilhas. E pode voltar aqui sempre que quiser conversar!',
  },
] as const;

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
  const [turn, setTurn] = useState<'greeting' | 'player' | 'ada'>('greeting');
  const [topic, setTopic] = useState(0);
  const panel = useRef<HTMLElement>(null);
  const titleId = useId();
  const textId = useId();
  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
  }, [turn]);
  const playerSpeaking = conversation && turn === 'player';
  const name = conversation ? (playerSpeaking ? username : 'Ada') : 'Clareira';
  const line = !conversation
    ? text
    : turn === 'greeting'
      ? `Oi, ${username}! Sou a Ada. Cada erro é uma pista para a próxima tentativa. Sobre o que vamos conversar?`
      : turn === 'player'
        ? topics[topic].question
        : topics[topic].answer;
  return (
    <section
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={textId}
      className={`world-dialogue-panel ${conversation ? 'has-portrait' : ''}`}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          return;
        }
        const buttons = Array.from(
          panel.current?.querySelectorAll<HTMLButtonElement>('.world-dialogue-actions button') ?? []
        );
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const key = event.key.toLowerCase();
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
      {conversation && (
        <Portrait avatar={playerSpeaking ? avatar : ADA_AVATAR} name={name} assetBase={assetBase} />
      )}
      <div className="world-dialogue-copy">
        <h2 id={titleId}>{name}</h2>
        <p id={textId} aria-live="polite">
          {line}
        </p>
        <div className="world-dialogue-actions">
          {!conversation ? (
            <button onClick={onClose}>Continuar</button>
          ) : turn === 'greeting' ? (
            topics.map((entry, index) => (
              <button
                key={entry.question}
                onClick={() => {
                  setTopic(index);
                  setTurn('player');
                }}
              >
                <span className="dialogue-choice-pointer" aria-hidden="true" />
                {entry.question}
              </button>
            ))
          ) : turn === 'player' ? (
            <button onClick={() => setTurn('ada')}>Continuar</button>
          ) : (
            <>
              <button onClick={() => setTurn('greeting')}>Perguntar outra coisa</button>
              <button onClick={onClose}>Até logo, Ada!</button>
            </>
          )}
        </div>
      </div>
      <button aria-label="Fechar diálogo" className="world-dialogue-close" onClick={onClose}>
        <X size={18} />
      </button>
    </section>
  );
}
