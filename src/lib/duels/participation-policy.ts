import { DUEL_ABANDON_COOLDOWN_HOURS, MAX_CONSECUTIVE_DUEL_ABANDONS } from '@/lib/duels/constants';

export function getAbandonmentUpdate(currentCount: number, now = new Date()) {
  const nextCount = currentCount + 1;
  if (nextCount < MAX_CONSECUTIVE_DUEL_ABANDONS) {
    return { consecutive_duel_abandons: nextCount, duel_cooldown_until: null };
  }

  return {
    consecutive_duel_abandons: 0,
    duel_cooldown_until: new Date(now.getTime() + DUEL_ABANDON_COOLDOWN_HOURS * 60 * 60 * 1000),
  };
}

export function getDuelCooldownMessage(cooldownUntil: Date | string | null, now = new Date()) {
  if (!cooldownUntil) return null;
  const deadline = cooldownUntil instanceof Date ? cooldownUntil : new Date(cooldownUntil);
  if (Number.isNaN(deadline.getTime()) || deadline <= now) return null;
  const hours = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (60 * 60 * 1000)));
  return `Você está impedido de iniciar duelos por abandono após aceite. Tente novamente em ${hours} hora(s).`;
}
