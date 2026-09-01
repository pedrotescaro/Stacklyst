import { z } from 'zod';
import { Language } from '@prisma/client';

const imageUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith('https://')) return true;
      if (val.startsWith('/uploads/')) return true;
      if (
        val.startsWith('http://localhost/') ||
        val.startsWith('http://localhost') ||
        val.startsWith('http://127.0.0.1/') ||
        val.startsWith('http://127.0.0.1')
      ) {
        return true;
      }
      return false;
    },
    {
      message: 'Apenas URLs HTTPS ou caminhos locais autorizados são permitidos',
    }
  )
  .refine(
    (val) => {
      if (!val) return true;
      const blocked = ['javascript:', 'data:', 'file:', 'vbscript:'];
      return !blocked.some((proto) => val.toLowerCase().startsWith(proto));
    },
    { message: 'Protocolo não permitido' }
  )
  .refine(
    async (val) => {
      if (!val) return true;
      if (val.startsWith('/')) return true;
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(val, {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(id);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && !contentType.startsWith('image/')) {
          return false;
        }
        return true;
      } catch {
        // Degrade gracefully on timeout or network issues
        return true;
      }
    },
    { message: 'A URL deve apontar para uma imagem válida' }
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
      .min(10, 'O conteúdo deve ter pelo menos 10 caracteres')
      .max(5000)
      .trim()
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
    .min(5, 'A resposta deve ter pelo menos 5 caracteres')
    .max(5000)
    .trim()
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
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
