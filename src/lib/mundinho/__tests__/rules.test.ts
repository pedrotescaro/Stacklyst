import { describe, expect, it } from 'vitest';
import { canChallengeCreature, checkinStatus, dayKey, resolveTurn, SKILLS } from '../rules';
import { QUESTIONS } from '../questions';
import {
  CHECKIN_REWARDS,
  DEFAULT_AVATAR,
  ITEMS,
  LANGUAGES,
  CREATURES,
  levelProgress,
} from '../types';

describe('Mundinho Gamification Rules', () => {
  it('only unlocks encounters at or below the player level', () => {
    expect(canChallengeCreature(1, 1)).toBe(true);
    expect(canChallengeCreature(1, 2)).toBe(false);
    expect(canChallengeCreature(2, 2)).toBe(true);
    expect(canChallengeCreature(3, 1)).toBe(true);
  });
  it('correctly calculates 7-day progressive checkin rewards and cycles', () => {
    const now = new Date('2026-10-29T12:00:00-03:00');
    const day = dayKey(now);

    // First ever checkin: streak 0, reward 10
    const status1 = checkinStatus(null, 0, now);
    expect(status1.claimed).toBe(false);
    expect(status1.streak).toBe(0);
    expect(status1.cycle).toBe(0);
    expect(status1.reward).toBe(10);
    expect(status1.day).toBe(day);

    // Checked in today: streak 1, already claimed
    const statusClaimed = checkinStatus(day, 1, now);
    expect(statusClaimed.claimed).toBe(true);
    expect(statusClaimed.streak).toBe(1);

    // Consecutive day checkin (yesterday checked in)
    const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
    const statusYesterday = checkinStatus(dayKey(yesterday), 3, now);
    expect(statusYesterday.claimed).toBe(false);
    expect(statusYesterday.streak).toBe(3);
    expect(statusYesterday.cycle).toBe(3);
    expect(statusYesterday.reward).toBe(CHECKIN_REWARDS[3]); // 25
  });

  it('resets checkin streak when a day is missed', () => {
    const now = new Date('2026-10-29T12:00:00-03:00');
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
    const status = checkinStatus(dayKey(threeDaysAgo), 5, now);
    expect(status.claimed).toBe(false);
    expect(status.streak).toBe(0);
    expect(status.cycle).toBe(0);
    expect(status.reward).toBe(10);
  });

  it('contains valid and educational programming questions for all supported languages', () => {
    for (const lang of LANGUAGES) {
      const langQuestions = QUESTIONS.filter((q) => q.language === lang);
      expect(langQuestions.length).toBeGreaterThanOrEqual(4);
      for (const q of langQuestions) {
        expect(q.prompt).toBeTruthy();
        expect(q.options.length).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThanOrEqual(3);
        expect(q.explanation).toBeTruthy();
        expect(q.concept).toBeTruthy();
      }
    }
  });

  it('resolves turn-based combat damage and healing correctly', () => {
    // Correct attack with strike: deals damage, enemy counterattacks with minor scratch
    const turn1 = resolveTurn(100, 100, true, 'strike', 1);
    expect(turn1.status).toBe('active');
    expect(turn1.enemyHp).toBe(70);
    expect(turn1.hp).toBe(89);

    // Incorrect answer gives full counterattack from enemy
    const turn2 = resolveTurn(100, 100, false, 'strike', 2);
    expect(turn2.status).toBe('active');
    expect(turn2.enemyHp).toBe(100);
    expect(turn2.hp).toBe(78);

    // Winning blow
    const win = resolveTurn(100, 10, true, 'burst', 1);
    expect(win.status).toBe('won');
    expect(win.enemyHp).toBe(0);

    // Defeat blow
    const loss = resolveTurn(10, 100, false, 'strike', 5);
    expect(loss.status).toBe('lost');
    expect(loss.hp).toBe(0);
  });

  it('calculates player levels and XP thresholds consistently', () => {
    const lvl1 = levelProgress(0);
    expect(lvl1.level).toBe(1);
    expect(lvl1.current).toBe(0);

    const lvl3 = levelProgress(96);
    expect(lvl3.level).toBeGreaterThanOrEqual(1);
  });
});
