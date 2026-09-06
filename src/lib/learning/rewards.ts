// XP represents accumulated practice, not an opponent-adjusted competitive rating.
export const LEARNING_XP = { concept: 0, recall: 10, guided: 15, code: 25, project: 40 } as const;
export const XP_BANDS = [
  { tier: 'BRONZE', level: 1, label: 'Bronze', minXp: 0 },
  { tier: 'SILVER', level: 2, label: 'Prata', minXp: 500 },
  { tier: 'GOLD', level: 3, label: 'Ouro', minXp: 1200 },
  { tier: 'PLATINUM', level: 4, label: 'Platina', minXp: 2500 },
  { tier: 'DIAMOND', level: 5, label: 'Diamante', minXp: 5000 },
] as const;
export function getXpBand(xp: number) {
  return [...XP_BANDS].reverse().find((band) => xp >= band.minXp) ?? XP_BANDS[0];
}
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
export const XP_RANK_ORDER = [
  { total_xp: 'desc' as const },
  { username: 'asc' as const },
  { id: 'asc' as const },
];
export function usersAheadWhere(user: { id: string; username: string; total_xp: number }) {
  return {
    OR: [
      { total_xp: { gt: user.total_xp } },
      { total_xp: user.total_xp, username: { lt: user.username } },
      { total_xp: user.total_xp, username: user.username, id: { lt: user.id } },
    ],
  };
}
