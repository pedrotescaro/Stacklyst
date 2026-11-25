'use client';
import { useState } from 'react';
import { PencilLine, Workflow } from 'lucide-react';
import {
  ANSWER_MAX_LENGTH,
  asksForDiagram,
  diagramTypeFor,
  parseDiscursive,
  serializeDiscursive,
  type DiscursiveAnswer,
} from '@/lib/enade/discursive';
import { NotebookAnswer } from './NotebookAnswer';
import { DiagramBoard } from './DiagramBoard';
import styles from './DiscursiveAnswerField.module.css';

type Tab = 'text' | 'diagram';

/**
 * Discursive answer: a ruled 15-line sheet, plus a drawing board for questions
 * that ask for a diagram. Both parts are saved together in the one answer.
 */
export function DiscursiveAnswerField({
  questionId,
  statement,
  value,
  readOnly,
  onAnswer,
}: {
  questionId: string;
  statement: string;
  value: string;
  readOnly?: boolean;
  onAnswer: (value: string) => void;
}) {
  const answer = parseDiscursive(value);
  const [tab, setTab] = useState<Tab>(() =>
    answer.diagram || asksForDiagram(statement) ? 'diagram' : 'text'
  );
  const [tooLong, setTooLong] = useState(false);
  const save = (next: DiscursiveAnswer) => {
    const raw = serializeDiscursive(next);
    if (raw.length > ANSWER_MAX_LENGTH) {
      setTooLong(true);
      return;
    }
    setTooLong(false);
    onAnswer(raw);
  };
  return (
    <div className={styles.field}>
      <div className={styles.head}>
        <span className={styles.label} id={`${questionId}-answer-label`}>
          Sua resposta
        </span>
        <div className={styles.tabs} role="tablist" aria-label="Formato da resposta">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'text'}
            onClick={() => setTab('text')}
          >
            <PencilLine size={14} aria-hidden="true" /> Texto
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'diagram'}
            onClick={() => setTab('diagram')}
          >
            <Workflow size={14} aria-hidden="true" /> Diagrama
            {answer.diagram && <span className={styles.dot} aria-label="com conteúdo" />}
          </button>
        </div>
      </div>
      {tab === 'text' ? (
        <NotebookAnswer
          id="discursive-answer"
          value={answer.text}
          readOnly={readOnly}
          onChange={(text) => save({ ...answer, text })}
        />
      ) : (
        <DiagramBoard
          key={questionId}
          value={answer.diagram ?? { type: diagramTypeFor(statement), nodes: [], edges: [] }}
          readOnly={readOnly}
          onChange={(diagram) => save({ ...answer, diagram })}
        />
      )}
      {tooLong && (
        <p className={styles.error} role="alert">
          A resposta ficou grande demais para salvar. Encurte o texto ou o diagrama.
        </p>
      )}
    </div>
  );
}
