/** Shared persisted composer data. Text remains backwards-compatible Markdown. */
export interface PostAttachment {
  type: 'image' | 'gif' | 'audio';
  url: string;
  alt?: string;
}

const UPLOADED_POST_MEDIA_URL = /^\/api\/posts\/media\/[a-f0-9-]{36}$/i;

/** A file uploaded through /api/posts/media (as opposed to a KLIPY GIF URL). */
export function isUploadedPostMediaUrl(value: unknown): value is string {
  return typeof value === 'string' && UPLOADED_POST_MEDIA_URL.test(value);
}

/** Uploaded attachments must be claimed in post_media; KLIPY GIFs have no row. */
export function uploadedMediaIds(attachments: PostAttachment[]) {
  return attachments.flatMap((item) =>
    isUploadedPostMediaUrl(item.url) ? [item.url.split('/').at(-1)!] : []
  );
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
