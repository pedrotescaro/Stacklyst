import 'server-only';
import { insightFor, type QuestionStudyAids } from './insights';
import { QUESTION_BY_ID } from './simulator';
import { questionLabel, similarQuestions, topicsFor } from './topics';
import { loadLibrary } from './library/load';

/** Commentary, library links and similar official questions for each question. */
export function studyAids(questionIds: string[]): Record<string, QuestionStudyAids> {
  const library = loadLibrary();
  return Object.fromEntries(
    questionIds
      .filter((id) => QUESTION_BY_ID.has(id))
      .map((id) => [
        id,
        {
          insight: insightFor(id),
          topics: topicsFor(id)
            .map((slug) => library.bySlug.get(slug))
            .filter((a) => !!a)
            .map((a) => ({ slug: a!.slug, title: a!.title })),
          similar: similarQuestions(id).map((q) => ({ id: q.id, label: questionLabel(q) })),
        },
      ])
  );
}
