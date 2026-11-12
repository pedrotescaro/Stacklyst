'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Flag, X } from 'lucide-react';
import type { QuestionPresentation } from '@/lib/enade/feedback';
import styles from './EnadeCourse.module.css';

const SECTION_LABEL = { general: 'Formação geral', specific: 'Componente específico' } as const;
const MAX_RUN_GROUPS = 6;
const CHUNK = 10;

type Group = { label: string; start: number; end: number };

/** Ordered sessions read best split by edition + section; shuffled ones fall back to blocks of 10. */
export function groupQuestions(questions: QuestionPresentation[]): Group[] {
  const multiYear = new Set(questions.map((q) => q.year)).size > 1;
  const runs: Group[] = [];
  questions.forEach((q, index) => {
    const label = `${multiYear ? `${q.year} · ` : ''}${SECTION_LABEL[q.section]}`;
    const last = runs[runs.length - 1];
    if (last && last.label === label && last.end === index - 1) last.end = index;
    else runs.push({ label, start: index, end: index });
  });
  if (runs.length <= MAX_RUN_GROUPS) return runs;
  const chunks: Group[] = [];
  for (let start = 0; start < questions.length; start += CHUNK) {
    const end = Math.min(start + CHUNK, questions.length) - 1;
    chunks.push({ label: 'Questões', start, end });
  }
  return chunks;
}

function describe(q: QuestionPresentation) {
  return `${q.year} · ${q.kind === 'discursive' ? 'Discursiva' : 'Objetiva'} ${q.number}`;
}

function tileState(q: QuestionPresentation) {
  if (q.reveal && (q.feedback === 'correct' || q.feedback === 'incorrect')) return q.feedback;
  return q.answered ? 'answered' : 'blank';
}

export function QuestionPicker(props: {
  questions: QuestionPresentation[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}) {
  const { questions, currentIndex } = props;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const current = questions[currentIndex];
  const answered = questions.filter((q) => q.answered).length;
  const marked = questions.filter((q) => q.marked).length;
  const groups = groupQuestions(questions);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLButtonElement>('[aria-current="step"]')?.focus({
      preventScroll: true,
    });
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  function pick(index: number) {
    setOpen(false);
    props.onNavigate(index);
  }

  return (
    <div className={styles.picker} data-open={open}>
      <button
        ref={trigger}
        type="button"
        className={styles.pickerTrigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Questão ${currentIndex + 1} de ${questions.length} · ${describe(current)}. ${open ? 'Fechar' : 'Abrir'} mapa de questões`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.pickerBadge} data-state={tileState(current)} aria-hidden="true">
          {currentIndex + 1}
        </span>
        <span className={styles.pickerText}>
          <strong>
            Questão {currentIndex + 1}
            <span> de {questions.length}</span>
          </strong>
          <small>{describe(current)}</small>
        </span>
        <span className={styles.pickerStats} aria-hidden="true">
          <span>
            <Check size={12} /> {answered}
          </span>
          <span>
            <Flag size={12} /> {marked}
          </span>
        </span>
        <ChevronDown className={styles.pickerChevron} size={18} aria-hidden="true" />
      </button>
      <div
        id={panelId}
        ref={panel}
        className={styles.pickerPanel}
        inert={!open}
        aria-hidden={!open}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            close();
          }
        }}
      >
        <div className={styles.pickerInner}>
          <div className={styles.pickerHead}>
            <div className={styles.gridLegend}>
              <span>
                <i data-state="blank" /> Em branco
              </span>
              <span>
                <i data-state="answered" /> Respondida
              </span>
              <span>
                <Flag size={12} /> Revisar
              </span>
            </div>
            <button
              type="button"
              className={styles.pickerClose}
              onClick={close}
              aria-label="Fechar mapa de questões"
            >
              <X size={16} />
            </button>
          </div>
          <nav aria-label="Navegação das questões">
            {groups.map((group) => (
              <section key={`${group.label}-${group.start}`} className={styles.pickerGroup}>
                <h3>
                  {group.label}{' '}
                  <span>
                    {group.start === group.end
                      ? group.start + 1
                      : `${group.start + 1}–${group.end + 1}`}
                  </span>
                </h3>
                <div className={styles.numberedGrid}>
                  {questions.slice(group.start, group.end + 1).map((q, offset) => {
                    const index = group.start + offset;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => pick(index)}
                        aria-current={index === currentIndex ? 'step' : undefined}
                        aria-label={`Ir para questão ${index + 1} · ${describe(q)} · ${q.answered ? 'Respondida' : 'Em branco'}${q.marked ? ' · Marcada para revisão' : ''}`}
                        title={describe(q)}
                        data-state={tileState(q)}
                        data-marked={q.marked}
                        style={{ '--i': offset } as React.CSSProperties}
                      >
                        {index + 1}
                        {q.marked && <Flag size={10} aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
