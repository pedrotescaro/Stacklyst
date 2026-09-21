/** Attempts must already be filtered to the current viewer by the database query. */
export function publicQuiz<T extends { correct_index: number; attempts?: unknown[] }>(quiz: T) {
  const { correct_index, ...publicFields } = quiz;
  return {
    ...publicFields,
    ...(quiz.attempts?.length ? { correct_index } : {}),
  };
}
