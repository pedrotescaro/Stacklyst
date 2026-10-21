export type AnswerThread<T> = T & { replies: AnswerThread<T>[] };

/** Assemble every reply while leaving visual indentation to the client. */
export function buildAnswerThreads<T extends { id: string; parent_id: string | null }>(
  answers: T[] = []
): AnswerThread<T>[] {
  type Thread = AnswerThread<T>;
  const byId = new Map<string, Thread>(
    answers.map((answer) => [answer.id, { ...answer, replies: [] }])
  );
  const roots: Thread[] = [];
  for (const answer of byId.values()) {
    const parent = answer.parent_id ? byId.get(answer.parent_id) : undefined;
    if (parent && parent !== answer) parent.replies.push(answer);
    else roots.push(answer);
  }
  return roots;
}
