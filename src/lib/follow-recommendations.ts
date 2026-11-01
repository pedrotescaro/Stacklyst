import type { Language } from '@prisma/client';
import { readProfileIdentity, type ProfileIdentityStyle } from '@/lib/profile-style';

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
