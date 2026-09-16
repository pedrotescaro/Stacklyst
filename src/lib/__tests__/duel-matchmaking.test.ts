import { describe, expect, it } from 'vitest';
import { getUserRankTier } from '@/services/duel.service';
import {
  DUEL_ABANDON_COOLDOWN_HOURS,
  DUEL_REQUEST_TIMEOUT_SECONDS,
  MAX_CONSECUTIVE_DUEL_ABANDONS,
} from '@/lib/duels/constants';
import { getAbandonmentUpdate, getDuelCooldownMessage } from '@/lib/duels/participation-policy';

describe('Duel Matchmaking and Rank System', () => {
  it('classifies user into correct rank tier based on XP', () => {
    expect(getUserRankTier(100)).toEqual({ tier: 'BRONZE', level: 1, label: 'Bronze' });
    expect(getUserRankTier(600)).toEqual({ tier: 'SILVER', level: 2, label: 'Prata' });
    expect(getUserRankTier(1500)).toEqual({ tier: 'GOLD', level: 3, label: 'Ouro' });
    expect(getUserRankTier(3000)).toEqual({ tier: 'PLATINUM', level: 4, label: 'Platina' });
    expect(getUserRankTier(6000)).toEqual({ tier: 'DIAMOND', level: 5, label: 'Diamante' });
  });

  it('keeps invitations open for 72 hours and sanctions only repeated abandonment', () => {
    expect(DUEL_REQUEST_TIMEOUT_SECONDS).toBe(72 * 60 * 60);
    expect(MAX_CONSECUTIVE_DUEL_ABANDONS).toBe(3);
    expect(DUEL_ABANDON_COOLDOWN_HOURS).toBe(24);

    const now = new Date('2026-09-09T12:00:00.000Z');
    expect(getAbandonmentUpdate(0, now)).toEqual({
      consecutive_duel_abandons: 1,
      duel_cooldown_until: null,
    });
    expect(getAbandonmentUpdate(2, now)).toEqual({
      consecutive_duel_abandons: 0,
      duel_cooldown_until: new Date('2026-09-10T12:00:00.000Z'),
    });
    expect(getDuelCooldownMessage('2026-09-10T12:00:00.000Z', now)).toContain('24 hora(s)');
  });
});
