import { Language } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { getKnowledgeMapForUser } from '@/lib/learning/repository';
import { prisma } from '@/lib/prisma';
import { XpService } from '@/services/xp.service';

const CHEST_XP = 50;

const chestSchema = z.object({
  pathId: z.string().min(1).max(120),
  language: z.nativeEnum(Language),
  unitNumber: z.number().int().min(1).max(8),
});

export const POST = apiHandler(async (request) => {
  const user = await requireAuth();
  const { pathId, language, unitNumber } = chestSchema.parse(await request.json());
  const knowledgeMap = await getKnowledgeMapForUser(user.id);
  const path = knowledgeMap.paths.find((candidate) => candidate.id === pathId);
  const courseNodeIds = new Set(
    knowledgeMap.nodes
      .filter((node) => node.language === language || node.language === null)
      .map((node) => node.id)
  );
  const pathNodeIds = path?.nodeIds.filter((nodeId) => courseNodeIds.has(nodeId)) ?? [];

  if (!path || pathNodeIds.length === 0) {
    throw new AppError('TRAIL_PATH_NOT_FOUND', 'Rumo da trilha não encontrado', 404);
  }

  const milestoneIndex = (unitNumber - 1) * 4 + 1;
  const nodeIndex = Math.min(
    pathNodeIds.length - 1,
    Math.floor((milestoneIndex * pathNodeIds.length) / 32)
  );
  const requiredNode = knowledgeMap.nodes.find((node) => node.id === pathNodeIds[nodeIndex]);
  const chestUnlocked = requiredNode?.status === 'COMPLETED' || requiredNode?.status === 'MASTERED';

  if (!chestUnlocked) {
    throw new AppError(
      'TRAIL_CHEST_LOCKED',
      'Conclua as unidades anteriores antes de resgatar este baú',
      403
    );
  }

  const safePathSlug = path.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const chestId = `trail-chest-${language.toLowerCase()}-${safePathSlug}-s${unitNumber}`;

  let reward = await prisma.quiz.findUnique({ where: { id: chestId } });
  if (!reward) {
    reward = await prisma.quiz.create({
      data: {
        id: chestId,
        question: `Baú de ${path.title} - Seção ${unitNumber}`,
        options: ['Resgatado'],
        correct_index: 0,
        is_daily: false,
      },
    });
  }

  const existingClaim = await prisma.quizAttempt.findUnique({
    where: {
      user_id_quiz_id: {
        user_id: user.id,
        quiz_id: reward.id,
      },
    },
  });

  if (!existingClaim) {
    await prisma.quizAttempt.create({
      data: {
        user_id: user.id,
        quiz_id: reward.id,
        selected_index: 0,
        is_correct: true,
        xp_earned: CHEST_XP,
      },
    });
    await XpService.awardXP(user.id, language, CHEST_XP);
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { total_xp: true },
  });

  return NextResponse.json({
    ok: true,
    xpEarned: existingClaim ? 0 : CHEST_XP,
    newTotalXp: updatedUser?.total_xp ?? user.total_xp,
  });
});
