export type ReplyAudience = 'everyone' | 'followers' | 'mentioned';

export const REPLY_AUDIENCE_OPTIONS: {
  value: ReplyAudience;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
}[] = [
  {
    value: 'everyone',
    label: 'Qualquer pessoa pode responder',
    labelEn: 'Anyone can reply',
    description: 'Todos os devs podem comentar',
    descriptionEn: 'Every dev can comment',
  },
  {
    value: 'followers',
    label: 'Apenas seguidores',
    labelEn: 'Followers only',
    description: 'Somente quem você segue',
    descriptionEn: 'Only people you follow',
  },
  {
    value: 'mentioned',
    label: 'Pessoas que você mencionar',
    labelEn: 'People you mention',
    description: 'Apenas @mencionados no post',
    descriptionEn: 'Only people @mentioned in the post',
  },
];

export const EMOJI_CATEGORIES = [
  {
    name: 'Frequentes',
    nameEn: 'Frequent',
    emojis: ['😀', '😂', '🔥', '👍', '❤️', '🎉', '💡', '🚀', '👀', '✅', '🙏', '💯'],
  },
  {
    name: 'Dev',
    nameEn: 'Dev',
    emojis: ['💻', '🐛', '⚡', '🔧', '📦', '🧪', '☕', '🦀', '🐍', '⚙️', '📝', '🔍'],
  },
  {
    name: 'Gestos',
    nameEn: 'Gestures',
    emojis: ['👏', '🙌', '💪', '🤔', '😅', '😎', '🫡', '👋', '🎯', '📌', '🤝', '✨'],
  },
];

export const QUICK_LOCATIONS = [
  'Remoto',
  'São Paulo, BR',
  'Rio de Janeiro, BR',
  'Lisboa, PT',
  'Stacklyst Community',
];

export function insertAtCursor(
  textarea: HTMLTextAreaElement | HTMLInputElement | null,
  text: string,
  currentValue: string,
  setValue: (value: string) => void
) {
  if (!textarea) {
    setValue(currentValue + text);
    return;
  }

  const start = textarea.selectionStart ?? currentValue.length;
  const end = textarea.selectionEnd ?? currentValue.length;
  const nextValue = currentValue.slice(0, start) + text + currentValue.slice(end);
  setValue(nextValue);

  requestAnimationFrame(() => {
    textarea.focus();
    const cursor = start + text.length;
    textarea.setSelectionRange(cursor, cursor);
  });
}

export function insertAtEditor(
  editor: { insertText: (text: string) => void; focus: () => void } | null,
  text: string,
  currentValue: string,
  setValue: (value: string) => void
) {
  if (!editor) {
    setValue(currentValue + text);
    return;
  }

  editor.insertText(text);
  editor.focus();
}

export function appendPostExtras(
  body: string,
  extras: {
    location?: string;
    scheduledAt?: string | null;
    replyAudience?: ReplyAudience;
    isSensitive?: boolean;
  }
) {
  let finalBody = body.trim();

  if (extras.isSensitive) {
    finalBody = `⚠️ Conteúdo sensível\n\n${finalBody}`;
  }

  if (extras.location?.trim()) {
    finalBody += `\n\n📍 ${extras.location.trim()}`;
  }

  if (extras.scheduledAt) {
    const date = new Date(extras.scheduledAt);
    if (!Number.isNaN(date.getTime())) {
      finalBody += `\n\n📅 Publicação planejada para ${date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })}`;
    }
  }

  if (extras.replyAudience && extras.replyAudience !== 'everyone') {
    const label =
      extras.replyAudience === 'followers'
        ? 'Apenas seguidores podem responder'
        : 'Apenas pessoas mencionadas podem responder';
    finalBody += `\n\n🔒 ${label}`;
  }

  return finalBody;
}

export interface ParsedPostExtras {
  content: string;
  isSensitive: boolean;
  location: string | null;
}

const SENSITIVE_POST_MARKER = '⚠️ Conteúdo sensível';
const LOCATION_POST_MARKER = /^📍\s+(.+)$/;
const TRAILING_POST_METADATA =
  /^(?:📅 Publicação planejada para|🔒 Apenas (?:seguidores|pessoas mencionadas))/;

/**
 * Separates the legacy composer markers from the visible post copy.
 * Posts already published keep working without a database migration.
 */
export function parsePostExtras(body: string): ParsedPostExtras {
  const blocks = body.trim().split(/\n{2,}/);
  let isSensitive = false;
  let location: string | null = null;

  if (blocks[0]?.trim().replace('\ufe0f', '') === SENSITIVE_POST_MARKER.replace('\ufe0f', '')) {
    blocks.shift();
    isSensitive = true;
  }

  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index].trim();
    const locationMatch = block.match(LOCATION_POST_MARKER);

    if (locationMatch) {
      location = locationMatch[1].trim();
      blocks.splice(index, 1);
      break;
    }

    if (!TRAILING_POST_METADATA.test(block)) {
      break;
    }
  }

  return {
    content: blocks.join('\n\n').trim(),
    isSensitive,
    location,
  };
}

export function resetPostComposerExtras() {
  return {
    replyAudience: 'everyone' as ReplyAudience,
    scheduledAt: null as string | null,
    location: '',
    isSensitive: false,
  };
}
