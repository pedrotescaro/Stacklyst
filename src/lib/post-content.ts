/** Shared persisted composer data. Text remains backwards-compatible Markdown. */
export interface PostAttachment {
  type: 'image' | 'gif' | 'audio';
  url: string;
  alt?: string;
}

export interface PostPollDraft {
  question: string;
  options: string[];
  durationHours: number;
}

export interface PostPoll {
  id: string;
  question: string;
  options: string[];
  expiresAt: string;
  totalVotes: number;
  counts: number[];
  myVote: number | null;
  closed: boolean;
}

export type PostAudience = 'everyone' | 'followers';
