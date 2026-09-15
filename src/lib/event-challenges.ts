import { Language } from '@prisma/client';
import { z } from 'zod';

export const MIN_EVENT_CHALLENGES = 3;
export const MAX_EVENT_CHALLENGES = 20;
export const MAX_EVENT_CHALLENGE_EXAMPLES = 5;

export const eventChallengeExampleSchema = z.object({
  input: z.string().trim().max(5_000, 'A entrada do exemplo deve ter no máximo 5.000 caracteres.'),
  output: z
    .string()
    .trim()
    .min(1, 'A saída do exemplo é obrigatória.')
    .max(5_000, 'A saída do exemplo deve ter no máximo 5.000 caracteres.'),
  explanation: z
    .string()
    .trim()
    .max(2_000, 'A explicação deve ter no máximo 2.000 caracteres.')
    .optional(),
});

export const eventChallengeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'O título do desafio deve ter pelo menos 3 caracteres.')
    .max(120, 'O título do desafio deve ter no máximo 120 caracteres.'),
  statement: z
    .string()
    .trim()
    .min(10, 'O enunciado do desafio deve ter pelo menos 10 caracteres.')
    .max(10_000, 'O enunciado do desafio deve ter no máximo 10.000 caracteres.'),
  language: z.nativeEnum(Language),
  expected_answer: z
    .string()
    .trim()
    .min(1, 'A resposta esperada é obrigatória.')
    .max(20_000, 'A resposta esperada deve ter no máximo 20.000 caracteres.'),
  examples: z
    .array(eventChallengeExampleSchema)
    .min(1, 'Cada desafio deve ter pelo menos um exemplo.')
    .max(
      MAX_EVENT_CHALLENGE_EXAMPLES,
      `Cada desafio deve ter no máximo ${MAX_EVENT_CHALLENGE_EXAMPLES} exemplos.`
    ),
});

export const eventChallengeSetSchema = z.object({
  challenges: z
    .array(eventChallengeSchema)
    .min(MIN_EVENT_CHALLENGES, `O evento deve ter pelo menos ${MIN_EVENT_CHALLENGES} desafios.`)
    .max(MAX_EVENT_CHALLENGES, `O evento deve ter no máximo ${MAX_EVENT_CHALLENGES} desafios.`),
});

export type EventChallengeInput = z.infer<typeof eventChallengeSchema>;
export type EventChallengeExample = z.infer<typeof eventChallengeExampleSchema>;
