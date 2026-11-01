import { z } from 'zod';

export const CREDENTIAL_LANGUAGES = ['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA'] as const;
export type CredentialLanguage = (typeof CREDENTIAL_LANGUAGES)[number];
export const CREDENTIAL_KINDS = ['first_lesson', 'section', 'course', 'practice', 'path'] as const;
export type CredentialKind = (typeof CREDENTIAL_KINDS)[number];

const text = (max: number) => z.string().trim().min(1).max(max);
export const credentialRequirementSchema = z
  .object({
    id: text(220),
    source: z.enum(['lesson', 'exercise']),
    title: text(240),
  })
  .strict();
export const credentialDefinitionSchema = z
  .object({
    id: text(240),
    version: z.number().int().positive(),
    title: text(240),
    description: text(600),
    language: z.enum(CREDENTIAL_LANGUAGES).nullable(),
    kind: z.enum(CREDENTIAL_KINDS),
    estimatedMinutes: z.number().int().min(0),
    skills: z.array(text(160)).max(100),
    requirements: z.array(credentialRequirementSchema).max(1500),
  })
  .strict();
export type CredentialRequirement = z.infer<typeof credentialRequirementSchema>;
export type CredentialDefinition = z.infer<typeof credentialDefinitionSchema>;

export const credentialSnapshotSchema = z
  .object({
    id: z.uuid(),
    definition: credentialDefinitionSchema,
    recipientName: text(100),
    recipientUsername: text(80),
    issuedAt: z.iso.datetime(),
    verifiedAt: z.iso.datetime(),
  })
  .strict();
export type CredentialSnapshot = z.infer<typeof credentialSnapshotSchema>;
export interface CredentialRecord extends CredentialSnapshot {
  integrityHash: string;
  status: 'valid' | 'revoked';
}
export interface CredentialCollection {
  items: Array<{
    definition: CredentialDefinition;
    completed: number;
    total: number;
    credential: CredentialRecord | null;
  }>;
  earnedCount: number;
}
