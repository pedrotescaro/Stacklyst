import explanations from './explanations.json';
import { displayLetter, type EnadeSession, type SessionQuestion } from './simulator';
import type { EnadeQuestionContent } from './types';

export function explanationFor(question: SessionQuestion) {
  if (question.annulled)
    return 'Questão anulada pelo Inep. Ela é preservada no caderno padrão, mas fica fora da nota e dos simulados personalizados.';
  if (question.kind === 'discursive')
    return 'Compare os argumentos, o desenvolvimento e os itens solicitados com o padrão de resposta do Inep. A resposta discursiva requer autoavaliação e não recebe uma nota automática.';
  return (explanations as Record<string, string>)[question.id] || '';
}
export function questionPresentation(
  session: EnadeSession,
  question: SessionQuestion,
  content?: EnadeQuestionContent
) {
  const selected = session.answers[question.id];
  const reveal =
    !!session.finishedAt ||
    (session.config.mode === 'training' && session.checked.includes(question.id));
  const ordered = session.optionOrder[question.id] || [];
  const options = ordered.map((canonical, index) => {
    const option = content?.options.find((o) => o.letter === canonical);
    return {
      canonical,
      letter: String.fromCharCode(65 + index),
      text: option?.text || '',
      code: option?.code || false,
      image: option?.image,
      selected: selected === canonical,
      disabled:
        !!session.finishedAt ||
        session.paused ||
        question.annulled ||
        (reveal && session.config.mode === 'training'),
      correction:
        reveal && !question.annulled
          ? canonical === question.answer
            ? 'correct'
            : selected === canonical
              ? 'incorrect'
              : undefined
          : undefined,
    };
  });
  const feedback = question.annulled
    ? 'annulled'
    : question.kind === 'discursive'
      ? 'discursive'
      : !selected
        ? 'blank'
        : selected === question.answer
          ? 'correct'
          : 'incorrect';
  return {
    ...question,
    content,
    options,
    reveal,
    selected,
    marked: session.marked.includes(question.id),
    answered: !!selected?.trim(),
    explanation: explanationFor(question),
    feedback,
    answerLetter: displayLetter(session, question.id, question.answer),
    userLetter: displayLetter(session, question.id, selected),
    showDiscursiveCheck:
      question.kind === 'discursive' &&
      session.config.mode === 'training' &&
      !reveal &&
      !question.annulled,
    readOnly: !!session.finishedAt || session.paused || question.annulled,
    correctOption: content?.options.find((o) => o.letter === question.answer),
  };
}
export type QuestionPresentation = ReturnType<typeof questionPresentation>;
