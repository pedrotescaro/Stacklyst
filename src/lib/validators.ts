import { z } from 'zod';
import { Language } from '@prisma/client';

function isPrivateIpOrHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.local') || lower.endsWith('.internal')) {
    return true;
  }
  // IPv4 check
  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(lower);
  if (ipv4Match) {
    const [_, o1, o2] = ipv4Match.map(Number);
    if (o1 === 127 || o1 === 10 || o1 === 0) return true;
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    if (o1 === 192 && o2 === 168) return true;
    if (o1 === 169 && o2 === 254) return true;
    return false;
  }
  // IPv6 check (e.g. ::1, fe80::, fc00::)
  if (
    lower === '::1' ||
    lower.startsWith('fe80:') ||
    lower.startsWith('fc00:') ||
    lower.startsWith('fd00:')
  ) {
    return true;
  }
  return false;
}

const imageUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith('/uploads/') || val.startsWith('/assets/')) return true;

      try {
        const url = new URL(val);
        if (
          url.protocol !== 'https:' &&
          (process.env.NODE_ENV === 'production' || url.protocol !== 'http:')
        ) {
          return false;
        }
        if (url.username || url.password) {
          return false;
        }
        if (process.env.NODE_ENV === 'production' && isPrivateIpOrHost(url.hostname)) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'A URL deve ser um endereço HTTPS válido ou um caminho de upload local autorizado.',
    }
  )
  .optional()
  .nullable();

const mentionSchema = z.string().refine(
  (body) => {
    const mentions = body.match(/@[\w-]+/g) || [];
    return mentions.length <= 5;
  },
  { message: 'Máximo de 5 menções por post' }
);

function deriveTitleFromBody(body: string): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_`~>\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const snippet = plain.substring(0, 40).trim();
  return snippet.length >= 5 ? snippet : 'Discussao Geral';
}

export const createPostSchema = z
  .object({
    title: z
      .string()
      .max(200)
      .trim()
      .optional()
      .nullable()
      .refine((val) => !val || val.length >= 5, {
        message: 'O título deve ter pelo menos 5 caracteres',
      }),
    body: z
      .string()
      .trim()
      .min(10, 'O conteúdo deve ter pelo menos 10 caracteres')
      .max(5000)
      .pipe(mentionSchema),
    language: z.nativeEnum(Language).optional().nullable(),
    code: z.string().max(10000).optional().nullable(),
    code_snippet: z.string().max(10000).optional().nullable(),
    image_url: imageUrlSchema,
    type: z.enum(['question', 'discussion']).optional().nullable(),
  })
  .transform((data) => ({
    ...data,
    title: data.title?.trim() || deriveTitleFromBody(data.body),
    code: data.code ?? data.code_snippet ?? null,
    type: data.type ?? (data.language ? ('question' as const) : ('discussion' as const)),
  }));

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createAnswerSchema = z.object({
  body: z
    .string()
    .trim()
    .min(5, 'A resposta deve ter pelo menos 5 caracteres')
    .max(5000)
    .pipe(mentionSchema),
  code_snippet: z.string().optional().nullable(),
  parent_answer_id: z.string().uuid().optional().nullable(),
});

export const quizAttemptSchema = z.object({
  selected_index: z.number().int().min(0, 'Seleção inválida'),
});

export const createDuelSchema = z.object({
  problem_id: z.string().min(1).max(120).optional(),
  problem_title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  problem_body: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  language: z.nativeEnum(Language, {
    message: 'Linguagem inválida',
  }),
});

export const duelVoteSchema = z.object({
  solution_id: z.string().uuid('ID de solução inválido'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(20, 'Nome de usuário deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nome de usuário pode conter apenas letras, números e underline (_)'),
  email: z.string().email('Endereço de e-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Endereço de e-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});
