// @vitest-environment node
import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  getProfileFlagCatalog,
  isProfileFlagId,
  PROFILE_BRAZIL_STATES,
  PROFILE_FLAG_IDS,
} from '../profile-flags';

describe('curated profile flags', () => {
  it('includes every Brazilian state, pride variants and optional community symbols', () => {
    const catalog = getProfileFlagCatalog();
    expect(PROFILE_BRAZIL_STATES).toHaveLength(27);
    expect(catalog.filter((flag) => flag.category === 'brazil')).toHaveLength(27);
    expect(catalog.filter((flag) => flag.category === 'pride')).toHaveLength(14);
    expect(new Set(catalog.map((flag) => flag.id)).size).toBe(catalog.length);
    expect(catalog.find((flag) => flag.id === 'br-sp')?.label).toBe('São Paulo');
    expect(catalog.find((flag) => flag.id === 'community-communist')).toMatchObject({
      label: 'Comunista',
      category: 'community',
    });
    expect(catalog.every((flag) => flag.description.length > 10 && flag.id.length <= 32)).toBe(
      true
    );
  });
  it('validates only explicit catalog IDs and preserves country and old choices', () => {
    for (const id of ['BR', 'US', 'dev', 'rainbow', 'br-df', 'pride-trans', 'community-communist'])
      expect(isProfileFlagId(id)).toBe(true);
    for (const id of ['br', 'BR-SP', '../../evil', '<svg>', null, 'pride-made-up'])
      expect(isProfileFlagId(id)).toBe(false);
    expect(PROFILE_FLAG_IDS.length).toBe(getProfileFlagCatalog().length);
    expect(getProfileFlagCatalog('en').find((flag) => flag.id === 'BR')?.label).toBe('Brazil');
  });
  it('ships safe local SVG assets for every catalog choice', () => {
    for (const flag of getProfileFlagCatalog()) {
      const file = `public${flag.imageUrl}`;
      expect(existsSync(file), file).toBe(true);
      const svg = readFileSync(file, 'utf8');
      expect(svg).toContain('<svg');
      expect(svg).not.toMatch(
        /<(?:script|foreignObject|iframe)\b|\son\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|data:|\/\/)/i
      );
    }
    const sources = JSON.parse(readFileSync('public/flags/profile/brazil-sources.json', 'utf8'));
    expect(sources.files).toHaveLength(27);
    expect(readFileSync('public/flags/profile/BRAZIL-LICENSE.txt', 'utf8')).toContain(
      'MIT License'
    );
  });
});
