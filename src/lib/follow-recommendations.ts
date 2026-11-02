import type { Language } from '@prisma/client';
import { readProfileIdentity, type ProfileIdentityStyle } from '@/lib/profile-style';
import { z } from 'zod';

export const FOLLOW_RECOMMENDATION_MAX_EXCLUDE = 50;
export const FOLLOW_RECOMMENDATION_ID_MAX_LENGTH = 120;
const excludedIdsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1)
      .max(FOLLOW_RECOMMENDATION_ID_MAX_LENGTH)
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/)
  )
  .max(FOLLOW_RECOMMENDATION_MAX_EXCLUDE);

export function normalizeFollowRecommendationExclusions(ids: readonly string[] = []): string[] {
  return [...new Set(excludedIdsSchema.parse(ids))];
}

/** UUIDs and existing text IDs are accepted without looking up or echoing them. */
export function parseFollowRecommendationQuery(params: URLSearchParams): {
  limit: number;
  exclude: string[];
} {
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .parse(params.get('limit') ?? undefined);
  if (params.getAll('exclude').length > 1) throw new Error('INVALID_SUGGESTION_QUERY');
  const raw = z
    .string()
    .max(FOLLOW_RECOMMENDATION_MAX_EXCLUDE * (FOLLOW_RECOMMENDATION_ID_MAX_LENGTH + 1) - 1)
    .parse(params.get('exclude') ?? '');
  return {
    limit,
    exclude: normalizeFollowRecommendationExclusions(raw === '' ? [] : raw.split(',')),
  };
}

export interface FollowProfileIdentity {
  frame: ProfileIdentityStyle['frame'];
  flags: string[];
}

/** Only the public decorations needed by a suggestion, never the full avatar config. */
export function getFollowProfileIdentity(config: unknown): FollowProfileIdentity {
  const identity = readProfileIdentity(config);
  return { frame: identity.frame ?? null, flags: [...new Set(identity.flags ?? [])] };
}

export interface FollowRecommendation {
  id: string;
  username: string;
  display_name?: string;
  avatar_url: string | null;
  total_xp: number;
  identity?: FollowProfileIdentity;
  reason: {
    type: 'mutual' | 'language' | 'interaction' | 'active';
    language?: Language;
    count?: number;
  };
}

export interface RecommendationCandidate {
  id: string;
  activityAt: number;
  followers: number;
  mutualCount: number;
  interactionCount: number;
  languages: Language[];
}

/** Signals are capped so a large account cannot overwhelm personal relevance. */
export function scoreFollowCandidate(
  candidate: RecommendationCandidate,
  interests: Language[],
  now: number
) {
  const shared = interests.filter((language) => candidate.languages.includes(language));
  const ageDays = Math.max(0, (now - candidate.activityAt) / 86400000);
  const recent = ageDays <= 7 ? 8 : ageDays <= 30 ? 4 : ageDays <= 90 ? 1 : 0;
  const score =
    Math.min(candidate.mutualCount, 6) * 16 +
    Math.min(candidate.interactionCount, 8) * 6 +
    Math.min(shared.length, 2) * 12 +
    recent +
    Math.min(4, Math.log1p(candidate.followers));
  const reason: FollowRecommendation['reason'] =
    candidate.mutualCount > 0
      ? { type: 'mutual', count: candidate.mutualCount }
      : candidate.interactionCount > 0
        ? { type: 'interaction' }
        : shared.length
          ? { type: 'language', language: shared[0] }
          : { type: 'active' };
  return { score, reason };
}
