import { z } from 'zod';
import { feedLanguageSchema, feedSettingsSchema } from './feed-preferences';

export const ONBOARDING_STATE_KEY = 'web:onboarding';
export const onboardingLanguageSchema = feedLanguageSchema;
export const onboardingSchema = z.object({
  feed: z.enum(['for-you', 'following']),
  languages: z.array(onboardingLanguageSchema).min(1, 'Escolha pelo menos uma linguagem.').max(6),
  feedSettings: feedSettingsSchema.optional(),
});
export type OnboardingPreferences = z.infer<typeof onboardingSchema>;

export function parseOnboarding(value: unknown): OnboardingPreferences | null {
  const result = onboardingSchema.safeParse(value);
  return result.success ? { ...result.data, languages: [...new Set(result.data.languages)] } : null;
}
