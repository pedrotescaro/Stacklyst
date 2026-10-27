import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROFILE_PREFERENCES,
  DEFAULT_PROFILE_CATALOG,
  profilePreferencesSchema,
  profileCatalogSchema,
  colorContrast,
  getProfileFlags,
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
});
