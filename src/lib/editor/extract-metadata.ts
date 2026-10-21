import { Language } from '@prisma/client';
import { editorLanguageToPrisma } from '@/lib/editor/languages';

export interface PostContentMetadata {
  language: Language | null;
  code: string | null;
  isQuestion: boolean;
}

export function extractPostMetadata(body: string): PostContentMetadata {
  // Markdown fences may grow to contain literal backticks in the code itself.
  const opening = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)\r?\n/gm;
  let match: RegExpExecArray | null;
  let code: string | null = null;
  let info = '';
  while ((match = opening.exec(body))) {
    const fence = match[1];
    if (fence[0] === '`' && match[2].includes('`')) continue;
    const rest = body.slice(opening.lastIndex);
    const closing = new RegExp(
      '^ {0,3}' + fence[0] + '{' + fence.length + ',}[ \\t]*\\r?$',
      'm'
    ).exec(rest);
    if (!closing) continue;
    code = rest.slice(0, closing.index).replace(/\r?\n$/, '') || null;
    info = match[2].trim().split(/\s+/)[0];
    break;
  }
  if (!match) {
    return { language: null, code: null, isQuestion: false };
  }

  let rawLang = info || 'typescript';
  if (rawLang.endsWith('-static')) {
    rawLang = rawLang.slice(0, -7);
  }

  const language = editorLanguageToPrisma(rawLang);

  return {
    language,
    code,
    isQuestion: Boolean(language),
  };
}
