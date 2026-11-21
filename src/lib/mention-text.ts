/** Usernames are ASCII, case-insensitive and may contain a hyphen. */
export const mentionPattern = /(?<![\p{L}\p{N}_@.-])@([A-Za-z0-9_-]{2,30})(?![\w-])/gu;

export function mentionedUsernames(text: string) {
  return [...new Set(Array.from(text.matchAll(mentionPattern), (match) => match[1].toLowerCase()))];
}

export function activeMention(text: string, cursor: number) {
  const before = text.slice(0, cursor);
  const match = /(?<![\p{L}\p{N}_@.-])@([A-Za-z0-9_-]{0,30})$/u.exec(before);
  if (!match) return null;
  const suffix = /^[\w-]*/.exec(text.slice(cursor))![0];
  return { from: match.index, to: cursor + suffix.length, query: match[1] };
}
