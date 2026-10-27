/**
 * Shared types for the threaded answer/comment system.
 *
 * An `AnswerNode` is an answer plus its nested replies. The tree is built
 * server-side via Prisma's nested `include` (up to a fixed depth that matches
 * the UI indent cap). Replies deeper than the fetched depth are rendered flat
 * with a "replying to @user" badge, mirroring Twitter/X threading.
 */

export interface AnswerAuthor {
  name?: string | null;
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
  total_xp?: number;
}

export interface AnswerVote {
  value: number; // 1 for upvote, -1 for downvote
}

export interface AnswerNode {
  id: string;
  post_id?: string;
  parent_id?: string | null;
  body: string;
  code_snippet?: string | null;
  is_accepted: boolean;
  upvotes: number;
  created_at: string;
  author: AnswerAuthor;
  votes?: AnswerVote[];
  replies?: AnswerNode[];
}

/** Maximum indentation depth before replies collapse into a flat "replying to" list. */
export const MAX_ANSWER_DEPTH = 3;
