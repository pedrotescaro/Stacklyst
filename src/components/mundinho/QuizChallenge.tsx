import type { PublicQuestion } from '../../lib/mundinho/types';
import { translateMundinho } from '../../lib/mundinho/i18n';
import { useLocalizedText } from '../../i18n/useLocalizedText';

/**
 * Multiple-choice challenge shared by creature battles and the multiplayer
 * duel: a concept quiz, or a snippet with one bug to spot.
 */
export function QuizChallenge({
  question,
  busy,
  onAnswer,
}: {
  question: PublicQuestion;
  busy: boolean;
  onAnswer: (answer: number) => void;
}) {
  const { text, language } = useLocalizedText();
  const m = (value: string) => translateMundinho(value, language);
  const bug = question.kind === 'bug';
  return (
    <div className="ad-battle-question-box" data-kind={question.kind ?? 'concept'}>
      <div className="ad-quiz-head">
        <span className="ad-quiz-kind">
          {bug ? text('Encontre o erro', 'Find the bug') : text('Quiz de conceito', 'Concept quiz')}
        </span>
        <span className="ad-concept-tag">
          {m(question.concept)} · {m(question.difficulty)}
        </span>
      </div>
      <h3 className="ad-question-text">{question.prompt}</h3>
      {question.snippet && (
        <pre className="ad-bug-snippet" aria-label={text('Código com um erro', 'Code with a bug')}>
          <code>
            {question.snippet.split('\n').map((line, index) => (
              <span className="ad-bug-line" key={index}>
                <span className="ad-bug-line-number" aria-hidden="true">
                  {index + 1}
                </span>
                {line || ' '}
              </span>
            ))}
          </code>
        </pre>
      )}
      <div className="ad-answers-grid">
        {question.options.map((option, index) => (
          <button
            key={index}
            disabled={busy}
            className="ad-answer-btn"
            onClick={() => onAnswer(index)}
          >
            <span className="ad-answer-letter">{String.fromCharCode(65 + index)}</span>
            <span className="ad-answer-body">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
