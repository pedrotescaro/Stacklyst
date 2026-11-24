// @vitest-environment node
import { afterAll, describe, expect, it, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { answerQuestion, finishSession, QUESTION_BY_ID, type EnadeSession } from './simulator';

const connectionString = process.env.ENADE_TEST_DATABASE_URL;

describe.skipIf(!connectionString)('ENADE PostgreSQL history', () => {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 1 }) });
  const users: string[] = [];
  afterAll(async () => {
    if (users.length) await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.$disconnect();
  });

  it('persists normalized drafts, protects private attempts and updates spaced review once per answer', async () => {
    vi.doMock('@/lib/prisma', () => ({ prisma }));
    const {
      createAttempt,
      getOwnedAttempt,
      saveAttempt,
      importLegacyProgress,
      importBrowserProgress,
    } = await import('./attempts.server');
    for (let index = 0; index < 2; index++) {
      const name = `enade-test-${crypto.randomUUID()}`;
      const user = await prisma.user.create({
        data: { email: `${name}@example.test`, username: name },
      });
      users.push(user.id);
    }
    const [student, other] = users;
    const questionId = '2021-objective-1';
    const correct = QUESTION_BY_ID.get(questionId)!.answer!;
    const incorrect = correct === 'A' ? 'B' : 'A';

    const old = Date.now() - 20_000;
    await prisma.mobileState.create({
      data: {
        user_id: student,
        key: 'enade-ads-2021',
        value: {
          answers: { [questionId]: correct },
          marked: [],
          startedAt: old,
          finishedAt: old + 500,
          updatedAt: old + 500,
        },
      },
    });
    await importLegacyProgress(student);
    await importLegacyProgress(student);
    expect(await prisma.enadeAttempt.count({ where: { user_id: student } })).toBe(1);

    const browserDraft = {
      answers: { '2017-objective-1': 'B' },
      marked: [],
      startedAt: old - 1500,
      finishedAt: null,
      updatedAt: old - 500,
    };
    expect(await importBrowserProgress(student, 'enade-ads-2017', browserDraft)).toBe(true);
    expect(await importBrowserProgress(student, 'enade-ads-2017', browserDraft)).toBe(false);
    const fromBrowser = await prisma.enadeAttempt.findFirstOrThrow({
      where: { user_id: student, source_year: 2017 },
    });
    expect(fromBrowser.answered_count).toBe(1);
    expect(
      await importBrowserProgress(student, 'enade-ads-2017', {
        ...browserDraft,
        finishedAt: old,
        updatedAt: old,
      })
    ).toBe(true);
    expect(await prisma.enadeAttempt.findUnique({ where: { id: fromBrowser.id } })).toMatchObject({
      status: 'FINISHED',
    });
    expect(await prisma.enadeAttempt.count({ where: { user_id: student } })).toBe(2);

    const input = {
      kind: 'PRACTICE' as const,
      questionIds: [questionId],
      mode: 'training' as const,
    };
    const earliest = await createAttempt(student, input, { resume: true, now: old + 1000 });
    const resumed = await createAttempt(student, input, { resume: true });
    expect(resumed).toMatchObject({ row: { id: earliest.row.id }, created: false });
    await expect(getOwnedAttempt(other, earliest.row.id)).rejects.toMatchObject({
      statusCode: 404,
    });

    const original = earliest.row.state as unknown as EnadeSession;
    const wrong = answerQuestion(original, questionId, incorrect, old + 2000);
    await expect(saveAttempt(other, earliest.row.id, wrong)).rejects.toMatchObject({
      statusCode: 404,
    });
    const saved = await saveAttempt(student, earliest.row.id, wrong);
    expect(saved).toMatchObject({ stale: false, row: { version: 2, answered_count: 1 } });
    await saveAttempt(student, earliest.row.id, wrong);
    await expect(
      saveAttempt(student, earliest.row.id, {
        ...wrong,
        updatedAt: wrong.updatedAt + 1,
        answers: { [questionId]: correct },
      })
    ).rejects.toMatchObject({ statusCode: 409 });
    const finished = await saveAttempt(student, earliest.row.id, finishSession(wrong, old + 2500));
    expect(finished.row).toMatchObject({ status: 'FINISHED', wrong_count: 1, correct_count: 0 });
    expect(await prisma.enadeAnswer.count({ where: { attempt_id: earliest.row.id } })).toBe(1);
    expect(
      await prisma.enadeReviewItem.findFirst({
        where: { user_id: student, question_id: questionId },
      })
    ).toMatchObject({ wrong_count: 1, last_selected: incorrect, status: 'OPEN' });
    expect(await prisma.enadeReviewItem.count({ where: { user_id: other } })).toBe(0);

    const review = await createAttempt(student, { ...input, kind: 'REVIEW' }, { now: old + 3000 });
    const answer = answerQuestion(
      review.row.state as unknown as EnadeSession,
      questionId,
      correct,
      old + 4000
    );
    await saveAttempt(student, review.row.id, finishSession(answer, old + 5000));
    expect(
      await prisma.enadeReviewItem.findFirst({
        where: { user_id: student, question_id: questionId },
      })
    ).toMatchObject({ wrong_count: 1, correct_count: 1, last_selected: correct });
  }, 15_000);
});
