import type { Palette } from '../theme';

export interface ProfileAppearance {
  backgroundColor: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
  cardColor: string | null;
  borderColor: string | null;
  buttonColor: string | null;
}
export interface ProfilePreferences {
  appearance: ProfileAppearance;
  nameStyle: { color: string | null; bold: boolean; italic: boolean; underline: boolean };
  banner: {
    mode: 'default' | 'color' | 'gradient' | 'image';
    color: string;
    secondaryColor: string;
    imageUrl: string | null;
    positionX: number;
    positionY: number;
  };
  flag: string | null;
  frameId: string;
  tags: string[];
  studies: string[];
  music: null | {
    trackId: string;
    title: string | null;
    artist: string | null;
    artworkUrl: string | null;
  };
  equippedTitleId: string | null;
  featuredAchievementIds: string[];
}
export interface ChatPreferences {
  mode: 'default' | 'dark' | 'custom';
  bubbleColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
}
export interface ProfileAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  color: string;
  requirement: { metric: string; target: number; eventId?: string };
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}
export interface ProfileFrame {
  id: string;
  name: string;
  color: string;
  decoration: string;
  achievementId?: string;
}
export interface ProfileCustomizationData {
  avatarUrl: string | null;
  preferences: ProfilePreferences;
  chat: ChatPreferences;
  version: number;
  catalog: {
    frames: ProfileFrame[];
    achievements: ProfileAchievement[];
    events: { id: string; name: string; startsAt?: string; endsAt?: string }[];
  };
  achievements: ProfileAchievement[];
  newUnlocks: string[];
}
export interface PublicCustomization {
  preferences: ProfilePreferences;
  achievements: PublicProfileAchievement[];
}
export type PublicProfileAchievement = Pick<
  ProfileAchievement,
  'id' | 'name' | 'description' | 'color'
>;

export const defaultProfilePreferences: ProfilePreferences = {
  appearance: {
    backgroundColor: null,
    accentColor: null,
    secondaryColor: null,
    cardColor: null,
    borderColor: null,
    buttonColor: null,
  },
  nameStyle: { color: null, bold: false, italic: false, underline: false },
  banner: {
    mode: 'default',
    color: '#0083fe',
    secondaryColor: '#8b5cf6',
    imageUrl: null,
    positionX: 50,
    positionY: 50,
  },
  flag: null,
  frameId: 'none',
  tags: [],
  studies: [],
  music: null,
  equippedTitleId: null,
  featuredAchievementIds: [],
};
export const defaultChatPreferences: ChatPreferences = {
  mode: 'default',
  bubbleColor: null,
  accentColor: null,
  backgroundColor: null,
};
export const colorChoices = [
  '#0083FE',
  '#5AB6FF',
  '#BA8CFF',
  '#ED75B3',
  '#55CFA1',
  '#FF9A75',
  '#F7CC62',
  '#F4F6F8',
  '#0F1419',
];
export const countryCodes =
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(
    ' '
  );

export function luminance(color: string) {
  const values = color
    .replace('#', '')
    .match(/.{2}/g)
    ?.map((value) => Number.parseInt(value, 16) / 255) ?? [0, 0, 0];
  return values.reduce(
    (sum, value, index) =>
      sum +
      (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) *
        [0.2126, 0.7152, 0.0722][index],
    0
  );
}
export function contrast(first: string, second: string) {
  const [a, b] = [luminance(first), luminance(second)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}
export function colorInk(background: string) {
  return contrast('#ffffff', background) >= contrast('#111111', background) ? '#ffffff' : '#111111';
}
export function readableColor(
  color: string | null | undefined,
  background: string,
  fallback: string
) {
  return color && /^#[\da-f]{6}$/i.test(color) && contrast(color, background) >= 4.5
    ? color
    : fallback;
}
export function profilePalette(
  base: Palette,
  appearance?: Partial<ProfileAppearance> | null
): Palette {
  if (!appearance || Object.values(appearance).every((value) => value === null)) return base;
  const color = (value: string | null | undefined, fallback: string) =>
    value && /^#[\da-f]{6}$/i.test(value) ? value : fallback;
  const background = color(appearance.backgroundColor, base.background);
  const surface = color(appearance.cardColor, base.surface);
  const text = colorInk(background);
  const primary = color(appearance.buttonColor, color(appearance.accentColor, base.primary));
  return {
    ...base,
    background,
    surface: contrast(text, surface) >= 4.5 ? surface : background,
    elevated: contrast(text, surface) >= 4.5 ? surface : background,
    border: color(appearance.borderColor, base.border),
    text,
    muted: readableColor(appearance.secondaryColor, background, text),
    primary,
    onPrimary: colorInk(primary),
  };
}
export function chatPalette(base: Palette, preferences?: ChatPreferences): Palette {
  if (!preferences || preferences.mode === 'default') return base;
  const background =
    preferences.mode === 'dark' ? '#000000' : preferences.backgroundColor || base.background;
  const text = colorInk(background);
  const darkText = text === '#111111';
  const primary = readableColor(
    preferences.accentColor,
    background,
    darkText ? '#0062A8' : '#5AB6FF'
  );
  const surface = darkText ? '#F5F7FA' : '#202327';
  return {
    ...base,
    background,
    text,
    muted: readableColor(base.muted, background, text),
    surface,
    elevated: surface,
    composer: surface,
    incomingMessage: surface,
    border: darkText ? '#B6C1CC' : '#59616D',
    socialBorder: darkText ? '#B6C1CC' : '#59616D',
    primary,
    onPrimary: colorInk(primary),
    ownMessage: preferences.bubbleColor || base.ownMessage,
  };
}
export function countryName(code: string, locale = 'pt-BR') {
  if (code === 'dev') return 'Desenvolvimento';
  if (code === 'rainbow') return 'Diversidade';
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}
