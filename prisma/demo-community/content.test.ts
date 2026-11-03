// @vitest-environment node
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import {
  COMMUNITY_PROFILES,
  COMMUNITY_THREADS,
  COMMUNITY_NOTES,
  communityPartBody,
} from './content';
import { communityId, communityPreferences, planCommunity } from './publish';
import {
  DEFAULT_PROFILE_CATALOG,
  parseProfilePreferences,
} from '../../src/lib/profile-customization';

describe('Editorial collection integrity', () => {
  it('uses unique identities, supported cosmetics and valid persisted preferences', () => {
    expect(new Set(COMMUNITY_PROFILES.map((p) => p.username)).size).toBe(COMMUNITY_PROFILES.length);
    for (const profile of COMMUNITY_PROFILES) {
      const preferences = communityPreferences(profile.username);
      expect(parseProfilePreferences(preferences)).toEqual(preferences);
      expect(DEFAULT_PROFILE_CATALOG.frames.some((f) => f.id === preferences.frameId)).toBe(true);
      expect(
        DEFAULT_PROFILE_CATALOG.achievements.some((a) => a.id === preferences.equippedTitleId)
      ).toBe(true);
    }
  });
  it('fits the server’s reply depth and keeps each conversation attributable', () => {
    const usernames = new Set(COMMUNITY_PROFILES.map((p) => p.username));
    expect(new Set([...COMMUNITY_THREADS, ...COMMUNITY_NOTES].map((p) => p.key)).size).toBe(
      COMMUNITY_THREADS.length + COMMUNITY_NOTES.length
    );
    for (const thread of COMMUNITY_THREADS) {
      expect(usernames.has(thread.author)).toBe(true);
      expect(usernames.has(thread.discussion.author)).toBe(true);
      expect(thread.discussion.author).not.toBe(thread.author);
      expect(thread.parts.length).toBeLessThanOrEqual(5);
      thread.parts.forEach((_, i) =>
        expect(communityPartBody(thread, i)).toMatch(
          new RegExp(`^\\(${i + 1}/${thread.parts.length}\\)`)
        )
      );
      expect(communityPartBody(thread, thread.parts.length - 1)).toContain('Para consultar:');
      expect(thread.parts.every((p) => !/Ã[\u0080-\u00bf]|\ufffd/.test(p.body))).toBe(true);
    }
  });
  it('refuses a reserved username owned by an ordinary member', async () => {
    const db = {
      user: {
        findMany: async () => [
          { id: 'member', username: COMMUNITY_PROFILES[0].username, email: 'member@example.org' },
        ],
      },
    } as unknown as PrismaClient;
    await expect(planCommunity(db)).rejects.toThrow('non-demo account');
  });
  it('keeps row identities stable across retries and separate across authors', () => {
    expect(communityId('post', 'a:js-map-set')).toBe(communityId('post', 'a:js-map-set'));
    expect(communityId('post', 'a:js-map-set')).not.toBe(communityId('post', 'b:js-map-set'));
  });
});

for (const thread of COMMUNITY_THREADS) {
  if (thread.language === 'RUST') continue;
  for (const [index, part] of thread.parts.entries()) {
    if (!part.code || !part.expected) continue;
    it(`runs ${thread.key} example ${index + 1} and verifies its printed output`, () => {
      const code =
        thread.language === 'TS'
          ? ts.transpileModule(part.code!, { compilerOptions: { target: ts.ScriptTarget.ES2022 } })
              .outputText
          : part.code!;
      const result =
        thread.language === 'PYTHON'
          ? execFileSync('python', ['-I', '-c', code], {
              encoding: 'utf8',
              timeout: 5000,
              env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
            })
          : execFileSync(process.execPath, ['-e', code], { encoding: 'utf8', timeout: 5000 });
      expect(result.replaceAll('\r\n', '\n').trim()).toBe(part.expected);
    });
  }
}
