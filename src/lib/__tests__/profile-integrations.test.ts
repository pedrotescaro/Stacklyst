import { afterEach, describe, expect, it, vi } from 'vitest';
import { isOwnedProfileUpload } from '../profile-upload';
import {
  contrastRatio,
  foregroundOn,
  privateChatStyle,
  profileAppearanceStyle,
  readableColor,
  readProfileIdentity,
} from '../profile-style';
import { DEFAULT_PROFILE_PREFERENCES } from '../profile-customization';

afterEach(() => vi.unstubAllEnvs());
describe('profile upload ownership', () => {
  const image =
    'https://app.supabase.co/storage/v1/object/public/uploads/user-1/01234567-89ab-cdef-0123-456789abcdef.jpg';
  it('accepts only an image uploaded for this account in the configured storage', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://app.supabase.co');
    expect(isOwnedProfileUpload(image, 'user-1')).toBe(true);
    for (const invalid of [
      image.replace('user-1', 'other'),
      image.replace('app.supabase.co', 'evil.example'),
      image + '?x=1',
      image.replace('.jpg', '.svg'),
      image.replace('https:', 'http:'),
      image.replace('/user-1/', '/user-1/../other/'),
      null,
    ]) {
      expect(isOwnedProfileUpload(invalid, 'user-1')).toBe(false);
    }
  });
});
describe('scoped profile and chat appearance', () => {
  it('keeps foreground readable across bright and dark custom backgrounds', () => {
    for (const background of ['#0083fe', '#ffffff', '#101112', '#ff9b00', '#6688aa']) {
      expect(contrastRatio(foregroundOn(background), background)).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(readableColor('#0083fe', background), background)
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('uses local variables without mutating shared defaults and resets default chat', () => {
    const preferences = structuredClone(DEFAULT_PROFILE_PREFERENCES);
    preferences.appearance.backgroundColor = '#ffffff';
    expect(profileAppearanceStyle(preferences)).toMatchObject({
      '--color-dd-bg': '#ffffff',
      '--color-dd-text': '#111827',
    });
    expect(DEFAULT_PROFILE_PREFERENCES.appearance.backgroundColor).toBeNull();
    expect(
      privateChatStyle({
        mode: 'default',
        bubbleColor: '#ffffff',
        accentColor: '#000000',
        backgroundColor: '#ffffff',
      })
    ).toEqual({});
    expect(
      privateChatStyle({
        mode: 'custom',
        bubbleColor: '#ffffff',
        accentColor: '#000000',
        backgroundColor: '#ffffff',
      })
    ).toMatchObject({ '--chat-bubble-text': '#111827', '--chat-accent-text': '#ffffff' });
  });
  it('discards unsafe identity style values in legacy JSON', () => {
    expect(
      readProfileIdentity({
        profileStyle: {
          nameStyle: { color: 'url(evil)' },
          frame: { color: 'red', decoration: 'hack' },
          flag: '<svg>',
          title: { color: 'url(evil)', name: 'Fake' },
        },
      })
    ).toMatchObject({ nameStyle: { color: null }, frame: null, flag: null, title: null });
  });
});
