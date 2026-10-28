import type { CSSProperties } from 'react';
import type { ProfilePreferences, PrivateChatPreferences } from '@/lib/profile-customization';
import { isProfileFlagId } from '@/lib/profile-flags';

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
export function readProfileIdentity(config: unknown): ProfileIdentityStyle {
  const value = (
    config && typeof config === 'object' ? (config as Record<string, unknown>).profileStyle : null
  ) as ProfileIdentityStyle | null;
  if (!value || typeof value !== 'object') return {};
  return {
    nameStyle: {
      color: validColor(value.nameStyle?.color) ? value.nameStyle.color : null,
      bold: value.nameStyle?.bold === true,
      italic: value.nameStyle?.italic === true,
      underline: value.nameStyle?.underline === true,
    },
    frame:
      value.frame && validColor(value.frame.color) && /^[a-z-]+$/.test(value.frame.decoration)
        ? value.frame
        : null,
    flag: typeof value.flag === 'string' && isProfileFlagId(value.flag) ? value.flag : null,
    flags: Array.isArray(value.flags)
      ? value.flags
          .filter((flag): flag is string => typeof flag === 'string' && isProfileFlagId(flag))
          .slice(0, 3)
      : typeof value.flag === 'string' && isProfileFlagId(value.flag)
        ? [value.flag]
        : [],
    title:
      value.title &&
      typeof value.title.name === 'string' &&
      value.title.name.length <= 60 &&
      validColor(value.title.color)
        ? value.title
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
