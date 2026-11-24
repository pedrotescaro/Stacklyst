import questionTopics from './question-topics.json';
import { QUESTION_BANK, QUESTION_BY_ID, type SessionQuestion } from './simulator';

/**
 * Every official question is tagged with the library articles it exercises,
 * primary subject first. The tags are curated content, versioned with the bank.
 */
const TOPICS = questionTopics as Record<string, string[]>;

export function topicsFor(questionId: string): string[] {
  return TOPICS[questionId] ?? [];
}

export function primaryTopic(questionId: string): string | null {
  return TOPICS[questionId]?.[0] ?? null;
}

export function questionsForTopic(topic: string, options: { includeDiscursive?: boolean } = {}) {
  return QUESTION_BANK.filter(
    (q) =>
      !q.annulled &&
      (options.includeDiscursive || q.kind === 'objective') &&
      topicsFor(q.id).includes(topic)
  );
}

/** How often each subject appeared in the official editions (objective and discursive). */
export function topicFrequency(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const question of QUESTION_BANK)
    for (const topic of topicsFor(question.id)) counts.set(topic, (counts.get(topic) ?? 0) + 1);
  return counts;
}

/** Other official questions that share the primary subject, nearest editions first. */
export function similarQuestions(questionId: string, limit = 4): SessionQuestion[] {
  const source = QUESTION_BY_ID.get(questionId);
  const topics = topicsFor(questionId);
  if (!source || !topics.length) return [];
  return QUESTION_BANK.filter((q) => q.id !== questionId && !q.annulled && q.kind === 'objective')
    .map((q) => {
      const shared = topicsFor(q.id).filter((t) => topics.includes(t));
      const primary = topicsFor(q.id)[0] === topics[0] ? 2 : 0;
      return { q, score: shared.length + primary, distance: Math.abs(q.year - source.year) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.distance - b.distance || a.q.number - b.q.number)
    .slice(0, limit)
    .map((entry) => entry.q);
}

export function questionLabel(question: Pick<SessionQuestion, 'year' | 'number' | 'kind'>) {
  return `Enade ${question.year} · ${question.kind === 'discursive' ? 'Discursiva' : 'Questão'} ${question.number}`;
}
