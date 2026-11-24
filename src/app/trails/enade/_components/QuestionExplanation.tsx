'use client';
import Link from 'next/link';
import { BookOpen, Lightbulb, Shuffle, TriangleAlert } from 'lucide-react';
import type { QuestionPresentation } from '@/lib/enade/feedback';
import type { QuestionInsight, QuestionStudyAids } from '@/lib/enade/insights';
import styles from './QuestionExplanation.module.css';

export type { QuestionStudyAids };

/**
 * The commented correction shown after answering (study mode) or after
 * finishing (exam mode): the answer, the reasoning and where to study next.
 */
export function QuestionExplanation({
  question: q,
  aids,
}: {
  question: QuestionPresentation;
  aids?: QuestionStudyAids;
}) {
  const insight = aids?.insight ?? null;
  const display = (canonical: string) =>
    q.options.find((o) => o.canonical === canonical)?.letter ?? canonical;
  const optionNotes = insight
    ? q.options
        .map((option) => ({
          option,
          note: insight.options[option.canonical as keyof QuestionInsight['options']],
        }))
        .filter((entry) => entry.note)
    : [];
  return (
    <div className={styles.explanation}>
      {aids?.topics.length ? (
        <p className={styles.subject}>
          <span>Assunto</span>
          {aids.topics.map((topic, index) => (
            <span key={topic.slug}>
              {index > 0 && ' · '}
              <Link href={`/trails/enade/biblioteca/${topic.slug}`}>{topic.title}</Link>
            </span>
          ))}
        </p>
      ) : null}
      {insight ? (
        <>
          <section>
            <h4>O que o enunciado pede</h4>
            <p>{insight.interpretation}</p>
          </section>
          <section>
            <h4>Resolução passo a passo</h4>
            <ol className={styles.steps}>
              {insight.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
          {insight.items?.length ? (
            <section>
              <h4>Análise das afirmativas</h4>
              <ul className={styles.verdicts}>
                {insight.items.map((item) => (
                  <li key={item.label} data-correct={item.correct}>
                    <strong>
                      {item.label} · {item.correct ? 'Correta' : 'Incorreta'}
                    </strong>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {optionNotes.length ? (
            <section>
              <h4>Por que cada alternativa está certa ou errada</h4>
              <ul className={styles.verdicts}>
                {optionNotes.map(({ option, note }) => (
                  <li key={option.canonical} data-correct={option.canonical === q.answer}>
                    <strong>
                      {option.letter} · {option.canonical === q.answer ? 'Correta' : 'Incorreta'}
                    </strong>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {insight.concepts.length ? (
            <section>
              <h4>Conceitos envolvidos</h4>
              <ul className={styles.tags}>
                {insight.concepts.map((concept) => (
                  <li key={concept}>{concept}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {insight.traps.length ? (
            <section className={styles.trap}>
              <h4>
                <TriangleAlert size={15} aria-hidden="true" /> Pegadinhas
              </h4>
              <ul>
                {insight.traps.map((trap) => (
                  <li key={trap}>{trap}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {insight.mnemonic ? (
            <section className={styles.mnemonic}>
              <h4>
                <Lightbulb size={15} aria-hidden="true" /> Macete
              </h4>
              <p>{insight.mnemonic}</p>
            </section>
          ) : null}
        </>
      ) : (
        q.explanation && <p>{q.explanation}</p>
      )}
      {aids?.topics.length || aids?.similar.length ? (
        <div className={styles.next}>
          {aids.topics[0] && (
            <Link href={`/trails/enade/biblioteca/${aids.topics[0].slug}`}>
              <BookOpen size={15} aria-hidden="true" /> Estudar {aids.topics[0].title}
            </Link>
          )}
          {aids.similar.length > 0 && (
            <details>
              <summary>
                <Shuffle size={15} aria-hidden="true" /> Questões semelhantes ({aids.similar.length}
                )
              </summary>
              <ul>
                {aids.similar.map((similar) => (
                  <li key={similar.id}>
                    <Link href={`/trails/enade/questoes/${similar.id}`}>{similar.label}</Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ) : null}
      <p className={styles.credit}>
        {insight
          ? `Comentário didático do Stacklyst, atualizado em ${new Date(`${insight.reviewed}T12:00:00Z`).toLocaleDateString('pt-BR')}.`
          : q.explanation
            ? 'Comentário resumido do Stacklyst.'
            : null}{' '}
        {q.kind === 'objective' && q.answer
          ? `Gabarito oficial do Inep: ${q.answer}.${display(q.answer) === q.answer ? '' : ` Nesta ordem, corresponde à alternativa ${display(q.answer)}.`}`
          : q.kind === 'discursive'
            ? 'A referência para autoavaliação é o padrão de resposta do Inep.'
            : 'O resultado oficial consta no gabarito do Inep.'}
      </p>
    </div>
  );
}
