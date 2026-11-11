const APP_TIME_ZONE = 'America/Sao_Paulo';

export type DateInput = string | number | Date;

function toDate(value: DateInput): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

export type DateLanguage = 'pt' | 'en';

export function formatAbsoluteDate(dateValue: DateInput, language: DateLanguage = 'pt'): string {
  return toDate(dateValue).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
    timeZone: APP_TIME_ZONE,
  });
}

function pluralizeEnglish(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
}

export function formatRelativeTime(
  dateValue: DateInput,
  referenceDate: DateInput = new Date(),
  language: DateLanguage = 'pt'
): string {
  const date = toDate(dateValue);
  const now = toDate(referenceDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (language === 'en') {
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return pluralizeEnglish(diffMins, 'minute');
    if (diffHours < 24) return pluralizeEnglish(diffHours, 'hour');
    if (diffDays < 30) return pluralizeEnglish(diffDays, 'day');
    return formatAbsoluteDate(date, language);
  }

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 30) return `${diffDays}d atrás`;
  return formatAbsoluteDate(date);
}
