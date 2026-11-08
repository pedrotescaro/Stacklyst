// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { AdminService } from '../admin.service';
import { JobService } from '../job.service';
import { assignRecruitmentActivity, recruitmentActivity } from '../job-activity.service';
import { hasRecruitmentExerciseAccess } from '@/lib/recruitment-exercise-access';
// Explicitly opt in to a disposable database. Never inherit DATABASE_URL or .env.local.
vi.mock('@/lib/prisma', async () => {
  const connectionString = process.env.STACKLYST_TEST_DATABASE_URL;
  if (!connectionString) return { prisma: null };
  const destination = new URL(connectionString);
  if (
    destination.hostname !== '127.0.0.1' ||
    destination.port !== '55437' ||
    destination.pathname !== '/stacklyst_quality_services'
  ) {
    throw new Error('Integration tests require the dedicated local quality database.');
  }
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  return {
    prisma: new PrismaClient({ adapter: new PrismaPg({ connectionString, ssl: false, max: 8 }) }),
  };
});

const enabled = Boolean(process.env.STACKLYST_TEST_DATABASE_URL);
const prefix = `activity-${Date.now()}`;
const owner = `${prefix}-owner`,
  candidate = `${prefix}-candidate`,
  outsider = `${prefix}-outsider`;
let companyId: string, jobId: string, stageId: string, exerciseId: string, nodeId: string;
describe.skipIf(!enabled)('recruitment activities with PostgreSQL', () => {
  beforeAll(async () => {
    for (const [id, role] of [
      [owner, 'RECRUITER'],
      [candidate, 'USER'],
      [outsider, 'RECRUITER'],
    ] as const)
      await prisma.user.create({
        data: { id, username: id, email: `${id}@example.invalid`, role },
      });
    const company = await prisma.company.create({
      data: { owner_id: owner, name: 'Activity QA', slug: prefix },
    });
    companyId = company.id;
    const node = await prisma.knowledgeNode.create({
      data: {
        slug: prefix,
        title: 'QA',
        description: 'QA',
        type: 'CONCEPT',
        category: 'QA',
        language: 'JS',
        difficulty: 1,
        xp_reward: 5,
        position_x: 0,
        position_y: 0,
        is_published: true,
      },
    });
    nodeId = node.id;
    const exercise = await prisma.exercise.create({
      data: {
        slug: prefix,
        knowledge_node_id: node.id,
        title: 'Activity QA',
        summary: 'QA',
        problem: 'QA',
        objective: 'QA',
        language: 'JS',
        difficulty: 1,
        base_xp: 5,
        starter_code: '',
        function_name: 'answer',
        constraints: [],
        hints: [],
        is_published: true,
        test_cases: { create: { label: 'QA', expected_output: 42, position: 1 } },
      },
    });
    exerciseId = exercise.id;
    const job = await prisma.job.create({
      data: {
        company_id: company.id,
        title: 'Activity QA',
        description: 'QA',
        technologies: [],
        requirements: [],
        benefits: [],
        stages: { create: { title: 'Challenge', type: 'DESAFIO_TECNICO', order: 1 } },
      },
      include: { stages: true },
    });
    jobId = job.id;
    stageId = job.stages[0].id;
    await prisma.jobApplication.create({
      data: { job_id: jobId, user_id: candidate, stage_id: stageId, status: 'TECHNICAL_CHALLENGE' },
    });
  });
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [owner, candidate, outsider] } } });
    if (nodeId) await prisma.knowledgeNode.deleteMany({ where: { id: nodeId } });
    await prisma.$disconnect();
  });
  it('blocks cross-company assignment and non-candidate access; exposes honest unconfigured state', async () => {
    await expect(
      assignRecruitmentActivity(jobId, stageId, exerciseId, { id: outsider, role: 'RECRUITER' })
    ).rejects.toMatchObject({ statusCode: 403 });
    await expect(recruitmentActivity(outsider, jobId, 'start')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(await recruitmentActivity(candidate, jobId)).toMatchObject({
      configured: false,
      href: null,
    });
    expect(await hasRecruitmentExerciseAccess(candidate, exerciseId)).toBe(false);
    await expect(
      assignRecruitmentActivity(jobId, stageId, 'missing-exercise', {
        id: owner,
        role: 'RECRUITER',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
  it('starts once concurrently, ignores earlier results and freezes assignment after start', async () => {
    await assignRecruitmentActivity(jobId, stageId, exerciseId, { id: owner, role: 'RECRUITER' });
    await prisma.exerciseSubmission.create({
      data: {
        user_id: candidate,
        exercise_id: exerciseId,
        assistance_mode: 'STANDARD',
        status: 'PASSED',
        code: 'old',
        passed_public: 1,
        total_public: 1,
        passed_hidden: 0,
        total_hidden: 0,
        created_at: new Date(Date.now() - 60000),
      },
    });
    const [first, second] = await Promise.all([
      recruitmentActivity(candidate, jobId, 'start'),
      recruitmentActivity(candidate, jobId, 'start'),
    ]);
    expect(first.href).toBe(second.href);
    expect(first.completed).toBe(false);
    expect(first.href).toContain(`recruitmentJob=${jobId}`);
    expect(
      await prisma.mobileState.count({
        where: { user_id: candidate, key: { startsWith: 'recruitment:' } },
      })
    ).toBe(1);
    expect(await hasRecruitmentExerciseAccess(candidate, exerciseId)).toBe(true);
    await expect(
      assignRecruitmentActivity(jobId, stageId, 'another', { id: owner, role: 'RECRUITER' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
  it('accepts only persisted approved results and audits completion exactly once', async () => {
    await prisma.exerciseSubmission.create({
      data: {
        user_id: candidate,
        exercise_id: exerciseId,
        assistance_mode: 'STANDARD',
        status: 'FAILED',
        code: 'failed',
        passed_public: 0,
        total_public: 1,
        passed_hidden: 0,
        total_hidden: 0,
      },
    });
    expect(await recruitmentActivity(candidate, jobId, 'refresh')).toMatchObject({
      completed: false,
      score: null,
    });
    await prisma.exerciseSubmission.create({
      data: {
        user_id: candidate,
        exercise_id: exerciseId,
        assistance_mode: 'STANDARD',
        status: 'PASSED',
        code: 'answer',
        passed_public: 1,
        total_public: 1,
        passed_hidden: 0,
        total_hidden: 0,
      },
    });
    const results = await Promise.all([
      recruitmentActivity(candidate, jobId, 'refresh'),
      recruitmentActivity(candidate, jobId, 'refresh'),
    ]);
    expect(results.every((r) => r.completed && r.score === 100)).toBe(true);
    const application = await prisma.jobApplication.findUniqueOrThrow({
      where: { job_id_user_id: { job_id: jobId, user_id: candidate } },
    });
    expect(application).toMatchObject({
      technical_score: 100,
      stage_id: stageId,
      status: 'TECHNICAL_CHALLENGE',
    });
    expect(
      await prisma.securityAuditEvent.count({
        where: { resource_id: application.id, action: 'JOB_ACTIVITY_COMPLETED' },
      })
    ).toBe(1);
  });
  it('creates an assigned duel once and derives the final candidate score from the judge', async () => {
    const stage = await prisma.jobRecruitmentStage.create({
      data: { job_id: jobId, title: 'Duel', type: 'DUELO_TECNICO', order: 2 },
    });
    await assignRecruitmentActivity(jobId, stage.id, 'JS:reverse-string', {
      id: owner,
      role: 'RECRUITER',
    });
    await prisma.jobApplication.update({
      where: { job_id_user_id: { job_id: jobId, user_id: candidate } },
      data: { stage_id: stage.id, status: 'DUEL', technical_score: null },
    });
    const [a, b] = await Promise.all([
      recruitmentActivity(candidate, jobId, 'start'),
      recruitmentActivity(candidate, jobId, 'start'),
    ]);
    expect(a.href).toBe(b.href);
    expect(a.href).toMatch(/^\/duels\//);
    const duelId = a.href!.split('/').at(-1)!;
    expect(await prisma.duel.findUniqueOrThrow({ where: { id: duelId } })).toMatchObject({
      problem_id: 'reverse-string',
      language: 'JS',
      challenger_id: candidate,
    });
    await prisma.duelSolution.create({
      data: { duel_id: duelId, user_id: candidate, code: 'private', score: 870 },
    });
    expect(await recruitmentActivity(candidate, jobId, 'refresh')).toMatchObject({
      completed: false,
    });
    await prisma.duel.update({
      where: { id: duelId },
      data: { status: 'CLOSED', closed_reason: 'test_score', finished_at: new Date() },
    });
    const result = await recruitmentActivity(candidate, jobId, 'refresh');
    expect(result).toMatchObject({ completed: true, score: 87 });
    expect(JSON.stringify(result)).not.toContain('private');
    expect(await hasRecruitmentExerciseAccess(candidate, exerciseId)).toBe(false);
  });
  it('excludes expired jobs and rejects applications without writing', async () => {
    const expired = await prisma.job.create({
      data: {
        company_id: companyId,
        title: 'Expired QA',
        description: 'QA',
        technologies: [],
        requirements: [],
        benefits: [],
        expires_at: new Date(Date.now() - 1000),
      },
    });
    await expect(JobService.applyForJob(outsider, expired.id)).rejects.toMatchObject({
      code: 'JOB_CLOSED',
      statusCode: 409,
    });
    expect(await prisma.jobApplication.count({ where: { job_id: expired.id } })).toBe(0);
    expect((await JobService.listJobs({ companyId })).some((j) => j.id === expired.id)).toBe(false);
    expect(
      (await JobService.listJobs({ companyId, includeExpired: true, status: 'ALL' })).some(
        (j) => j.id === expired.id
      )
    ).toBe(true);
  });
  it('dismisses a report once concurrently, keeps its post and retains the moderation audit', async () => {
    const post = await prisma.post.create({
      data: { author_id: candidate, title: 'QA', body: 'Keep this content' },
    });
    const report = await prisma.report.create({
      data: { user_id: outsider, post_id: post.id, reason: 'QA report' },
    });
    const outcomes = await Promise.allSettled([
      AdminService.dismissReport(report.id, 'Reviewed: content is allowed.', owner),
      AdminService.dismissReport(report.id, 'Reviewed again.', owner),
    ]);
    expect(outcomes.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await prisma.post.findUnique({ where: { id: post.id } })).toMatchObject({
      body: 'Keep this content',
    });
    expect(await prisma.report.count({ where: { id: report.id } })).toBe(0);
    expect(
      await prisma.securityAuditEvent.count({
        where: { resource_id: post.id, action: 'REPORT_DISMISSED' },
      })
    ).toBe(1);
  });
});
