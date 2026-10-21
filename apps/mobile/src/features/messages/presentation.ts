type Timestamped = { created_at: string };

/** A calendar boundary always starts a group, even when messages are close together. */
export function startsMessageGroup(current: Timestamped, previous?: Timestamped) {
  if (!previous) return true;
  const now = new Date(current.created_at);
  const before = new Date(previous.created_at);
  return (
    now.toDateString() !== before.toDateString() ||
    now.getTime() - before.getTime() >= 30 * 60 * 1000
  );
}

export function conversationTime(timestamp: string, now = new Date()) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return '';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const label =
    date.toDateString() === now.toDateString()
      ? 'Hoje'
      : date.toDateString() === yesterday.toDateString()
        ? 'Ontem'
        : date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' as const } : {}),
          });
  return label + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
