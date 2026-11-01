import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROFILE_PREFERENCES,
  DEFAULT_PROFILE_CATALOG,
  profilePreferencesSchema,
  profileCatalogSchema,
  colorContrast,
  getProfileFlags,
  getSelectedProfileFlags,
  getProfileStudies,
  parseProfilePreferences,
  normalizeProfilePreferenceAliases,
  profileBasicsSchema,
  getAchievementInstructions,
} from '../profile-customization';
describe('Profile customization domain', () => {
  it('accepts the complete default catalog and country flags', () => {
    expect(profileCatalogSchema.safeParse(DEFAULT_PROFILE_CATALOG).success).toBe(true);
    expect(getProfileFlags().find((flag) => flag.id === 'BR')?.imageUrl).toBe(
      '/flags/profile/br.svg'
    );
  });
  it('normalizes tags, rejects scripts and refuses unknown/read-only keys', () => {
    expect(
      profilePreferencesSchema.parse({
        ...DEFAULT_PROFILE_PREFERENCES,
        tags: ['#React', 'react', 'Python'],
      }).tags
    ).toEqual(['react', 'python']);
    expect(
      profilePreferencesSchema.safeParse({
        ...DEFAULT_PROFILE_PREFERENCES,
        studies: ['<script>alert(1)</script>'],
      }).success
    ).toBe(false);
    expect(
      profilePreferencesSchema.safeParse({
        ...DEFAULT_PROFILE_PREFERENCES,
        unlockedAchievements: ['posts-1000'],
      }).success
    ).toBe(false);
    expect(
      profilePreferencesSchema.safeParse({ ...DEFAULT_PROFILE_PREFERENCES, flag: '<svg>' }).success
    ).toBe(false);
  });
  it('limits interests/studies and refuses executable or untrusted image schemes', () => {
    expect(
      profilePreferencesSchema.safeParse({
        ...DEFAULT_PROFILE_PREFERENCES,
        tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
      }).success
    ).toBe(false);
    expect(
      profilePreferencesSchema.safeParse({
        ...DEFAULT_PROFILE_PREFERENCES,
        studies: ['React', 'Python', 'Rust', 'Go'],
      }).success
    ).toBe(false);
    expect(
      profilePreferencesSchema.safeParse({
        ...DEFAULT_PROFILE_PREFERENCES,
        banner: { ...DEFAULT_PROFILE_PREFERENCES.banner, imageUrl: 'javascript:alert(1)' },
      }).success
    ).toBe(false);
  });
  it('requires unique stable catalog IDs and valid seasonal references', () => {
    expect(
      profileCatalogSchema.safeParse({
        ...DEFAULT_PROFILE_CATALOG,
        achievements: [
          ...DEFAULT_PROFILE_CATALOG.achievements,
          DEFAULT_PROFILE_CATALOG.achievements[0],
        ],
      }).success
    ).toBe(false);
    expect(profileCatalogSchema.safeParse({ ...DEFAULT_PROFILE_CATALOG, events: [] }).success).toBe(
      false
    );
  });
  it('calculates actual contrast instead of trusting user-picked colors', () => {
    expect(colorContrast('#000000', '#ffffff')).toBe(21);
    expect(colorContrast('#ffffff', '#ffffff')).toBe(1);
  });
  it('upgrades legacy flag/study values without losing colors, tags or music', () => {
    const legacy = {
      ...DEFAULT_PROFILE_PREFERENCES,
      flag: 'BR',
      studies: ['React'],
      tags: ['react'],
      nameStyle: { ...DEFAULT_PROFILE_PREFERENCES.nameStyle, color: '#ff0088' },
    };
    const parsed = parseProfilePreferences(legacy);
    expect(getSelectedProfileFlags(parsed)).toEqual(['BR']);
    expect(getProfileStudies(parsed)).toEqual([
      { subject: 'React', description: null, progress: null, status: 'studying' },
    ]);
    expect(parsed.nameStyle.color).toBe('#ff0088');
    expect(parsed.tags).toEqual(['react']);
  });
  it('validates three catalog flags, structured studies, colored tags and HTTPS links', () => {
    const preferences = {
      ...DEFAULT_PROFILE_PREFERENCES,
      flags: ['BR', 'br-sp', 'community-communist'],
      tags: ['React'],
      tagColors: { react: '#0083fe' },
      studyDetails: [
        {
          subject: 'Python',
          description: 'Desenvolvimento backend',
          progress: 65,
          status: 'studying',
        },
      ],
      socialLinks: [{ label: 'Meu site', url: 'https://example.com/' }],
    };
    const parsed = parseProfilePreferences(preferences);
    expect(parsed.flag).toBe('BR');
    expect(parsed.studies).toEqual(['Python']);
    expect(
      profilePreferencesSchema.safeParse({
        ...preferences,
        flags: ['BR', 'br-sp', 'br-rj', 'br-ac'],
      }).success
    ).toBe(false);
    expect(
      profilePreferencesSchema.safeParse({ ...preferences, flags: ['unknown-flag'] }).success
    ).toBe(false);
    expect(
      profilePreferencesSchema.safeParse({
        ...preferences,
        studyDetails: [{ subject: 'Python', progress: 101 }],
      }).success
    ).toBe(false);
    expect(
      profilePreferencesSchema.safeParse({
        ...preferences,
        socialLinks: [{ label: 'Fake', url: 'javascript:alert(1)' }],
      }).success
    ).toBe(false);
    expect(
      profilePreferencesSchema.safeParse({
        ...preferences,
        socialLinks: [{ label: 'Fake', url: 'https://user:pass@example.com' }],
      }).success
    ).toBe(false);
  });
  it('retains rich preferences when an older client edits other fields and prunes removed tag colors', () => {
    const current = parseProfilePreferences({
      ...DEFAULT_PROFILE_PREFERENCES,
      flag: 'BR',
      flags: ['BR', 'br-sp'],
      tags: ['react', 'python'],
      tagColors: { react: '#0083fe', python: '#ffffff' },
      studyDetails: [{ subject: 'React', description: 'UI', progress: 65, status: 'paused' }],
    });
    const legacy = {
      ...DEFAULT_PROFILE_PREFERENCES,
      flag: 'BR',
      tags: ['react'],
      studies: ['React'],
    };
    const normalized = normalizeProfilePreferenceAliases(legacy, current);
    expect(normalized.flags).toEqual(['BR', 'br-sp']);
    expect(normalized.studyDetails?.[0]).toMatchObject({ progress: 65, status: 'paused' });
    expect(normalized.tagColors).toEqual({ react: '#0083fe' });
    expect(
      normalizeProfilePreferenceAliases({ ...legacy, flag: 'US', studies: ['Python'] }, current)
    ).toMatchObject({
      flags: ['US'],
      studyDetails: [{ subject: 'Python', progress: null, status: 'studying' }],
    });
  });
  it('rejects invalid or forged personal info fields without accepting birthday overflow', () => {
    expect(
      profileBasicsSchema.safeParse({
        displayName: 'Pedro',
        birthday: '2000-02-29',
        github_username: 'pedro-tescaro',
      }).success
    ).toBe(true);
    expect(profileBasicsSchema.safeParse({ birthday: '2001-02-29' }).success).toBe(false);
    expect(profileBasicsSchema.safeParse({ displayName: '<script>', role: 'ADMIN' }).success).toBe(
      false
    );
    expect(
      profileBasicsSchema.safeParse({ github_username: 'https://github.com/pedro' }).success
    ).toBe(false);
  });
  it('keeps retained study details when an older client adds or removes subjects', () => {
    const current = parseProfilePreferences({
      ...DEFAULT_PROFILE_PREFERENCES,
      studyDetails: [
        { subject: 'React', description: 'UI', progress: 65, status: 'paused' },
        { subject: 'Rust', description: 'Sistemas', progress: 100, status: 'completed' },
      ],
    });
    const legacy = { ...structuredClone(current), studies: ['React', 'Python'] };
    expect(normalizeProfilePreferenceAliases(legacy, current).studyDetails).toEqual([
      { subject: 'React', description: 'UI', progress: 65, status: 'paused' },
      { subject: 'Python', description: null, progress: null, status: 'studying' },
    ]);
  });
  it('honors legacy-only changes after a complete modern GET roundtrip', () => {
    const current = parseProfilePreferences({
      ...DEFAULT_PROFILE_PREFERENCES,
      flags: ['BR', 'br-sp', 'rainbow'],
      studyDetails: [{ subject: 'React', description: 'UI', progress: 65, status: 'paused' }],
    });
    const oldApp = structuredClone(current);
    oldApp.flag = 'US';
    oldApp.studies = ['Python'];
    expect(normalizeProfilePreferenceAliases(oldApp, current)).toMatchObject({
      flag: 'US',
      flags: ['US'],
      studies: ['Python'],
      studyDetails: [{ subject: 'Python', description: null, progress: null, status: 'studying' }],
    });
    const cleared = structuredClone(current);
    cleared.flag = null;
    cleared.studies = [];
    expect(normalizeProfilePreferenceAliases(cleared, current)).toMatchObject({
      flag: null,
      flags: [],
      studies: [],
      studyDetails: [],
    });
    const modern = structuredClone(current);
    modern.flags = ['US', 'br-rj'];
    modern.studyDetails = [
      { subject: 'Rust', description: 'Sistemas', progress: 20, status: 'studying' },
    ];
    // The old aliases can remain stale while the modern editor updates richer fields.
    expect(normalizeProfilePreferenceAliases(modern, current)).toMatchObject({
      flag: 'US',
      flags: ['US', 'br-rj'],
      studies: ['Rust'],
      studyDetails: [{ subject: 'Rust', progress: 20 }],
    });
  });
});

describe('title instructions match enforced requirements', () => {
  const now = new Date('2026-10-31T18:00:00.000Z');
  const describeTitle = (id: string) =>
    getAchievementInstructions(
      DEFAULT_PROFILE_CATALOG.achievements.find((item) => item.id === id)!,
      DEFAULT_PROFILE_CATALOG.events,
      DEFAULT_PROFILE_CATALOG.achievements,
      now
    );
  it('uses the actual metric even if a title has a reference-inspired name or old custom copy', () => {
    const result = getAchievementInstructions({
      id: 'custom',
      name: 'Divindade',
      description: 'Convide amigos',
      howToObtain: 'Convide 250 pessoas.',
      requirement: { metric: 'followers', target: 100 },
    });
    expect(result.howToObtain).toContain('100 seguidores');
    expect(result.howToObtain).toContain('24 horas');
    expect(result.howToObtain).not.toContain('250');
  });
  it('states all real post and comment counting thresholds', () => {
    const posts = describeTitle('posts-10').howToObtain;
    expect(posts).toContain('10 postagens');
    expect(posts).toContain('4 caracteres');
    expect(posts).toContain('40');
    expect(posts).toContain('repetidos');
    expect(posts).toContain('5 por dia (UTC)');
    const comments = describeTitle('comments-5').howToObtain;
    expect(comments).toContain('5 comentários');
    expect(comments).toContain('12 caracteres');
    expect(comments).toContain('outros membros');
    expect(comments).toContain('si mesmo não contam');
  });
  it('describes Muuuu as a historical comment rule rather than a login', () => {
    const result = describeTitle('first-of-month');
    expect(result.howToObtain).toContain('dia 1 de qualquer mês');
    expect(result.howToObtain).toContain('12 caracteres');
    expect(result.howToObtain).toContain('America/Sao_Paulo');
    expect(result.howToObtain).toContain('meses anteriores');
    expect(result.howToObtain).not.toMatch(/Entre no|login/i);
    expect(result.isUnavailable).toBe(false);
  });
  it('uses exact evergreen hashtags and real event dates for the themed titles', () => {
    expect(describeTitle('estrela').howToObtain).toContain('hashtag exata #estrela');
    expect(describeTitle('pastel').howToObtain).toContain('hashtag exata #pastel');
    const pumpkin = describeTitle('abobora');
    expect(pumpkin.howToObtain).toContain('#Halloween');
    expect(pumpkin.howToObtain).toContain('25/10/2026');
    expect(pumpkin.howToObtain).toContain('01/11/2026');
    expect(pumpkin.isUnavailable).toBe(false);
  });
  it('lists complete-event targets explicitly and respects the exclusive end', () => {
    const result = describeTitle('halloween-legend');
    expect(result.howToObtain).toContain('1 postagem(ns)');
    expect(result.howToObtain).toContain('5 publicação(ões)');
    expect(result.howToObtain).not.toContain('todos os desafios');
    const event = DEFAULT_PROFILE_CATALOG.events[0];
    expect(
      getAchievementInstructions(
        DEFAULT_PROFILE_CATALOG.achievements.find((item) => item.id === 'abobora')!,
        [event],
        DEFAULT_PROFILE_CATALOG.achievements,
        new Date(event.endsAt)
      ).isUnavailable
    ).toBe(true);
  });
  it('rejects unconfigured hashtag goals and never invents a fallback unlock condition', () => {
    const catalog = structuredClone(DEFAULT_PROFILE_CATALOG);
    delete catalog.achievements.find((item) => item.id === 'pastel')!.requirement.hashtag;
    expect(profileCatalogSchema.safeParse(catalog).success).toBe(false);
    expect(
      getAchievementInstructions({
        id: 'unknown',
        name: 'Oficial',
        requirement: { metric: 'unrecognized', target: 1 },
      }).isUnavailable
    ).toBe(true);
  });
});
