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

/** Portuguese and English names, used by the emoji picker's search and preview. */
export const EMOJI_NAMES: Record<string, [string, string]> = {
  '😀': ['sorriso', 'grinning face'],
  '😂': ['chorando de rir', 'tears of joy'],
  '🔥': ['fogo', 'fire'],
  '👍': ['joinha', 'thumbs up'],
  '❤️': ['coração', 'red heart'],
  '🎉': ['festa', 'party popper'],
  '💡': ['ideia', 'light bulb'],
  '🚀': ['foguete', 'rocket'],
  '👀': ['olhos', 'eyes'],
  '✅': ['feito', 'check mark'],
  '🙏': ['por favor obrigado', 'folded hands'],
  '💯': ['cem', 'hundred points'],
  '💻': ['notebook', 'laptop'],
  '🐛': ['bug inseto', 'bug'],
  '⚡': ['raio rápido', 'high voltage'],
  '🔧': ['chave inglesa', 'wrench'],
  '📦': ['pacote', 'package'],
  '🧪': ['teste', 'test tube'],
  '☕': ['café', 'coffee'],
  '🦀': ['caranguejo rust', 'crab rust'],
  '🐍': ['cobra python', 'snake python'],
  '⚙️': ['engrenagem', 'gear'],
  '📝': ['nota', 'memo'],
  '🔍': ['lupa busca', 'magnifying glass'],
  '👏': ['palmas', 'clapping hands'],
  '🙌': ['mãos para cima', 'raising hands'],
  '💪': ['força', 'flexed biceps'],
  '🤔': ['pensando', 'thinking face'],
  '😅': ['sorriso suado', 'grinning sweat'],
  '😎': ['óculos escuros', 'sunglasses'],
  '🫡': ['continência', 'saluting face'],
  '👋': ['tchau oi', 'waving hand'],
  '🎯': ['alvo', 'direct hit'],
  '📌': ['tachinha', 'pushpin'],
  '🤝': ['aperto de mão', 'handshake'],
  '✨': ['brilhos', 'sparkles'],
};

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

const REPLY_AUDIENCE_MARKER =
  /(?:^|\n{2,})🔒 Apenas (seguidores|pessoas mencionadas) podem responder\s*$/;

/** Reads who may reply from the trailing composer marker (no marker means everyone). */
export function readReplyAudience(body: string): ReplyAudience {
  const match = body.trim().match(REPLY_AUDIENCE_MARKER);
  if (!match) return 'everyone';
  return match[1] === 'seguidores' ? 'followers' : 'mentioned';
}

/** Rewrites the trailing reply-audience marker, keeping the rest of the body as is. */
export function withReplyAudience(body: string, audience: ReplyAudience) {
  const withoutMarker = body.trim().replace(REPLY_AUDIENCE_MARKER, '').trimEnd();
  return appendPostExtras(withoutMarker, { replyAudience: audience });
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
