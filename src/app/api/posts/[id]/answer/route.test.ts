import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseReplyMedia } from '@/lib/reply-media';
import { POST } from './route';

const mocks = vi.hoisted(() => ({
  findPost: vi.fn(),
  findParent: vi.fn(),
  findBlock: vi.fn(),
  findRecipients: vi.fn(),
  createNotifications: vi.fn(),
  findUploads: vi.fn(),
  claimUploads: vi.fn(),
  createAnswer: vi.fn(),
  awardXp: vi.fn(),
  notify: vi.fn(),
  syncAchievements: vi.fn(),
}));

vi.mock('@/lib/auth', () => {
  const viewer = { id: 'viewer', username: 'viewer' };
  return {
    getAuthUser: async () => viewer,
    requireAuth: async () => viewer,
  };
});
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: { findUnique: mocks.findPost },
    answer: { findUnique: mocks.findParent },
    userBlock: { findFirst: mocks.findBlock },
    $transaction: (run: (tx: unknown) => unknown) =>
      run({
        answer: { create: mocks.createAnswer },
        user: { findMany: mocks.findRecipients },
        notification: { createMany: mocks.createNotifications },
        postMedia: { findMany: mocks.findUploads, updateMany: mocks.claimUploads },
      }),
  },
}));
vi.mock('@/services/xp.service', () => ({ XpService: { awardXP: mocks.awardXp } }));
vi.mock('@/services/notification.service', () => ({
  NotificationService: { create: mocks.notify },
}));
vi.mock('@/services/profile-customization.service', () => ({
  syncProfileAchievementsSafely: mocks.syncAchievements,
}));

const parentId = 'a029ed4d-2760-4774-a577-008eba40ea36';
const mediaId = '0b9f1c3e-8c1a-4a7e-9d6f-2f8a1b2c3d4e';
const image = { type: 'image', url: `/api/posts/media/${mediaId}` };
const gif = { type: 'gif', url: 'https://static.klipy.com/ii/a/b.webp' };
const code = ['```js', 'console.log("oi");', '```'].join('\n');

function reply(input: Record<string, unknown>) {
  return POST(
    new Request('https://stacklyst.test/api/posts/post/answer', {
      method: 'POST',
      body: JSON.stringify({ parent_answer_id: parentId, ...input }),
    }),
    { params: Promise.resolve({ id: 'post' }) }
  );
}

describe('POST /api/posts/[id]/answer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.findPost.mockResolvedValue({
      id: 'post',
      author_id: 'post-author',
      title: 'Uma discussão',
      language: null,
      audience: 'everyone',
    });
    mocks.findParent.mockResolvedValue({ id: parentId, post_id: 'post', author_id: 'viewer' });
    mocks.findBlock.mockResolvedValue(null);
    mocks.findRecipients.mockResolvedValue([]);
    mocks.findUploads.mockResolvedValue([{ id: mediaId, content_type: 'image/png' }]);
    mocks.claimUploads.mockResolvedValue({ count: 1 });
    mocks.createAnswer.mockImplementation(async ({ data }) => ({ ...data, id: 'new-reply' }));
    mocks.awardXp.mockResolvedValue({ xpEarned: 15, language: null });
  });

  it('replies to your own nested answer with code, an image and a GIF in a discussion', async () => {
    const response = await reply({ body: code, attachments: [image, gif] });

    expect(response.status).toBe(200);
    const { answer, xpResult } = await response.json();
    expect(answer).toMatchObject({ post_id: 'post', author_id: 'viewer', parent_id: parentId });
    expect(parseReplyMedia(answer.body)).toEqual({
      content: code,
      attachments: [image, gif],
      music: null,
    });
    expect(mocks.claimUploads).toHaveBeenCalledWith({
      where: { id: { in: [mediaId] }, owner_id: 'viewer', post_id: null },
      data: { post_id: 'post' },
    });
    expect(mocks.awardXp).toHaveBeenCalledWith('viewer', null, 15);
    expect(xpResult).toEqual({ xpEarned: 15, language: null });
    expect(mocks.findRecipients).not.toHaveBeenCalled();
  });

  it('notifies the parent author for an attachment-only reply with a saved parent', async () => {
    mocks.findParent.mockResolvedValue({
      id: parentId,
      post_id: 'post',
      author_id: 'parent-author',
    });
    mocks.findRecipients.mockResolvedValue([{ id: 'parent-author' }]);
    const response = await reply({ body: '', attachments: [gif] });

    expect(response.status).toBe(200);
    expect(parseReplyMedia((await response.json()).answer.body).attachments).toEqual([gif]);
    expect(mocks.findRecipients).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([{ id: 'parent-author' }]),
        }),
      })
    );
    expect(mocks.createNotifications).toHaveBeenCalledOnce();
  });

  it('accepts a short message in the thread without requiring a mention in the body', async () => {
    const response = await reply({ body: 'oi' });
    expect(response.status).toBe(200);
    expect((await response.json()).answer).toMatchObject({ parent_id: parentId, body: 'oi' });
  });

  it('allows up to 4 images/GIFs alongside 1 audio clip in a reply', async () => {
    const audioId = '1c9f1c3e-8c1a-4a7e-9d6f-2f8a1b2c3d4e';
    const audio = { type: 'audio', url: `/api/posts/media/${audioId}` };
    const extraImages = [
      { type: 'gif', url: 'https://static.klipy.com/ii/a/1.webp' },
      { type: 'gif', url: 'https://static.klipy.com/ii/a/2.webp' },
      { type: 'gif', url: 'https://static.klipy.com/ii/a/3.webp' },
    ];
    mocks.findUploads.mockResolvedValue([
      { id: mediaId, content_type: 'image/png' },
      { id: audioId, content_type: 'audio/webm' },
    ]);
    mocks.claimUploads.mockResolvedValue({ count: 2 });

    const response = await reply({
      body: 'Thread com áudio',
      attachments: [image, ...extraImages, audio],
    });

    expect(response.status).toBe(200);
    expect(parseReplyMedia((await response.json()).answer.body).attachments).toHaveLength(5);
  });

  it.each([{ body: 'oi', parent_answer_id: null }, { body: '   ' }])(
    'rejects replies with no usable content: %j',
    async (input) => {
      expect((await reply(input)).status).toBe(400);
      expect(mocks.createAnswer).not.toHaveBeenCalled();
    }
  );

  it('returns the saved reply when the separate XP request fails', async () => {
    const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.awardXp.mockRejectedValueOnce(new Error('XP unavailable'));
    try {
      const response = await reply({ body: '', attachments: [image] });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        answer: { id: 'new-reply', parent_id: parentId },
        xpResult: null,
      });
      expect(mocks.createAnswer).toHaveBeenCalledOnce();
    } finally {
      logger.mockRestore();
    }
  });

  it('keeps a reply from using an upload already claimed by a concurrent request', async () => {
    mocks.claimUploads.mockResolvedValueOnce({ count: 0 });
    const response = await reply({ body: '', attachments: [image] });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'INVALID_MEDIA' });
    expect(mocks.createAnswer).not.toHaveBeenCalled();
  });

  it('rejects a parent that belongs to a different post', async () => {
    mocks.findParent.mockResolvedValue({
      id: parentId,
      post_id: 'another-post',
      author_id: 'viewer',
    });
    const response = await reply({ body: code });
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: 'PARENT_ANSWER_MISMATCH' });
    expect(mocks.createAnswer).not.toHaveBeenCalled();
  });
});
