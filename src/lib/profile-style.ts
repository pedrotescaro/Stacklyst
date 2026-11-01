import type { CSSProperties } from 'react';
import type { ProfilePreferences, PrivateChatPreferences } from '@/lib/profile-customization';
import { isProfileFlagId } from '@/lib/profile-flags';
import { normalizeProfileTitleName } from '@/lib/profile-customization';

const validColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
export function contrastRatio(first: string, second: string) {
  const luminance = (color: string) => {
    const rgb = [1, 3, 5]
      .map((index) => parseInt(color.slice(index, index + 2), 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function foregroundOn(background: string) {
  return contrastRatio('#ffffff', background) >= contrastRatio('#111827', background)
    ? '#ffffff'
    : '#111827';
}
export function readableColor(color: string, background: string) {
  if (contrastRatio(color, background) >= 4.5) return color;
  const target = foregroundOn(background);
  for (let step = 1; step <= 20; step++) {
    const mix = (index: number) =>
      Math.round(
        parseInt(color.slice(index, index + 2), 16) * (1 - step / 20) +
          (parseInt(target.slice(index, index + 2), 16) * step) / 20
      )
        .toString(16)
        .padStart(2, '0');
    const adjusted = `#${mix(1)}${mix(3)}${mix(5)}`;
    if (contrastRatio(adjusted, background) >= 4.5) return adjusted;
  }
  return target;
}
export interface ProfileIdentityStyle {
  nameStyle?: { color?: string | null; bold?: boolean; italic?: boolean; underline?: boolean };
  frame?: { id: string; decoration: string; color: string } | null;
  flag?: string | null;
  flags?: string[];
  title?: { id: string; name: string; color: string; rarity: string; icon?: string } | null;
}

export function getAuthorDisplayName(
  author?: {
    name?: string | null;
    username: string;
    avatar_config?: unknown;
  } | null
): string {
  if (!author) return '';
  const raw = author.avatar_config;
  let config: Record<string, unknown> | null = null;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    config = raw as Record<string, unknown>;
  } else if (typeof raw === 'string') {
    try {
      config = JSON.parse(raw);
    } catch {
      config = null;
    }
  }
  const configName =
    typeof config?.displayName === 'string' && config.displayName.trim()
      ? config.displayName.trim()
      : typeof config?.name === 'string' && config.name.trim()
        ? config.name.trim()
        : null;
  return author.name?.trim() || configName || author.username;
}

export function readProfileIdentity(config: unknown): ProfileIdentityStyle {
  let parsed = config;
  if (typeof config === 'string') {
    try {
      parsed = JSON.parse(config);
    } catch {
      parsed = null;
    }
  }
  const rawObj =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  if (!rawObj) return {};

  const profileStyle =
    rawObj.profileStyle &&
    typeof rawObj.profileStyle === 'object' &&
    !Array.isArray(rawObj.profileStyle)
      ? (rawObj.profileStyle as Record<string, unknown>)
      : {};
  const value = { ...rawObj, ...profileStyle } as Record<string, unknown>;
  const nameStyle = (
    value.nameStyle && typeof value.nameStyle === 'object' ? value.nameStyle : {}
  ) as Record<string, unknown>;
  const frame = (value.frame && typeof value.frame === 'object' ? value.frame : null) as Record<
    string,
    unknown
  > | null;
  const flagCandidate =
    typeof value.flag === 'string'
      ? value.flag
      : typeof rawObj.flag === 'string'
        ? rawObj.flag
        : null;
  const flagsCandidate = Array.isArray(value.flags)
    ? value.flags
    : Array.isArray(rawObj.flags)
      ? rawObj.flags
      : null;
  const titleCandidate = (
    value.title && typeof value.title === 'object'
      ? value.title
      : rawObj.title && typeof rawObj.title === 'object'
        ? rawObj.title
        : null
  ) as Record<string, unknown> | null;

  return {
    nameStyle: {
      color: validColor(nameStyle.color) ? nameStyle.color : null,
      bold: nameStyle.bold === true,
      italic: nameStyle.italic === true,
      underline: nameStyle.underline === true,
    },
    frame:
      frame &&
      validColor(frame.color) &&
      typeof frame.decoration === 'string' &&
      /^[a-z-]+$/.test(frame.decoration)
        ? { id: String(frame.id || 'frame'), decoration: frame.decoration, color: frame.color }
        : null,
    flag: flagCandidate && isProfileFlagId(flagCandidate) ? flagCandidate : null,
    flags: Array.isArray(flagsCandidate)
      ? flagsCandidate
          .filter((flag): flag is string => typeof flag === 'string' && isProfileFlagId(flag))
          .slice(0, 3)
      : flagCandidate && isProfileFlagId(flagCandidate)
        ? [flagCandidate]
        : [],
    title:
      titleCandidate && typeof titleCandidate.name === 'string' && titleCandidate.name.length <= 60
        ? {
            id: typeof titleCandidate.id === 'string' ? titleCandidate.id : 'title',
            name: normalizeProfileTitleName(
              typeof titleCandidate.id === 'string' ? titleCandidate.id : 'title',
              titleCandidate.name
            ),
            color: validColor(titleCandidate.color) ? titleCandidate.color : '#0083fe',
            rarity: typeof titleCandidate.rarity === 'string' ? titleCandidate.rarity : 'common',
            icon: typeof titleCandidate.icon === 'string' ? titleCandidate.icon : undefined,
          }
        : null,
  };
}

export function profileAppearanceStyle(preferences: ProfilePreferences): CSSProperties {
  const colors = preferences.appearance;
  const variables: Record<string, string> = {};
  const background = colors.backgroundColor;
  if (background) {
    variables['--color-dd-bg'] = background;
    variables['--color-dd-text'] = foregroundOn(background);
    variables['--color-dd-muted'] = readableColor(colors.secondaryColor || '#94a3b8', background);
    variables['--color-dd-sidebar-bg'] = colors.cardColor || background;
    variables['--color-dd-card'] = background;
    variables['--color-dd-surface'] = background;
    variables['--color-dd-search-bg'] = background;
  }
  if (colors.cardColor) {
    variables['--color-dd-card'] = colors.cardColor;
    variables['--color-dd-surface'] = colors.cardColor;
    variables['--color-dd-search-bg'] = colors.cardColor;
    variables['--profile-card-text'] = foregroundOn(colors.cardColor);
    variables['--profile-card-muted'] = readableColor(
      colors.secondaryColor || '#94a3b8',
      colors.cardColor
    );
  }
  if (colors.borderColor) variables['--color-dd-border'] = colors.borderColor;
  if (colors.accentColor) variables['--color-dd-accent'] = colors.accentColor;
  if (colors.secondaryColor) {
    variables['--profile-secondary-light'] = readableColor(colors.secondaryColor, '#ffffff');
    variables['--profile-secondary-dark'] = readableColor(colors.secondaryColor, '#000000');
  }
  if (colors.buttonColor) {
    variables['--profile-button'] = colors.buttonColor;
    variables['--profile-button-text'] = foregroundOn(colors.buttonColor);
  }
  return variables as CSSProperties;
}

export function privateChatStyle(chat: PrivateChatPreferences): CSSProperties {
  const background =
    chat.mode === 'dark' ? '#08090b' : chat.mode === 'custom' ? chat.backgroundColor : null;
  const vars: Record<string, string> = {};
  if (background) {
    vars['--color-dd-bg'] = background;
    vars['--color-dd-text'] = foregroundOn(background);
    vars['--color-dd-muted'] = readableColor('#94a3b8', background);
    vars['--color-dd-surface'] = background;
  }
  if (chat.mode !== 'default' && chat.bubbleColor) {
    vars['--chat-bubble'] = chat.bubbleColor;
    vars['--chat-bubble-text'] = foregroundOn(chat.bubbleColor);
  }
  if (chat.mode !== 'default' && chat.accentColor) {
    vars['--chat-accent'] = chat.accentColor;
    vars['--chat-accent-text'] = foregroundOn(chat.accentColor);
  }
  return vars as CSSProperties;
}
