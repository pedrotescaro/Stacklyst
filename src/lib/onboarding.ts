import { z } from 'zod';

export const ONBOARDING_STATE_KEY = 'web:onboarding';
export const onboardingLanguageSchema = z.enum(['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA']);
export const onboardingSchema = z.object({
  feed: z.enum(['for-you', 'following']),
  languages: z.array(onboardingLanguageSchema).min(1, 'Escolha pelo menos uma linguagem.').max(6),
});
export type OnboardingPreferences = z.infer<typeof onboardingSchema>;

export function parseOnboarding(value: unknown): OnboardingPreferences | null {
  const result = onboardingSchema.safeParse(value);
  return result.success ? { ...result.data, languages: [...new Set(result.data.languages)] } : null;
}
