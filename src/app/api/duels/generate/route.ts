import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import type { DuelProblem } from '@/lib/duel-problems';
import { generateProceduralDuelProblem } from '@/lib/duel-challenge-generator';

const SUPPORTED_LANGUAGES = ['TS', 'JS', 'PYTHON'] as const;
type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number];

const DIFFICULTY_MAP: Record<string, 'Fácil' | 'Médio' | 'Difícil'> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { language, difficulty, topic } = body;

    // Validate language
    if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: 'Linguagem inválida. Use TS, JS ou PYTHON.' },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    const diff = difficulty && validDifficulties.includes(difficulty) ? difficulty : 'medium';
    const diffLabel = DIFFICULTY_MAP[diff] || 'Médio';

    // Validate optional topic
    const sanitizedTopic =
      topic && typeof topic === 'string' && topic.trim().length > 0
        ? topic.trim().slice(0, 100)
        : undefined;

    logger.info('Generating procedural duel problem', {
      userId: user.id,
      language,
      difficulty: diff,
      topic: sanitizedTopic,
    });

    const problem: DuelProblem = generateProceduralDuelProblem(
      language as SupportedLang,
      diffLabel,
      sanitizedTopic,
      Array.isArray(body.excludeIds)
        ? body.excludeIds.filter((id: unknown): id is string => typeof id === 'string').slice(-20)
        : []
    );

    logger.info('Duel problem generated successfully', {
      problemId: problem.id,
      title: problem.title,
      testCases: problem.testCases.length,
    });

    return NextResponse.json({ problem });
  } catch (error) {
    logger.error('Error generating duel problem', { error: String(error) });
    return NextResponse.json({ error: 'Erro interno ao gerar desafio.' }, { status: 500 });
  }
}
