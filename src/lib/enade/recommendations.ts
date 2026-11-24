import type { TopicStat } from './stats';

/**
 * Study recommendations derived only from evidence: the learner's own misses,
 * open notebook items, and how often a subject appeared in official editions.
 */
export type Recommendation = {
  topic: string;
  title: string;
  reason: string;
  kind: 'struggling' | 'notebook' | 'frequent';
  studied: boolean;
  openErrors: number;
  dueErrors: number;
  officialQuestions: number;
  accuracy: number | null;
};

export function recommendStudy(input: {
  byTopic: TopicStat[];
  reviewItems: { topic: string | null; status: 'OPEN' | 'RECOVERED'; due_at: Date }[];
  studied: Set<string>;
  titles: Map<string, string>;
  frequency: Map<string, number>;
  now?: Date;
  limit?: number;
}): Recommendation[] {
  const now = input.now ?? new Date();
  const open = new Map<string, number>();
  const due = new Map<string, number>();
  for (const item of input.reviewItems) {
    if (!item.topic) continue;
    if (item.status === 'OPEN') open.set(item.topic, (open.get(item.topic) ?? 0) + 1);
    if (item.due_at <= now) due.set(item.topic, (due.get(item.topic) ?? 0) + 1);
  }
  const base = (topic: string) => ({
    topic,
    title: input.titles.get(topic) ?? topic,
    studied: input.studied.has(topic),
    openErrors: open.get(topic) ?? 0,
    dueErrors: due.get(topic) ?? 0,
    officialQuestions: input.frequency.get(topic) ?? 0,
  });
  const result: (Recommendation & { priority: number })[] = [];
  const seen = new Set<string>();

  for (const stat of input.byTopic) {
    if (!input.titles.has(stat.slug) || stat.responses < 2 || (stat.accuracy ?? 1) >= 0.6) continue;
    seen.add(stat.slug);
    result.push({
      ...base(stat.slug),
      kind: 'struggling',
      accuracy: stat.accuracy,
      reason: `Você acertou ${stat.correct} de ${stat.responses} respostas deste assunto.`,
      priority:
        100 + stat.wrong * 3 + (input.frequency.get(stat.slug) ?? 0) - (stat.accuracy ?? 0) * 20,
    });
  }
  for (const [topic, count] of open) {
    if (seen.has(topic) || !input.titles.has(topic)) continue;
    seen.add(topic);
    const stat = input.byTopic.find((s) => s.slug === topic);
    result.push({
      ...base(topic),
      kind: 'notebook',
      accuracy: stat?.accuracy ?? null,
      reason: `${count} ${count === 1 ? 'questão errada ainda não recuperada' : 'questões erradas ainda não recuperadas'} no caderno de erros.`,
      priority: 60 + count * 4 + (due.get(topic) ?? 0) * 2,
    });
  }
  const answered = new Set(input.byTopic.map((s) => s.slug));
  for (const [topic, count] of [...input.frequency.entries()].sort((a, b) => b[1] - a[1])) {
    if (
      seen.has(topic) ||
      answered.has(topic) ||
      input.studied.has(topic) ||
      !input.titles.has(topic)
    )
      continue;
    seen.add(topic);
    result.push({
      ...base(topic),
      kind: 'frequent',
      accuracy: null,
      reason: `Apareceu em ${count} ${count === 1 ? 'questão' : 'questões'} das provas oficiais e você ainda não estudou.`,
      priority: count,
    });
  }
  return result
    .sort((a, b) => b.priority - a.priority)
    .slice(0, input.limit ?? 6)
    .map(({ priority: _priority, ...rest }) => {
      void _priority;
      return rest;
    });
}
