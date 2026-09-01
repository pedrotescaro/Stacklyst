import { prisma } from '@/lib/prisma';
import { Language, type Prisma } from '@prisma/client';
import { calculateNextStreak } from '@/lib/streak';

// Mapeamento de níveis baseado nas faixas de XP do seed do banco de dados
export function calculateLevel(xp: number): {
  level: number;
  nextLevelXp: number;
  prevLevelXp: number;
} {
  if (xp < 500) return { level: 1, nextLevelXp: 500, prevLevelXp: 0 };
  if (xp < 800) return { level: 2, nextLevelXp: 800, prevLevelXp: 500 };
  if (xp < 1100) return { level: 3, nextLevelXp: 1100, prevLevelXp: 800 };
  if (xp < 1500) return { level: 4, nextLevelXp: 1500, prevLevelXp: 1100 };
  if (xp < 2000) return { level: 5, nextLevelXp: 2000, prevLevelXp: 1500 };

  // Níveis acima do 6 incrementam com passos crescentes
  let level = 6;
  let currentThreshold = 2000;
  let nextIncrement = 600;

  while (xp >= currentThreshold + nextIncrement) {
    currentThreshold += nextIncrement;
    level++;
    nextIncrement += 100;
  }

  return {
    level,
    nextLevelXp: currentThreshold + nextIncrement,
    prevLevelXp: currentThreshold,
  };
}

// Função para conceder XP e atualizar dados de gamificação
export async function awardXP(
  userId: string,
  language: Language | null | undefined,
  amount: number
) {
  if (!language) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak_days: true, last_active_at: true },
    });

    const now = new Date();
    const newStreakDays = calculateNextStreak(user?.streak_days ?? 0, user?.last_active_at, now);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        total_xp: {
          increment: amount,
        },
        streak_days: newStreakDays,
        last_active_at: now,
      },
    });
    return {
      xpEarned: amount,
      language: null,
      newXp: updatedUser.total_xp,
      newLevel: calculateLevel(updatedUser.total_xp).level,
      newStreak: newStreakDays,
    };
  }

  return prisma.$transaction((tx) => awardXPInTransaction(tx, userId, language, amount));
}

export async function awardXPInTransaction(
  tx: Prisma.TransactionClient,
  userId: string,
  language: Language,
  amount: number
) {
  // Buscar usuário primeiro para calcular a ofensiva geral
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { streak_days: true, last_active_at: true },
  });

  const now = new Date();
  const newStreakDays = calculateNextStreak(user?.streak_days ?? 0, user?.last_active_at, now);

  // 1. Atualizar o total_xp, streak_days, last_active_at do usuário
  await tx.user.update({
    where: { id: userId },
    data: {
      total_xp: {
        increment: amount,
      },
      streak_days: newStreakDays,
      last_active_at: now,
    },
  });

  // 2. Buscar ou criar a trilha da linguagem
  const trail = await tx.languageTrail.findUnique({
    where: {
      user_id_language: { user_id: userId, language },
    },
  });

  let newXp = amount;
  let newLevel = 1;
  let newStreak = 1;

  if (trail) {
    newXp = trail.xp + amount;
    newLevel = calculateLevel(newXp).level;

    newStreak = calculateNextStreak(trail.streak, trail.last_activity_at, now);

    // Atualizar trilha existente
    await tx.languageTrail.update({
      where: { id: trail.id },
      data: {
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        last_activity_at: now,
      },
    });
  } else {
    // Criar nova trilha
    newLevel = calculateLevel(newXp).level;
    await tx.languageTrail.create({
      data: {
        user_id: userId,
        language,
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        last_activity_at: now,
      },
    });
  }

  // 3. Checar elegibilidade de badges
  await checkBadgeEligibility(tx, userId, Math.max(newStreak, newStreakDays));

  return {
    xpEarned: amount,
    language,
    newXp,
    newLevel,
    newStreak,
  };
}

// Verifica e concede badges
async function checkBadgeEligibility(
  tx: Prisma.TransactionClient,
  userId: string,
  currentStreak: number
) {
  // Buscar todas as conquistas do usuário
  const userBadges = await tx.userBadge.findMany({
    where: { user_id: userId },
    include: { badge: true },
  });

  const earnedSlugs = new Set<string>(userBadges.map((userBadge) => userBadge.badge.slug));

  const badgesToAward: string[] = [];

  // 1. Badge: Streak de 7 dias
  if (currentStreak >= 7 && !earnedSlugs.has('streak_7')) {
    badgesToAward.push('streak_7');
  }

  // 2. Badge: Streak de 30 dias
  if (currentStreak >= 30 && !earnedSlugs.has('streak_30')) {
    badgesToAward.push('streak_30');
  }

  // 3. Badge: Primeira Resposta (primeira resposta no fórum)
  if (!earnedSlugs.has('first_answer')) {
    const answerCount = await tx.answer.count({
      where: { author_id: userId },
    });
    if (answerCount > 0) {
      badgesToAward.push('first_answer');
    }
  }

  // 4. Badge: 5 Respostas Aceitas
  if (!earnedSlugs.has('accepted_5')) {
    const acceptedCount = await tx.answer.count({
      where: { author_id: userId, is_accepted: true },
    });
    if (acceptedCount >= 5) {
      badgesToAward.push('accepted_5');
    }
  }

  // 5. Badge: Quiz Master (5 acertos em quizzes)
  if (!earnedSlugs.has('quiz_master')) {
    const correctAttempts = await tx.quizAttempt.count({
      where: { user_id: userId, is_correct: true },
    });
    if (correctAttempts >= 5) {
      badgesToAward.push('quiz_master');
    }
  }

  // Conceder os badges elegíveis
  for (const slug of badgesToAward) {
    const badge = await tx.badge.findUnique({
      where: { slug },
    });

    if (badge) {
      await tx.userBadge.create({
        data: {
          user_id: userId,
          badge_id: badge.id,
        },
      });
    }
  }
}
