export function formatEventDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatEventDuration(start: string, end: string, english = false) {
  const minutes = Math.max(
    0,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  );
  if (minutes >= 1440 && minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} ${english ? (days === 1 ? 'day' : 'days') : days === 1 ? 'dia' : 'dias'}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [hours ? `${hours}h` : '', remainder || !hours ? `${remainder}min` : '']
    .filter(Boolean)
    .join(' ');
}
