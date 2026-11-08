# Código comentado e rastreável

[Índice](README.md). Gerado por [scripts/build-system-handbook.mjs](../../../scripts/build-system-handbook.mjs). Base de código: `6a2bfce`. Comentários explicativos são editoriais; os trechos e modelos vêm dos arquivos indicados.

Cada seção explica uma responsabilidade e mostra **até 48 linhas iniciais** de uma declaração real. Quando há truncamento, o comportamento restante deve ser acompanhado no arquivo completo e no capítulo. Linhas omitidas não são código substituto. Exemplos pedagógicos escritos no manual são identificados separadamente.

## apiHandler

Envolve adaptadores HTTP, associa request ID, resolve contexto e classifica parte dos erros. O wrapper não exige sozinho sessão para todos os recursos.

**Fonte:** [src/lib/api-handler.ts](../../../src/lib/api-handler.ts). Declaração nas linhas 21–117; recorte 21–68.

```ts
export function apiHandler(
  handler: (req: Request, ctx: ApiContext) => Promise<Response>,
  options: { resolveSession?: boolean } = {}
) {
  return async (req: Request, segmentData: { params: Promise<any> }) => {
    const requestId = crypto.randomUUID();
    const store: RateLimitStore = {};

    return rateLimitStorage.run(store, async () => {
      try {
        let session = null;
        if (options.resolveSession !== false) {
          try {
            session = await getAuthUser();
          } catch {
            session = null;
          }
        }

        // Execute the actual route logic
        const response = await handler(req, {
          session,
          params: segmentData.params,
        });

        // Attach Rate Limit headers if set during execution
        if (store.limit !== undefined) {
          response.headers.set('X-RateLimit-Limit', String(store.limit));
        }
        if (store.remaining !== undefined) {
          response.headers.set('X-RateLimit-Remaining', String(store.remaining));
        }
        if (store.reset !== undefined) {
          response.headers.set('X-RateLimit-Reset', String(Math.ceil(store.reset / 1000)));
        }

        response.headers.set('X-Request-Id', requestId);
        return response;
      } catch (e: any) {
        let statusCode = 500;
        let responsePayload: { error: string; message: string; details?: any } = {
          error: 'INTERNAL_ERROR',
          message: 'Internal server error',
        };

        if (e instanceof ZodError) {
          statusCode = 400;
          const firstMessage =
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## requireAuth

Converte a exigência de uma identidade em contrato de servidor; a autorização do recurso ainda pertence ao fluxo específico.

**Fonte:** [src/lib/auth.ts](../../../src/lib/auth.ts). Declaração nas linhas 262–268; recorte 262–268.

```ts
export async function requireAuth(_req?: Request) {
  const user = await getAuthUser();
  if (!user) {
    throw new UnauthorizedError('UNAUTHORIZED', 'Autenticação necessária');
  }
  return user;
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## deriveKnowledgeStatus

Preserva estados já conquistados e distingue pré-requisito obrigatório de recomendação.

**Fonte:** [src/lib/learning/progress.ts](../../../src/lib/learning/progress.ts). Declaração nas linhas 15–35; recorte 15–35.

```ts
export function deriveKnowledgeStatus({
  persistedStatus,
  requiredPrerequisiteStatuses,
  isNextRecommended,
}: StatusInput): KnowledgeProgressStatus {
  if (
    persistedStatus === 'MASTERED' ||
    persistedStatus === 'COMPLETED' ||
    persistedStatus === 'IN_PROGRESS'
  ) {
    return persistedStatus;
  }

  const hasMissingRequirement = requiredPrerequisiteStatuses.some(
    (status) => !isKnowledgeCompleted(status)
  );

  if (hasMissingRequirement) return 'NOT_STARTED';
  if (isNextRecommended) return 'RECOMMENDED';
  return 'AVAILABLE';
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## calculatePathProgress

Conta nós concluídos, calcula percentual e procura a próxima indicação sem inventar conclusão.

**Fonte:** [src/lib/learning/progress.ts](../../../src/lib/learning/progress.ts). Declaração nas linhas 48–68; recorte 48–68.

```ts
export function calculatePathProgress(
  path: PathInput,
  statuses: ReadonlyMap<string, KnowledgeProgressStatus>
): LearningPathSummary {
  const completedNodes = path.nodeIds.filter((nodeId) => {
    const status = statuses.get(nodeId) ?? 'NOT_STARTED';
    return isKnowledgeCompleted(status);
  }).length;
  const totalNodes = path.nodeIds.length;
  const nextRecommendedNodeId =
    path.nodeIds.find((nodeId) => !isKnowledgeCompleted(statuses.get(nodeId) ?? 'NOT_STARTED')) ??
    null;

  return {
    ...path,
    completedNodes,
    totalNodes,
    progressPercent: totalNodes === 0 ? 0 : Math.round((completedNodes / totalNodes) * 100),
    nextRecommendedNodeId,
  };
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## requireLessonAccess

Confere pré-requisitos da lição e conserva revisão de conclusão anterior legítima.

**Fonte:** [src/lib/learning/lesson-progress.ts](../../../src/lib/learning/lesson-progress.ts). Declaração nas linhas 18–45; recorte 18–45.

```ts
export async function requireLessonAccess(userId: string, lesson: Lesson) {
  const learning = getLearningLesson(lesson.id);
  if (!learning) return;
  const needed = learning.prerequisites
    .map((id) => getLearningLesson(id))
    .filter((l) => l !== null);
  if (!needed.length) return;
  const rows = await prisma.quizAttempt.findMany({
    where: {
      user_id: userId,
      is_correct: true,
      quiz_id: {
        in: [...needed.flatMap((l) => l.steps.map((s) => s.id)), ...lesson.steps.map((s) => s.id)],
      },
    },
    select: { quiz_id: true },
  });
  const done = new Set(rows.map((r) => r.quiz_id));
  // Keep legitimate already-completed lessons reviewable after a curriculum update.
  if (isLessonComplete(learning, done)) return;
  const missing = needed.filter((l) => !isLessonComplete(l, done));
  if (missing.length)
    throw new AppError(
      'LESSON_LOCKED',
      `Conclua primeiro: ${missing.map((l) => l.title).join(', ')}.`,
      403
    );
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## assessLessonStep

Despacha a avaliação conforme o tipo da atividade; schema válido não significa resposta correta.

**Fonte:** [src/lib/learning/assessment.ts](../../../src/lib/learning/assessment.ts). Declaração nas linhas 19–112; recorte 19–66.

```ts
export async function assessLessonStep(lesson: Lesson, step: LessonStep, answer: LessonAnswer) {
  const outcome = (isCorrect: boolean, details?: string) => ({
    isCorrect,
    details,
    output: '',
    message: isCorrect ? 'Resposta validada.' : 'Revise a resposta e tente novamente.',
  });
  switch (step.type) {
    case 'concept_explanation':
      return outcome(true);
    case 'multiple_choice':
    case 'output_prediction':
      return outcome(answer.selectedOption === step.correctOptionIndex);
    case 'code_completion':
      return outcome(
        Boolean(step.blanks?.length) &&
          step.blanks!.every((b) =>
            b.expected.some((e) => e.trim() === (answer.blanks?.[b.id] ?? '').trim())
          )
      );
    case 'drag_drop':
      return outcome(
        Boolean(step.expectedBlockTokens?.length) &&
          JSON.stringify(answer.tokens) === JSON.stringify(step.expectedBlockTokens)
      );
    case 'ordering':
      return outcome(
        Boolean(step.orderItems?.length) &&
          JSON.stringify(answer.order) ===
            JSON.stringify(
              [...step.orderItems!].sort((a, b) => a.correctIndex - b.correctIndex).map((x) => x.id)
            )
      );
    case 'matching':
      return outcome(
        Boolean(step.matchingPairs?.length) &&
          step.matchingPairs!.every((p) => answer.pairs?.[p.left] === p.right)
      );
    case 'terminal':
      return outcome(
        Boolean(step.terminalExpected) && answer.command?.trim() === step.terminalExpected?.trim()
      );
    case 'code_editor':
    case 'debug':
    case 'boss_challenge': {
      if (!answer.code?.trim()) return outcome(false, 'Escreva seu código antes de executar.');
      if (step.evaluation) {
        const cases = step.evaluation.cases.filter((c) => answer.action === 'submit' || !c.hidden);
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## publicLesson

Remove gabaritos e elementos internos antes de entregar o catálogo ao aluno.

**Fonte:** [src/lib/learning/assessment.ts](../../../src/lib/learning/assessment.ts). Declaração nas linhas 115–135; recorte 115–135.

```ts
export function publicLesson(lesson: Lesson): Lesson {
  return {
    ...lesson,
    steps: lesson.steps.map((step) => {
      const {
        solutionCode: _solution,
        checkCode: _check,
        evaluation: _evaluation,
        correctOptionIndex: _answer,
        expectedBlockTokens: _tokens,
        terminalExpected: _terminal,
        ...safe
      } = step;
      return {
        ...safe,
        blanks: step.blanks?.map((b) => ({ ...b, expected: [] })),
        orderItems: step.orderItems?.map((item) => ({ ...item, correctIndex: -1 })),
      };
    }),
  };
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## saveLessonAssessment

Identifica primeira conclusão sob transação/lock e reúne progresso, XP e fechamento da lição.

**Fonte:** [src/lib/learning/lesson-progress.ts](../../../src/lib/learning/lesson-progress.ts). Declaração nas linhas 46–124; recorte 46–93.

```ts
export async function saveLessonAssessment(
  userId: string,
  lesson: Lesson,
  step: LessonStep,
  isCorrect: boolean,
  selectedIndex: number
) {
  return learningTransaction(async (tx) => {
    // Same per-user lock across lessons, quizzes and exercise rewards; handles different activities concurrently.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`learning:${userId}`}))`;
    const where = { user_id_quiz_id: { user_id: userId, quiz_id: step.id } };
    const attempts = await tx.quizAttempt.findMany({
      where: { user_id: userId, quiz_id: { in: lesson.steps.map((s) => s.id) } },
      select: { quiz_id: true, is_correct: true },
    });
    const previous = attempts.find((attempt) => attempt.quiz_id === step.id);
    const firstCompletion = isCorrect && !previous?.is_correct;
    const xpEarned = firstCompletion ? Math.max(0, step.xp) : 0;
    if (!previous)
      await tx.quiz.upsert({
        where: { id: step.id },
        create: {
          id: step.id,
          question: step.question ?? step.instruction ?? step.title,
          options: step.options ?? ['Avaliado no servidor'],
          correct_index: step.correctOptionIndex ?? 0,
          is_daily: false,
        },
        update: {},
      });
    if (!previous)
      await tx.quizAttempt.create({
        data: {
          user_id: userId,
          quiz_id: step.id,
          selected_index: selectedIndex,
          is_correct: isCorrect,
          xp_earned: xpEarned,
        },
      });
    else if (firstCompletion)
      await tx.quizAttempt.update({
        where,
        data: { selected_index: selectedIndex, is_correct: true, xp_earned: xpEarned },
      });
    const xpResult =
      xpEarned > 0
        ? await awardXPInTransaction(
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## evaluateExerciseCode

Coordena harness, execução e leitura de resultados dos casos de teste.

**Fonte:** [src/lib/exercises/evaluator.ts](../../../src/lib/exercises/evaluator.ts). Declaração nas linhas 139–207; recorte 139–186.

```ts
export async function evaluateExerciseCode(input: {
  code: string;
  language: string;
  functionName: string;
  testCases: EvaluatorTestCase[];
}): Promise<ExerciseEvaluation> {
  const { code, marker } = buildExerciseHarness(input.code, input.functionName, input.testCases);
  const execution = await executeCode(code, input.language);
  const parsedResults = execution.ok ? parseHarnessOutput(execution.output, marker) : null;

  if (
    !execution.ok ||
    !parsedResults ||
    parsedResults.length !== input.testCases.length ||
    new Set(parsedResults.map((result) => result?.id)).size !== input.testCases.length ||
    parsedResults.some(
      (result) =>
        !result ||
        typeof result.passed !== 'boolean' ||
        !input.testCases.some((test) => test.id === result.id)
    )
  ) {
    let hiddenCounter = 0;
    return {
      ok: false,
      passed: false,
      passedTests: 0,
      totalTests: input.testCases.length,
      tests: input.testCases.map((testCase) => ({
        id: testCase.id,
        label: testCase.is_hidden ? `Caso oculto ${++hiddenCounter}` : testCase.label,
        hidden: testCase.is_hidden,
        passed: false,
      })),
      consoleOutput: stripHarnessOutput(execution.output, marker),
      error: execution.error ?? 'A execução não produziu resultados de teste válidos.',
      executionMs: execution.executionMs,
      unavailable: execution.unavailable === true || execution.ok,
    };
  }

  const resultsById = new Map(parsedResults.map((result) => [result.id, result]));
  let hiddenCounter = 0;
  const tests = input.testCases.map((testCase) => {
    const result = resultsById.get(testCase.id);
    const label = testCase.is_hidden ? `Caso oculto ${++hiddenCounter}` : testCase.label;

    return {
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## recordExerciseSubmission

Registra a submissão e aplica a política de conclusão/recompensa, separada de uma simples execução.

**Fonte:** [src/lib/exercises/repository.ts](../../../src/lib/exercises/repository.ts). Declaração nas linhas 229–389; recorte 229–276.

```ts
export async function recordExerciseSubmission(input: {
  exercise: {
    id: string;
    knowledge_node_id: string;
    base_xp: number;
    language?: import('@prisma/client').Language;
  };
  userId: string;
  assistanceMode: AssistanceMode;
  code: string;
  evaluation: ExerciseEvaluation;
}) {
  // Provider failures are not learner attempts. Keep this guard in the repository
  // so every caller is protected before a transaction can mutate progression.
  requireValidEvaluation(input.evaluation);
  const lockKey = `learning:${input.userId}`;

  return learningTransaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

    const previousCompletion = await transaction.exerciseSubmission.findFirst({
      where: {
        user_id: input.userId,
        exercise_id: input.exercise.id,
        first_completion: true,
      },
      select: { id: true },
    });
    const firstCompletion =
      input.evaluation.ok &&
      input.evaluation.totalTests > 0 &&
      input.evaluation.passed &&
      !previousCompletion;
    const xpEarned = firstCompletion
      ? calculateExerciseXp(input.exercise.base_xp, input.assistanceMode)
      : 0;
    const publicTests = input.evaluation.tests.filter((test) => !test.hidden);
    const hiddenTests = input.evaluation.tests.filter((test) => test.hidden);

    const submission = await transaction.exerciseSubmission.create({
      data: {
        exercise_id: input.exercise.id,
        user_id: input.userId,
        assistance_mode: input.assistanceMode,
        status: getSubmissionStatus(input.evaluation),
        code: input.code,
        passed_public: publicTests.filter((test) => test.passed).length,
        total_public: publicTests.length,
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## recordAssistanceEvent

Registra o uso de ajuda no contrato do exercício.

**Fonte:** [src/lib/exercises/repository.ts](../../../src/lib/exercises/repository.ts). Declaração nas linhas 391–405; recorte 391–405.

```ts
export async function recordAssistanceEvent(input: {
  exerciseId: string;
  userId: string;
  assistanceMode: AssistanceMode;
  eventType: 'HINT_OPENED' | 'DOCUMENTATION_OPENED';
}) {
  await prisma.learningEvent.create({
    data: {
      user_id: input.userId,
      exercise_id: input.exerciseId,
      event_type: input.eventType,
      assistance_mode: input.assistanceMode,
    },
  });
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## calculateExerciseXp

Explicita os multiplicadores atuais por modo; eles não aumentam XP na configuração atual.

**Fonte:** [src/lib/exercises/progression.ts](../../../src/lib/exercises/progression.ts). Declaração nas linhas 17–19; recorte 17–19.

```ts
export function calculateExerciseXp(baseXp: number, mode: AssistanceMode) {
  return Math.round(Math.max(0, baseXp) * XP_MULTIPLIER[mode]);
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## deriveCompletedNodeStatus

Conclui o nó sem declarar domínio independente que não foi medido.

**Fonte:** [src/lib/exercises/progression.ts](../../../src/lib/exercises/progression.ts). Declaração nas linhas 33–42; recorte 33–42.

```ts
export function deriveCompletedNodeStatus(input: {
  completedExercises: number;
  totalExercises: number;
  mastery: number;
}): KnowledgeProgressStatus {
  if (input.totalExercises <= 0 || input.completedExercises < input.totalExercises)
    return 'IN_PROGRESS';
  // Completion is not independently measured mastery. Assistance is self-reported.
  return 'COMPLETED';
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## prepareCode

Adapta fragmentos de determinadas linguagens ao programa exigido pelo provedor, sem assegurar correção pedagógica.

**Fonte:** [src/lib/code-execution/server.ts](../../../src/lib/code-execution/server.ts). Declaração nas linhas 35–68; recorte 35–68.

```ts
export function prepareCode(
  code: string,
  language: string,
  provider: 'judge0' | 'wandbox'
): string {
  const trimmed = code.trim();

  switch (language) {
    case 'java': {
      if (/class\s+\w+/i.test(trimmed)) {
        return provider === 'wandbox' ? trimmed.replace(/public\s+class\s+/gi, 'class ') : trimmed;
      }
      const classDeclaration = provider === 'wandbox' ? 'class Main' : 'public class Main';
      return `${classDeclaration} {\n  public static void main(String[] args) {\n${indent(trimmed)}\n  }\n}`;
    }
    case 'go':
      return /package\s+main/i.test(trimmed)
        ? trimmed
        : `package main\n\nimport "fmt"\n\nfunc main() {\n${indent(trimmed)}\n}`;
    case 'cpp':
    case 'c':
      return /#include|main\s*\(/i.test(trimmed)
        ? trimmed
        : `#include <iostream>\nusing namespace std;\n\nint main() {\n${indent(trimmed)}\n  return 0;\n}`;
    case 'kotlin':
      return /fun\s+main\s*\(/i.test(trimmed) ? trimmed : `fun main() {\n${indent(trimmed)}\n}`;
    case 'swift':
      return /import\s+Foundation/i.test(trimmed) ? trimmed : `import Foundation\n\n${trimmed}`;
    case 'rust':
      return /fn\s+main\s*\(/i.test(trimmed) ? trimmed : `fn main() {\n${indent(trimmed)}\n}`;
    default:
      return trimmed;
  }
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## executeCode

Escolhe o caminho de execução e distingue resultado de indisponibilidade.

**Fonte:** [src/lib/code-execution/server.ts](../../../src/lib/code-execution/server.ts). Declaração nas linhas 214–265; recorte 214–261.

```ts
export async function executeCode(code: string, language: string): Promise<ServerExecutionResult> {
  const aliases: Record<string, string> = { js: 'javascript', ts: 'typescript', py: 'python' };
  const normalized = aliases[language.toLowerCase()] ?? language.toLowerCase();
  const judge0LanguageId = JUDGE0_LANGUAGES[normalized];
  const wandboxLanguage = WANDBOX_LANGUAGES[normalized];

  if (!judge0LanguageId && !wandboxLanguage) {
    return {
      ok: false,
      output: '',
      error: `Linguagem "${language}" não suportada.`,
      executionMs: 0,
    };
  }

  if (normalized === 'javascript' || normalized === 'typescript') {
    const executableCode =
      normalized === 'typescript'
        ? ts.transpileModule(code, {
            compilerOptions: {
              target: ts.ScriptTarget.ES2020,
              module: ts.ModuleKind.None,
              strict: false,
            },
            reportDiagnostics: false,
          }).outputText
        : code;
    const localResult = await runJavaScriptInSandbox(executableCode);
    if (localResult) return localResult;
  }

  if (judge0LanguageId) {
    const result = await runOnJudge0(prepareCode(code, normalized, 'judge0'), judge0LanguageId);
    if (result) return result;
  }

  if (wandboxLanguage && normalized !== 'kotlin' && normalized !== 'swift') {
    const result = await runOnWandbox(
      prepareCode(code, normalized, 'wandbox'),
      wandboxLanguage.compiler
    );
    if (result) return result;
  }

  return {
    ok: false,
    output: '',
    error: 'Serviço de execução indisponível no momento. Tente novamente em instantes.',
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## awardXPInTransaction

Centraliza o crédito confirmado no contexto da transação recebida.

**Fonte:** [src/lib/xp.ts](../../../src/lib/xp.ts). Declaração nas linhas 19–113; recorte 19–66.

```ts
export async function awardXPInTransaction(
  tx: Prisma.TransactionClient,
  userId: string,
  language: Language | null | undefined,
  amount: number
) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('INVALID_XP_AMOUNT');
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`learning:${userId}`}))`;
  // Buscar usuário primeiro para calcular a ofensiva geral
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { streak_days: true, last_active_at: true },
  });

  const now = new Date();
  const newStreakDays = calculateNextStreak(user?.streak_days ?? 0, user?.last_active_at, now);

  // 1. Atualizar o total_xp, streak_days, last_active_at do usuário
  const updatedUser = await tx.user.update({
    where: { id: userId },
    data: {
      total_xp: {
        increment: amount,
      },
      streak_days: newStreakDays,
      last_active_at: now,
    },
  });

  await recordPeriodXp(tx, userId, language, amount);

  if (!language)
    return {
      xpEarned: amount,
      language: null,
      newXp: updatedUser.total_xp,
      newLevel: calculateLevel(updatedUser.total_xp).level,
      newStreak: newStreakDays,
      totalXp: updatedUser.total_xp,
    };

  // 2. Buscar ou criar a trilha da linguagem
  const trail = await tx.languageTrail.findUnique({
    where: {
      user_id_language: { user_id: userId, language },
    },
  });

```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## calculateLevel

Usa limites iniciais e incrementos crescentes; nível não é sinônimo de faixa visual.

**Fonte:** [src/lib/learning/rewards.ts](../../../src/lib/learning/rewards.ts). Declaração nas linhas 13–29; recorte 13–29.

```ts
export function calculateLevel(xp: number) {
  const thresholds = [0, 500, 800, 1100, 1500, 2000];
  const value = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  for (let i = 1; i < thresholds.length; i++) {
    if (value < thresholds[i])
      return { level: i, prevLevelXp: thresholds[i - 1], nextLevelXp: thresholds[i] };
  }
  let level = 6,
    prevLevelXp = 2000,
    increment = 600;
  while (value >= prevLevelXp + increment) {
    prevLevelXp += increment;
    level++;
    increment += 100;
  }
  return { level, prevLevelXp, nextLevelXp: prevLevelXp + increment };
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## reconcileCredentialsInTransaction

Confronta evidências e metas e persiste snapshots elegíveis de credencial.

**Fonte:** [src/lib/credentials/repository.ts](../../../src/lib/credentials/repository.ts). Declaração nas linhas 49–221; recorte 49–96.

```ts
export async function reconcileCredentialsInTransaction(
  tx: Prisma.TransactionClient,
  userId: string
): Promise<CredentialCollection> {
  const [user, correctAttempts, submissions, exercises, paths, earned] = await Promise.all([
    tx.user.findUnique({ where: { id: userId }, select: { username: true, avatar_config: true } }),
    tx.quizAttempt.findMany({
      where: { user_id: userId, is_correct: true },
      select: { quiz_id: true },
    }),
    tx.exerciseSubmission.findMany({
      where: { user_id: userId, status: 'PASSED' },
      select: {
        exercise_id: true,
        total_public: true,
        passed_public: true,
        total_hidden: true,
        passed_hidden: true,
      },
    }),
    tx.exercise.findMany({
      where: { is_published: true },
      select: {
        id: true,
        title: true,
        language: true,
        knowledge_node_id: true,
        estimated_minutes: true,
        _count: { select: { test_cases: true } },
      },
    }),
    tx.learningPath.findMany({
      where: { is_published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        nodes: {
          orderBy: { position: 'asc' },
          select: {
            knowledge_node: {
              select: { id: true, title: true, language: true, is_published: true },
            },
          },
        },
      },
    }),
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## getEarnedCredentials

Lê credenciais públicas válidas sem conceder novas por causa de visita ao perfil.

**Fonte:** [src/lib/credentials/repository.ts](../../../src/lib/credentials/repository.ts). Declaração nas linhas 232–241; recorte 232–241.

```ts
export async function getEarnedCredentials(userId: string): Promise<CredentialRecord[]> {
  const rows = await prisma.learningCredential.findMany({
    where: { userId, revokedAt: null },
    select: recordSelect,
    orderBy: { issuedAt: 'desc' },
  });
  return rows
    .map(publicRecord)
    .filter((record): record is CredentialRecord => record?.status === 'valid');
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## getPublicCredential

Limita formato do identificador e retorna o registro de verificação correspondente.

**Fonte:** [src/lib/credentials/repository.ts](../../../src/lib/credentials/repository.ts). Declaração nas linhas 243–250; recorte 243–250.

```ts
export async function getPublicCredential(id: string): Promise<CredentialRecord | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const row = await prisma.learningCredential.findUnique({ where: { id }, select: recordSelect });
  if (!row) return null;
  const record = publicRecord(row);
  if (!record) return null;
  return record;
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## create

Cria publicação a partir de contrato e anexos autorizados, com identificação de pedidos repetidos.

**Fonte:** [src/services/post.service.ts](../../../src/services/post.service.ts). Declaração nas linhas 22–185; recorte 22–69.

```ts
  async create(userId: string, data: CreatePostInput, clientId?: string) {
    const { title, body, language, code, image_url, type, audience, attachments, music, poll } =
      data;

    // Idempotency check: if client_id already exists for this user, return existing post
    if (clientId) {
      const existing = await prisma.post.findFirst({
        where: { author_id: userId, client_id: clientId },
      });
      if (existing) {
        return { post: existing, xpResult: null };
      }
    }

    let leveledUp = false;
    const result = await prisma.$transaction(async (tx) => {
      const mediaIds = attachments.map((item) => item.url.split('/').at(-1)!);
      if (new Set(mediaIds).size !== mediaIds.length)
        throw new ValidationError(
          'INVALID_MEDIA',
          'Um mesmo anexo não pode ser adicionado duas vezes.'
        );
      if (mediaIds.length) {
        const media = await tx.postMedia.findMany({
          where: { id: { in: mediaIds }, owner_id: userId, post_id: null },
        });
        if (
          media.length !== mediaIds.length ||
          attachments.some((item) => {
            const file = media.find((file) => file.id === item.url.split('/').at(-1));
            return (
              !file ||
              (item.type === 'audio'
                ? !file.content_type.startsWith('audio/')
                : item.type === 'gif'
                  ? file.content_type !== 'image/gif'
                  : !file.content_type.startsWith('image/'))
            );
          })
        )
          throw new ValidationError(
            'INVALID_MEDIA',
            'Um anexo está indisponível. Envie o arquivo novamente.'
          );
      }
      // 1. Create Post
      const post = await tx.post.create({
        data: {
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## getFeed

Monta consulta por filtros, cursor e visibilidade antes de apresentar a página.

**Fonte:** [src/services/post.service.ts](../../../src/services/post.service.ts). Declaração nas linhas 187–337; recorte 187–234.

```ts
  async getFeed(
    userId: string | null,
    params: {
      language?: string;
      languages?: string[];
      search?: string;
      author?: string;
      filter?: string;
      sort?: 'recent' | 'popular';
      cursor?: string;
      limit?: number;
      likedBy?: string;
      answeredBy?: string;
    }
  ) {
    const {
      language,
      languages,
      search,
      author,
      filter,
      sort,
      cursor,
      limit = 10,
      likedBy,
      answeredBy,
    } = params;

    const whereClause: any = {};

    if (filter === 'following') {
      if (!userId) {
        whereClause.id = { equals: '__anonymous_following_feed__' };
      } else {
        whereClause.author = {
          followers: {
            some: { followerId: userId },
          },
        };
      }
    }

    if (language) {
      whereClause.language = language as Language;
    }
    if (author) {
      whereClause.author = { username: author };
    }
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## visiblePostWhere

Compõe restrições de autor e audiência para consulta; conhecer ID não concede acesso.

**Fonte:** [src/services/post-access.service.ts](../../../src/services/post-access.service.ts). Declaração nas linhas 7–20; recorte 7–20.

```ts
export function visiblePostWhere(viewerId: string | null): Prisma.PostWhereInput {
  return {
    author: visibleUserWhere(viewerId),
    OR: [
      { audience: 'everyone' },
      ...(viewerId
        ? [
            { author_id: viewerId },
            { audience: 'followers', author: { followers: { some: { followerId: viewerId } } } },
          ]
        : []),
    ],
  };
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## toggleReaction

Serializa transições de reação e seus efeitos/reversões de XP.

**Fonte:** [src/services/reaction.service.ts](../../../src/services/reaction.service.ts). Declaração nas linhas 13–136; recorte 13–60.

```ts
  async toggleReaction(userId: string, postId: string, type: string | null) {
    if (type !== null && !VALID_REACTIONS.includes(type)) {
      throw new Error('INVALID_REACTION_TYPE');
    }

    return await prisma.$transaction(async (tx) => {
      // Serialize reaction transitions with all XP writes for this user.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`learning:${userId}`}))`;
      // 1. Verify post exists
      const post = await tx.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundError('POST_NOT_FOUND', 'Postagem não encontrada');
      }

      await BlockService.assertCanInteract(userId, post.author_id, tx);
      await assertPostAudience(post, userId, tx);

      // 2. Fetch existing reaction
      const existingReaction = await tx.reaction.findUnique({
        where: {
          post_id_user_id: {
            post_id: postId,
            user_id: userId,
          },
        },
      });

      if (type === null) {
        if (existingReaction) {
          // Remove reaction
          await tx.reaction.delete({
            where: {
              post_id_user_id: {
                post_id: postId,
                user_id: userId,
              },
            },
          });

          // Reverse the reaction reward in this transaction. The general award
          // helper intentionally rejects negative amounts.
          const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
          await tx.user.update({
            where: { id: userId },
            data: { total_xp: { decrement: Math.min(2, Math.max(0, user.total_xp)) } },
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## toggleFollow

Representa a relação direcional de seguir, distinta de amizade mútua.

**Fonte:** [src/services/follow.service.ts](../../../src/services/follow.service.ts). Declaração nas linhas 8–76; recorte 8–55.

```ts
  async toggleFollow(followerId: string, followingId: string, ensureFollowing = false) {
    if (followerId === followingId) {
      throw new ValidationError('SELF_FOLLOW', 'Você não pode seguir a si mesmo');
    }

    const result = await prisma.$transaction(async (tx) => {
      await BlockService.assertCanInteract(followerId, followingId, tx);
      if (ensureFollowing) {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${followerId} FOR UPDATE`;
      }
      // 1. Verify target user exists
      const targetUser = await tx.user.findUnique({
        where: { id: followingId },
      });

      if (!targetUser) {
        throw new NotFoundError('USER_NOT_FOUND', 'Usuário não encontrado');
      }

      // 2. Check if already following
      const existingFollow = await tx.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      if (existingFollow) {
        // A stale recommendation or a retry must never undo an existing follow.
        if (ensureFollowing) return { following: true };
        // Unfollow
        await tx.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId,
            },
          },
        });
        logger.info('User unfollowed', { followerId, followingId });
        return { following: false };
      } else {
        // Follow
        await tx.follow.create({
          data: {
            followerId,
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## getUserNotifications

Consulta notificações do destinatário aplicando a política do serviço.

**Fonte:** [src/services/notification.service.ts](../../../src/services/notification.service.ts). Declaração nas linhas 138–322; recorte 138–185.

```ts
  async getUserNotifications(userId: string, cursor?: string, limit = 10, useCursor = true) {
    const where = {
      userId,
      OR: [{ actorId: null }, { actor: { is: visibleUserWhere(userId) } }],
      ...buildCursorWhere(cursor, 'createdAt'),
    };

    const takeVal = useCursor ? limit + 1 : undefined;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: takeVal,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            avatar_config: true,
            total_xp: true,
          },
        },
      },
    });

    const jobIds = [
      ...new Set(
        notifications
          .filter((notification) => notification.resourceType === 'JOB' && notification.resourceId)
          .map((notification) => notification.resourceId!)
      ),
    ];
    // One query for the page, bounded to this candidate's applications.
    const jobs = jobIds.length
      ? await prisma.job.findMany({
          where: { id: { in: jobIds } },
          select: {
            id: true,
            title: true,
            company: { select: { name: true } },
            applications: {
              where: { user_id: userId },
              take: 1,
              select: { status: true, stage: { select: { title: true } } },
            },
          },
        })
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## markAllAsRead

Marca somente os registros do destinatário informado pelo fluxo autorizado.

**Fonte:** [src/services/notification.service.ts](../../../src/services/notification.service.ts). Declaração nas linhas 324–334; recorte 324–334.

```ts
  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  },
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## saveProfileCustomization

Valida preferências, versão e itens permitidos para gravar a identidade do titular.

**Fonte:** [src/services/profile-customization.service.ts](../../../src/services/profile-customization.service.ts). Declaração nas linhas 469–660; recorte 469–516.

```ts
export async function saveProfileCustomization(
  userId: string,
  input: unknown
): Promise<ProfileCustomizationState> {
  const parsed = saveProfileCustomizationSchema.parse(input);
  const existing = await prisma.profileCustomization.findUnique({ where: { userId } });
  const current = parseProfilePreferences(existing?.preferences);
  parsed.preferences = normalizeProfilePreferenceAliases(parsed.preferences, current);
  const bannerImage = parsed.preferences.banner.imageUrl;
  if (
    bannerImage &&
    bannerImage !== current.banner.imageUrl &&
    !isOwnedProfileUpload(bannerImage, userId)
  )
    throw new ValidationError(
      'BANNER_IMAGE_NOT_OWNED',
      'Envie uma imagem pela sua conta para usar no banner.'
    );
  // Client metadata is never authoritative, even when the track ID stays the same.
  if (parsed.preferences.music) {
    if (current.music?.trackId === parsed.preferences.music.trackId) {
      parsed.preferences.music = current.music;
    } else {
      const resolved = await resolveSpotifyTrack(parsed.preferences.music.trackId);
      // Availability diagnostics are transport-only and must not contaminate
      // the strict persisted preferences schema.
      parsed.preferences.music = {
        trackId: resolved.trackId,
        title: resolved.title,
        artist: resolved.artist,
        artworkUrl: resolved.artworkUrl,
        ...(resolved.album !== undefined ? { album: resolved.album } : {}),
        ...(resolved.durationMs !== undefined ? { durationMs: resolved.durationMs } : {}),
      };
    }
  }
  const catalog = await getProfileCatalog();
  await prisma.$transaction(
    async (tx) => {
      const { achievements } = await reconcileInTransaction(tx, userId, catalog);
      const row = await tx.profileCustomization.findUnique({ where: { userId } });
      if ((row?.version || 0) !== parsed.version)
        throw new AppError(
          'PROFILE_VERSION_CONFLICT',
          'Seu perfil mudou em outra sessão. Recarregue antes de salvar.',
          409,
          { currentVersion: row?.version || 0 }
        );
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## dayKey

Define dia civil em São Paulo para recibos e sequências; não é relógio livre do navegador.

**Fonte:** [src/lib/mundinho/rules.ts](../../../src/lib/mundinho/rules.ts). Declaração nas linhas 12–19; recorte 12–19.

```ts
export function dayKey(now: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## resolveTurn

Resolve combate de criatura com efeitos do golpe e contra-ataque; PvP usa alternância própria.

**Fonte:** [src/lib/mundinho/rules.ts](../../../src/lib/mundinho/rules.ts). Declaração nas linhas 45–66; recorte 45–66.

```ts
export function resolveTurn(
  hp: number,
  enemyHp: number,
  correct: boolean,
  skill: string,
  level: number,
  equipment: { maxHp: number; protection: number } = { maxHp: 100, protection: 0 }
) {
  const move = SKILLS.find((s) => s.id === skill) ?? SKILLS[0];
  const nextEnemy = Math.max(0, enemyHp - (correct ? move.damage : 0));
  const nextHp = Math.max(
    0,
    Math.min(equipment.maxHp, hp + (correct ? move.heal : 0)) -
      (nextEnemy > 0 ? Math.max(1, (correct ? 9 : 18) + level * 2 - equipment.protection) : 0)
  );
  return {
    hp: nextHp,
    enemyHp: nextEnemy,
    status:
      nextEnemy === 0 ? ('won' as const) : nextHp === 0 ? ('lost' as const) : ('active' as const),
  };
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## equipmentStats

Deriva bônus de itens efetivamente possuídos e equipados em slots válidos.

**Fonte:** [src/lib/mundinho/equipment.ts](../../../src/lib/mundinho/equipment.ts). Declaração nas linhas 142–163; recorte 142–163.

```ts
export function equipmentStats(
  inventory: readonly string[],
  equipped: Record<string, string>
): CombatStats {
  let luck = 0,
    protection = 0,
    vitality = 0;
  for (const item of EQUIPMENT) {
    if (!inventory.includes(item.id) || equipped[item.slot] !== item.id) continue;
    luck += item.luck;
    protection += item.protection;
    vitality += item.vitality;
  }
  luck = Math.min(25, luck);
  return {
    maxHp: 100 + Math.min(50, vitality),
    protection: Math.min(8, protection),
    luck,
    directChance: hasBugHunterTitle(inventory, equipped) ? 100 : Math.min(100, 75 + luck),
    dropChance: 50 + luck,
  };
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## credit

Liga crédito ao recibo único no extrato para reconhecer repetição.

**Fonte:** [src/lib/mundinho/repository.ts](../../../src/lib/mundinho/repository.ts). Declaração nas linhas 155–160; recorte 155–160.

```ts
async function credit(tx: Tx, userId: string, key: string, label: string, amount: number) {
  if (await tx.rpgTransaction.findUnique({ where: { userId_key: { userId, key } } })) return false;
  await tx.rpgTransaction.create({ data: { userId, key, label, amount } });
  await tx.rpgPlayer.update({ where: { userId }, data: { coins: { increment: amount } } });
  return true;
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## adventure

Coordena ações autenticadas do RPG; a função completa contém os ramos de economia e batalha.

**Fonte:** [src/lib/mundinho/repository.ts](../../../src/lib/mundinho/repository.ts). Declaração nas linhas 308–702; recorte 308–355.

```ts
export async function adventure(userId: string, action?: Action): Promise<AdventureState> {
  let codeRun: CodeRun | undefined;
  let notice: string | undefined;
  // Execute outside the transaction: an external compiler must not hold the player row lock.
  if (action?.type === 'battle-code') {
    const battle = await prisma.rpgBattle.findFirst({ where: { id: action.battle, userId } });
    if (
      !battle ||
      battle.status !== 'active' ||
      battle.turn !== action.turn ||
      battle.questionId !== action.question
    )
      return {
        ...(await adventure(userId)),
        notice: 'A batalha foi atualizada. Este turno já não está ativo.',
      };
    const challenge = codeChallenge(battle.language as BattleLanguage, battle.questionId!);
    if (!challenge || challenge.id !== battle.questionId)
      fail('Este turno não é um desafio de código.');
    const prepared = instrumentChallengeSource(
      battle.language as BattleLanguage,
      action.code,
      challenge
    );
    if (prepared.error) {
      codeRun = { passed: false, trace: [], error: prepared.error };
    } else {
      const execution = await executeCode(
        challengeProgram(battle.language as BattleLanguage, prepared.source, challenge),
        challengeExecutionLanguage(battle.language as BattleLanguage)
      );
      if (!execution.ok) {
        codeRun = {
          passed: false,
          trace: [],
          retryable: true,
          error: `${execution.error ?? 'Não foi possível executar o código.'}${execution.output && execution.output !== '(sem output)' ? `\n${execution.output.slice(0, 1800)}` : ''}\nSeu turno não foi consumido. Revise ou tente novamente.`,
        };
      } else codeRun = evaluateTrace(execution.output, challenge);
    }
  }
  return prisma.$transaction(
    async (tx) => {
      // The database clock is authoritative; clients never supply dates, prices, damage or rewards.
      const [clock] = await tx.$queryRaw<{ now: Date }[]>`SELECT CURRENT_TIMESTAMP AS now`;
      const now = clock.now;
      let chestAwarded: boolean | undefined;
      await tx.rpgPlayer.upsert({
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## validArenaPosition

Confere limites de movimento e deslocamento compatível com tempo decorrido.

**Fonte:** [src/lib/mundinho/arena-rules.ts](../../../src/lib/mundinho/arena-rules.ts). Declaração nas linhas 32–39; recorte 32–39.

```ts
export function validArenaPosition(previous: ArenaPosition, next: ArenaPosition, elapsed: number) {
  // Network jitter gets a small allowance; a client cannot jump across the room.
  const distance = Math.hypot(next.x - previous.x, next.y - previous.y);
  return (
    arenaCanWalk(next.x, next.y) &&
    distance <= Math.min(600, (Math.max(0, elapsed) / 1000) * 180 + 48)
  );
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## chooseArenaAttack

Trava sorteio/seleção do exercício e resolve golpe direto com o snapshot de equipamento.

**Fonte:** [src/lib/mundinho/arena-rules.ts](../../../src/lib/mundinho/arena-rules.ts). Declaração nas linhas 89–112; recorte 89–112.

```ts
export function chooseArenaAttack(
  match: ArenaMatch,
  roll: number,
  now: Date,
  skill: ArenaSkill = 'strike'
): ArenaMatch {
  if (arenaNeedsExercise(match)) return match;
  match = { ...match, skill };
  const stats = match.stats![match.actorId];
  if (!directAttack(stats, roll))
    return {
      ...match,
      exerciseTurn: match.turn,
      log: [...match.log, 'Resolva o exercício para confirmar este golpe.'].slice(-8),
    };
  const damage = arenaAttackDamage(match);
  const move = SKILLS.find((s) => s.id === skill)!;
  return advanceArenaTurn(
    match,
    true,
    now,
    `${move.name}: ${stats.directChance === 100 ? 'Caça-bugs / sorte máxima!' : 'Golpe direto!'} ${damage} de dano no adversário.${move.heal > 0 ? ' Recupera até 20 de vida.' : move.heal < 0 ? ' Recebe 8 de desgaste.' : ''}`
  );
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## advanceArenaTurn

Aplica dano, cura e desgaste, verifica encerramento e alterna o ator do turno.

**Fonte:** [src/lib/mundinho/arena-rules.ts](../../../src/lib/mundinho/arena-rules.ts). Declaração nas linhas 43–78; recorte 43–78.

```ts
export function advanceArenaTurn(
  match: ArenaMatch,
  correct: boolean,
  now: Date,
  message: string
): ArenaMatch {
  const opponent = arenaOpponent(match, match.actorId);
  const move = SKILLS.find((s) => s.id === match.skill) ?? SKILLS[0];
  const damage = arenaAttackDamage(match);
  const hp = {
    ...match.hp,
    [opponent]: Math.max(0, match.hp[opponent] - (correct ? damage : 0)),
    [match.actorId]: Math.max(
      0,
      Math.min(
        match.stats?.[match.actorId]?.maxHp ?? 100,
        match.hp[match.actorId] + (correct ? move.heal : 0)
      )
    ),
  };
  const finished = hp[opponent] === 0 || hp[match.actorId] === 0 || match.turn >= 19;
  const ids = Object.keys(hp);
  const winnerId = hp[ids[0]] === hp[ids[1]] ? null : hp[ids[0]] > hp[ids[1]] ? ids[0] : ids[1];
  return {
    ...match,
    hp,
    status: finished ? 'finished' : 'active',
    winnerId: finished ? winnerId : null,
    actorId: opponent,
    turn: match.turn + 1,
    exerciseTurn: -1,
    skill: undefined,
    deadline: new Date(now.getTime() + ARENA_TURN_MS).toISOString(),
    log: [...match.log, message].slice(-8),
  };
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## arena

Integra identidade, participação, presença, turnos, compilação e persistência da sala.

**Fonte:** [src/lib/mundinho/arena.ts](../../../src/lib/mundinho/arena.ts). Declaração nas linhas 240–664; recorte 240–287.

```ts
export async function arena(userId: string, action: ArenaAction): Promise<ArenaState> {
  let codeRun: CodeRun | undefined;
  const admissionIds = [userId];
  if (action.type === 'accept') {
    const invitation = await prisma.rpgArenaRoom.findUnique({
      where: { id: action.roomId },
      select: { hostId: true },
    });
    if (invitation) admissionIds.push(invitation.hostId);
  }
  if (action.type === 'run') {
    await rateLimit(`arena-run:${userId}`, { limit: 12, window: '1 m', endpoint: '/api/mundinho' });
    // Compilers run without holding a room lock. The turn is checked again below.
    const room = await prisma.rpgArenaRoom.findUnique({ where: { id: action.roomId } });
    if (!room) throw new NotFoundError();
    member(room, userId);
    const match = matchOf(room);
    if (
      !match ||
      match.id !== action.matchId ||
      match.status !== 'active' ||
      match.actorId !== userId ||
      match.turn !== action.turn
    )
      invalid('Este turno já mudou. Atualize a arena.');
    if (!arenaNeedsExercise(match)) invalid('Escolha atacar antes de executar um exercício.');
    const language = (
      room.hostId === userId ? room.hostLanguage : room.guestLanguage
    ) as BattleLanguage;
    const challenges = codeChallenges(language, match.level);
    const question = challenges[(match.scenario + Math.floor(match.turn / 2)) % challenges.length];
    if (question.id !== action.questionId) invalid('O desafio deste turno mudou.');
    const prepared = instrumentChallengeSource(language, action.code, question);
    if (prepared.error) codeRun = { passed: false, trace: [], error: prepared.error };
    else {
      const result = await executeCode(
        challengeProgram(language, prepared.source, question),
        challengeExecutionLanguage(language)
      );
      codeRun = result.ok
        ? evaluateTrace(result.output, question)
        : {
            passed: false,
            trace: [],
            retryable: true,
            error: result.error ?? 'Executor indisponível. Seu turno foi preservado.',
          };
    }
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## chooseBestDuelSubmission

Escolhe a submissão representativa de um participante segundo validade e critérios da política.

**Fonte:** [src/lib/duels/resolution-policy.ts](../../../src/lib/duels/resolution-policy.ts). Declaração nas linhas 82–108; recorte 82–108.

```ts
export function chooseBestDuelSubmission(
  submissions: ComparableSubmission[],
  userId: string,
  acceptedOnly = false,
  language = 'TS'
) {
  return (
    submissions
      .filter((s) => s.user_id === userId && (!acceptedOnly || s.status === 'ACCEPTED'))
      .sort((a, b) => {
        if (valid(a) !== valid(b)) return valid(a) ? -1 : 1;
        if (valid(a) && valid(b)) {
          const gap = correctness(a, b);
          if (gap) return -gap;
          if (a.status === 'ACCEPTED' && b.status === 'ACCEPTED') {
            const efficiency = compareEfficiency(metrics(a, language), metrics(b, language));
            if (efficiency) return -efficiency;
          }
        }
        const outage =
          Number(b.status === 'JUDGE_UNAVAILABLE') - Number(a.status === 'JUDGE_UNAVAILABLE');
        return (
          outage || a.created_at.getTime() - b.created_at.getTime() || a.id.localeCompare(b.id)
        );
      })[0] ?? null
  );
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## decideDuelResolution

Aplica a ordem de correção, igualdade normalizada e desempate, distinguindo revisão de empate.

**Fonte:** [src/lib/duels/resolution-policy.ts](../../../src/lib/duels/resolution-policy.ts). Declaração nas linhas 109–178; recorte 109–156.

```ts
export function decideDuelResolution(input: {
  first: ComparableSubmission | null;
  second: ComparableSubmission | null;
  reason: 'automatic_score' | 'deadline_score';
  language?: string;
}): DuelResolutionDecision {
  const { first, second } = input,
    language = input.language ?? 'TS';
  const comparison: Comparison = {
    criterion: 'none',
    first: first ? metrics(first, language) : null,
    second: second ? metrics(second, language) : null,
  };
  const base = {
    scoreGap: Math.abs((first?.score ?? 0) - (second?.score ?? 0)),
    runtimeGap:
      first?.runtime_ms != null && second?.runtime_ms != null
        ? Math.abs(first.runtime_ms - second.runtime_ms)
        : null,
    comparison,
  };
  const closed = (
    reason: DuelResolutionDecision['reason'],
    winnerId: string | null = null
  ): DuelResolutionDecision => ({ ...base, kind: 'closed', reason, winnerId });
  if (first?.status === 'JUDGE_UNAVAILABLE' || second?.status === 'JUDGE_UNAVAILABLE')
    return closed('judge_unavailable');
  if (!first && !second) return closed('no_submissions');
  const a = valid(first) ? first : null,
    b = valid(second) ? second : null;
  if (!a && !b) return closed('no_valid_submissions');
  if (!a || !b) {
    comparison.criterion = 'correctness';
    return closed(input.reason, (a ?? b)!.user_id);
  }
  const correctGap = correctness(a, b);
  if (correctGap) {
    comparison.criterion = 'correctness';
    return closed(input.reason, correctGap > 0 ? a.user_id : b.user_id);
  }
  if (a.status !== 'ACCEPTED' || b.status !== 'ACCEPTED') {
    comparison.criterion = 'tie';
    return closed('technical_draw');
  }
  const canonicalA = analyzeDuelSource(a.code, language).canonical,
    canonicalB = analyzeDuelSource(b.code, language).canonical;
  if (canonicalA && canonicalA === canonicalB) {
    comparison.criterion = 'identical_code';
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## awardDuelWinnerXP

Mantém crédito de vitória associado ao resultado e sua proteção contra repetição.

**Fonte:** [src/lib/duels/resolution.ts](../../../src/lib/duels/resolution.ts). Declaração nas linhas 233–242; recorte 233–242.

```ts
export async function awardDuelWinnerXP(duelId: string, winnerId: string, language: Language) {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.duel.updateMany({
      where: { id: duelId, status: 'CLOSED', winner_id: winnerId, xp_awarded_at: null },
      data: { xp_awarded_at: new Date() },
    });
    if (claim.count !== 1) return null;
    return awardXPInTransaction(tx, winnerId, language, 50);
  });
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## checkEligibility

Confere XP ou conclusão real de trilha para a candidatura a avaliador.

**Fonte:** [src/services/evaluator.service.ts](../../../src/services/evaluator.service.ts). Declaração nas linhas 30–91; recorte 30–77.

```ts
  async checkEligibility(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        quiz_attempts: {
          where: { is_correct: true },
          select: { quiz_id: true },
        },
        evaluator_profile: true,
        evaluator_applications: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return { eligible: false, reason: 'Usuário não encontrado', completedTrails: [] };
    }

    const completedQuizIds = new Set(user.quiz_attempts.map((a) => a.quiz_id));
    const completedTrails: string[] = [];

    // Check each language trail
    for (const [lang, levels] of Object.entries(TRAILS_DATA)) {
      const allQuestionsCompleted = levels.every((lvl) =>
        lvl.questions.every((q) => completedQuizIds.has(q.id))
      );
      if (allQuestionsCompleted && levels.length > 0) {
        completedTrails.push(lang);
      }
    }
    // Current learning paths also award eligibility; legacy assessment IDs remain valid.
    for (const course of LEARNING_COURSES) {
      const steps = course.lessons.flatMap((lesson) =>
        lesson.steps.filter((step) => step.type !== 'concept_explanation')
      );
      if (steps.length && steps.every((step) => completedQuizIds.has(step.id))) {
        if (!completedTrails.includes(course.language)) completedTrails.push(course.language);
      }
    }

    const hasTrail = completedTrails.length >= 1;
    const hasSufficientXp = user.total_xp >= EVALUATOR_MIN_XP;
    const eligible = hasTrail || hasSufficientXp;

    const latestApplication = user.evaluator_applications[0] || null;

```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## submitDuelEvaluation

Confronta autorização, situação e conflito antes do parecer humano e seus efeitos.

**Fonte:** [src/services/evaluator.service.ts](../../../src/services/evaluator.service.ts). Declaração nas linhas 412–569; recorte 412–459.

```ts
  async submitDuelEvaluation(params: {
    duelId: string;
    evaluatorId: string;
    scorePlayer1: number;
    scorePlayer2: number;
    winnerId: string;
    humanFeedback: string;
    strengths: string[];
    improvements: string[];
  }) {
    const {
      duelId,
      evaluatorId,
      scorePlayer1,
      scorePlayer2,
      winnerId,
      humanFeedback,
      strengths,
      improvements,
    } = params;

    const duel = await prisma.duel.findUnique({
      where: { id: duelId },
      include: { challenger: true, opponent: true },
    });

    if (!duel) throw new NotFoundError('DUEL_NOT_FOUND', 'Duelo não encontrado.');
    if (duel.status !== 'REVIEW_PENDING') {
      throw new ValidationError(
        'DUEL_NOT_PENDING',
        'Este duelo não está aguardando desempate humano.'
      );
    }
    if (duel.challenger_id === evaluatorId || duel.opponent_id === evaluatorId) {
      throw new ForbiddenError(
        'DUEL_SELF_REVIEW',
        'Participantes não podem avaliar o próprio duelo.'
      );
    }
    if (winnerId !== duel.challenger_id && winnerId !== duel.opponent_id) {
      throw new ValidationError(
        'DUEL_INVALID_WINNER',
        'O vencedor deve ser um dos participantes do duelo.'
      );
    }
    if (
      [scorePlayer1, scorePlayer2].some(
        (score) => !Number.isInteger(score) || score < 0 || score > 1000
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## requireCompanyAccess

Exige empresa existente e administrador ou recrutador proprietário.

**Fonte:** [src/lib/mobile/company-access.ts](../../../src/lib/mobile/company-access.ts). Declaração nas linhas 3–9; recorte 3–9.

```ts
export async function requireCompanyAccess(companyId: string, user: { id: string; role: string }) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new AppError('COMPANY_NOT_FOUND', 'Empresa não encontrada.', 404);
  if (user.role !== 'ADMIN' && (user.role !== 'RECRUITER' || company.owner_id !== user.id))
    throw new AppError('FORBIDDEN', 'Você não gerencia esta empresa.', 403);
  return company;
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## applyForJob

Rejeita vaga inadequada/duplicata e cria candidatura inicial.

**Fonte:** [src/services/job.service.ts](../../../src/services/job.service.ts). Declaração nas linhas 256–299; recorte 256–299.

```ts
  async applyForJob(userId: string, jobId: string) {
    const existing = await prisma.jobApplication.findUnique({
      where: {
        job_id_user_id: {
          job_id: jobId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      throw new Error('Você já se candidatou a esta vaga.');
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        stages: { orderBy: { order: 'asc' } },
        company: true,
      },
    });

    if (!job || job.status !== 'OPEN') {
      throw new Error('Esta vaga não está mais aceitando inscrições.');
    }

    const firstStage = job.stages[0];

    const application = await prisma.jobApplication.create({
      data: {
        job_id: jobId,
        user_id: userId,
        stage_id: firstStage?.id,
        status: 'APPLIED',
      },
      include: {
        stage: true,
        job: { include: { company: true } },
      },
    });

    logger.info('User applied for job', { userId, jobId, applicationId: application.id });
    return application;
  },
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## updateApplicationStage

Grava movimento do funil com auditoria e trata notificação posterior separadamente.

**Fonte:** [src/services/job.service.ts](../../../src/services/job.service.ts). Declaração nas linhas 304–358; recorte 304–351.

```ts
  async updateApplicationStage(params: {
    applicationId: string;
    stageId?: string;
    status: ApplicationStatus;
    feedback?: string;
    technicalScore?: number;
    actorId?: string;
  }) {
    const { applicationId, stageId, status, feedback, technicalScore } = params;

    const application = await prisma.$transaction(async (tx) => {
      const updated = await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          stage_id: stageId,
          status,
          feedback,
          technical_score: technicalScore,
        },
        include: {
          stage: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              total_xp: true,
              bio: true,
              github_username: true,
            },
          },
        },
      });
      await recordSecurityAudit(tx, {
        actorId: params.actorId,
        action: 'JOB_APPLICATION_UPDATED',
        resourceId: applicationId,
        metadata: { job_id: updated.job_id, status, stage_id: updated.stage_id },
      });
      return updated;
    });

    try {
      await NotificationService.create({
        userId: application.user_id,
        type: 'JOB_APPLICATION_UPDATE',
        resourceId: application.job_id,
        resourceType: 'JOB',
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## participate

Serializa a disputa de capacidade e confere encerramento, nível e participação existente.

**Fonte:** [src/services/event.service.ts](../../../src/services/event.service.ts). Declaração nas linhas 178–230; recorte 178–225.

```ts
  async participate(userId: string, eventId: string) {
    return prisma.$transaction(async (tx) => {
      // Capacity is shared by every participant, so serialize joins for the event.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`event-participation:${eventId}`}))`;
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, total_xp: true },
      });
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: { _count: { select: { participants: true } } },
      });

      if (!user) throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado.', 404);
      if (!event) throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado.', 404);
      const existing = await tx.eventParticipant.findUnique({
        where: { event_id_user_id: { event_id: eventId, user_id: userId } },
      });
      if (existing) return existing;
      if (event.status === 'COMPLETED' || event.end_date <= new Date())
        throw new AppError('EVENT_CLOSED', 'Este evento já foi encerrado.', 409);
      if (event.max_participants && event._count.participants >= event.max_participants) {
        throw new AppError('EVENT_FULL', 'Limite máximo de participantes atingido.', 409);
      }

      const userLevel = calculateLevel(user.total_xp).level;
      if (event.min_level > 1 && userLevel < event.min_level) {
        throw new AppError(
          'EVENT_LEVEL_REQUIRED',
          `Nível mínimo necessário (${event.min_level}) não atingido. Seu nível atual é ${userLevel}.`,
          403
        );
      }

      const participant = await tx.eventParticipant.upsert({
        where: {
          event_id_user_id: {
            event_id: eventId,
            user_id: userId,
          },
        },
        update: {},
        create: {
          event_id: eventId,
          user_id: userId,
          score: 0,
        },
      });
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## replaceSet

Valida a permissão e substitui o conjunto editável de desafios em transação.

**Fonte:** [src/services/event-challenge.service.ts](../../../src/services/event-challenge.service.ts). Declaração nas linhas 62–105; recorte 62–105.

```ts
  async replaceSet(
    eventId: string,
    challenges: EventChallengeInput[],
    viewer: EventChallengeViewer
  ) {
    const event = await findEvent(eventId);

    if (viewer.id !== event.creator_id && viewer.isAdmin !== true) {
      throw new ForbiddenError(
        'EVENT_CHALLENGE_FORBIDDEN',
        'Somente o criador do evento pode gerenciar os desafios.'
      );
    }

    if (effectiveEventStatus(event) === 'COMPLETED') {
      throw new ValidationError(
        'EVENT_COMPLETED',
        'Os desafios não podem ser alterados depois que o evento termina.'
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.eventChallenge.deleteMany({ where: { event_id: eventId } });
      await transaction.eventChallenge.createMany({
        data: challenges.map((challenge, index) => ({
          event_id: eventId,
          position: index + 1,
          title: challenge.title,
          statement: challenge.statement,
          language: challenge.language,
          expected_answer: challenge.expected_answer,
          examples: challenge.examples,
        })),
      });
    });

    logger.info('Event challenge set replaced', {
      eventId,
      userId: viewer.id,
      challengeCount: challenges.length,
    });

    return EventChallengeService.list(eventId, viewer);
  },
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## planCommunity

Recusa colisões com contas comuns e prepara uma importação de escopo reservado.

**Fonte:** [prisma/demo-community/publish.ts](../../../prisma/demo-community/publish.ts). Declaração nas linhas 66–98; recorte 66–98.

```ts
export async function planCommunity(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    where: { username: { in: COMMUNITY_PROFILES.map((p) => p.username) } },
    select: { id: true, username: true, email: true },
  });
  for (const profile of COMMUNITY_PROFILES) {
    const asset = assets[profile.username];
    if (!asset) throw new Error(`Missing avatar and reserved emails: ${profile.username}`);
    const existing = users.find((u) => u.username === profile.username);
    if (existing && !asset.emails.includes(existing.email))
      throw new Error(`Username belongs to a non-demo account: ${profile.username}`);
    communityPreferences(profile.username);
    if (
      !DEFAULT_PROFILE_CATALOG.frames.some((f) => f.id === profile.frameId) ||
      !DEFAULT_PROFILE_CATALOG.achievements.some((a) => a.id === profile.titleId)
    )
      throw new Error(`Unknown frame or title for ${profile.username}`);
  }
  const ids = users.map((u) => u.id);
  const managedPosts = await prisma.post.count({
    where: { author_id: { in: ids }, client_id: { startsWith: `${COMMUNITY_NAMESPACE}:` } },
  });
  return {
    profiles: COMMUNITY_PROFILES.length,
    newProfiles: COMMUNITY_PROFILES.length - users.length,
    threads: COMMUNITY_THREADS.length,
    notes: COMMUNITY_NOTES.length,
    continuations: COMMUNITY_THREADS.reduce((sum, t) => sum + t.parts.length - 1, 0),
    discussionMessages: COMMUNITY_THREADS.length * 2,
    existingManagedPosts: managedPosts,
    users,
  };
}
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).

## publishCommunity

Atualiza perfis e publicações com namespace/IDs estáveis sem usar o seed destrutivo.

**Fonte:** [prisma/demo-community/publish.ts](../../../prisma/demo-community/publish.ts). Declaração nas linhas 101–309; recorte 101–148.

```ts
export async function publishCommunity(
  prisma: PrismaClient,
  userIds: Record<string, string>,
  initializeProgressFor: readonly string[] = []
) {
  await planCommunity(prisma);
  return prisma.$transaction(
    async (tx) => {
      // Serialize publishers. Auth provisioning happens before this short database transaction.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(571139, 20261103)`;
      for (const profile of COMMUNITY_PROFILES) {
        const id = userIds[profile.username];
        if (!id) throw new Error(`Missing Auth identity for ${profile.username}`);
        const preferences = communityPreferences(profile.username);
        const frame = DEFAULT_PROFILE_CATALOG.frames.find((f) => f.id === profile.frameId)!;
        const title = DEFAULT_PROFILE_CATALOG.achievements.find((a) => a.id === profile.titleId)!;
        const existing = await tx.user.findUnique({
          where: { id },
          select: { avatar_config: true, email: true, username: true },
        });
        if (
          existing &&
          (existing.username !== profile.username ||
            !assets[profile.username].emails.includes(existing.email))
        )
          throw new Error(`Identity collision for ${profile.username}`);
        const config =
          existing?.avatar_config &&
          typeof existing.avatar_config === 'object' &&
          !Array.isArray(existing.avatar_config)
            ? existing.avatar_config
            : {};
        const visual = {
          displayName: profile.displayName,
          editorialDemo: true,
          profileStyle: {
            frame,
            title: {
              id: title.id,
              name: title.name,
              color: title.color,
              rarity: title.rarity,
              icon: title.icon,
            },
            nameStyle: preferences.nameStyle,
            flag: 'BR',
            flags: ['BR'],
          },
```

**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).
