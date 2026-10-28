import { getAuthorDisplayName, readProfileIdentity } from '@/lib/profile-style';

const identifier = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-z0-9_-]{1,100}$/i.test(value);

/** Expose only the fields used to render a public identity in the leaderboard. */
export function getLeaderboardAvatarConfig(config: unknown) {
  const identity = readProfileIdentity(config);
  const rawFrame = identity.frame;
  const frame =
    rawFrame && identifier(rawFrame.id) && identifier(rawFrame.decoration)
      ? { id: rawFrame.id, decoration: rawFrame.decoration, color: rawFrame.color }
      : null;
  const rawTitle = identity.title;
  const title =
    rawTitle && identifier(rawTitle.id) && identifier(rawTitle.rarity)
      ? {
          id: rawTitle.id,
          name: rawTitle.name,
          color: rawTitle.color,
          rarity: rawTitle.rarity,
          ...(identifier(rawTitle.icon) ? { icon: rawTitle.icon } : {}),
        }
      : null;
  const displayName = getAuthorDisplayName({ username: '', avatar_config: config });
  const safeDisplayName = displayName && displayName.length <= 50 ? displayName : undefined;
  const style = identity.nameStyle;
  const nameStyle =
    style && (style.color || style.bold || style.italic || style.underline)
      ? { color: style.color, bold: style.bold, italic: style.italic, underline: style.underline }
      : undefined;
  const flags = identity.flags || [];
  if (!frame && !title && !safeDisplayName && !nameStyle && !flags.length) return null;
  return {
    ...(safeDisplayName ? { displayName: safeDisplayName } : {}),
    profileStyle: {
      ...(frame ? { frame } : {}),
      ...(title ? { title } : {}),
      ...(nameStyle ? { nameStyle } : {}),
      ...(flags.length ? { flags } : {}),
    },
  };
}
