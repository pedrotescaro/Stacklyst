import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { ADA_AVATAR, type Avatar } from '../../lib/mundinho/types';
import { Portrait } from './Portrait';
import { useLocalizedText } from '../../i18n/useLocalizedText';

const topics = [
  {
    question: 'Como enfrento os bugs?',
    questionEn: 'How do I fight the bugs?',
    answerEn:
      'Approach a creature at your level and interact. Apply concept deals damage, Debug helps restore HP and Refactor bets on a stronger attack. Read the question calmly: understanding the code is part of the adventure!',
    answer:
      'Aproxime-se de uma criatura do seu nível e interaja. Aplicar conceito causa dano, Depurar ajuda a recuperar vida e Refatorar aposta em um ataque mais forte. Leia a pergunta com calma: entender o código faz parte da aventura!',
  },
  {
    question: 'Quero mudar meu visual.',
    questionEn: 'I want to change my look.',
    answerEn:
      'Open the character editor on the home screen. You can choose the portrait silhouette, skin, eyes, hair, outfits and accessories. Save your changes and I will recognize your new look in our next conversation. Items that cost coins are in the store.',
    answer:
      'Abra o editor de personagem na tela inicial. Você pode escolher a silhueta do retrato, pele, olhos, cabelo, roupas e acessórios. Salve as alterações e vou reconhecer seu novo visual na próxima conversa. Os itens com moedas ficam na loja.',
  },
  {
    question: 'O que há nesta clareira?',
    questionEn: 'What is in this clearing?',
    answerEn:
      'The sign has a programming tip and the chest holds 10 coins a day. The hole with stairs leads to the arena: there you can invite a friend who also follows you. Creatures show up in the bushes. The Void Titan is level 10; keep up your lessons in Trails to face it!',
    answer:
      'A placa tem uma dica de programação e o baú guarda 10 moedas por dia. O buraco com escadaria leva à arena: lá você pode convidar um amigo que também segue você. As criaturas aparecem nas moitas. O Titã do Vazio é nível 10; continue suas lições nas Trilhas para enfrentá-lo!',
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
  const { text: tr } = useLocalizedText();
  const [turn, setTurn] = useState<'greeting' | 'player' | 'ada'>('greeting');
  const [topic, setTopic] = useState(0);
  const panel = useRef<HTMLElement>(null);
  const titleId = useId();
  const textId = useId();
  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
  }, [turn]);
  const playerSpeaking = conversation && turn === 'player';
  const name = conversation ? (playerSpeaking ? username : 'Ada') : tr('Clareira', 'Clearing');
  const line = !conversation
    ? text
    : turn === 'greeting'
      ? tr(
          `Oi, ${username}! Sou a Ada. Cada erro é uma pista para a próxima tentativa. Sobre o que vamos conversar?`,
          `Hi, ${username}! I'm Ada. Every mistake is a clue for the next try. What shall we talk about?`
        )
      : turn === 'player'
        ? tr(topics[topic].question, topics[topic].questionEn)
        : tr(topics[topic].answer, topics[topic].answerEn);
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
            <button onClick={onClose}>{tr('Continuar', 'Continue')}</button>
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
                {tr(entry.question, entry.questionEn)}
              </button>
            ))
          ) : turn === 'player' ? (
            <button onClick={() => setTurn('ada')}>{tr('Continuar', 'Continue')}</button>
          ) : (
            <>
              <button onClick={() => setTurn('greeting')}>
                {tr('Perguntar outra coisa', 'Ask something else')}
              </button>
              <button onClick={onClose}>{tr('Até logo, Ada!', 'See you, Ada!')}</button>
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
