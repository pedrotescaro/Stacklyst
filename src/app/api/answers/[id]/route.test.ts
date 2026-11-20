import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, PATCH } from './route';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { encodeReplyMedia, parseReplyMedia } from '@/lib/reply-media';

vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(async (operations: unknown[]) => operations),
    answer: {
      findUnique: vi.fn(),
      updateMany: vi.fn((args) => ({ op: 'reparent', args })),
      delete: vi.fn((args) => ({ op: 'delete', args })),
      update: vi.fn(async (args: { data: { body: string } }) => ({
        id: 'a',
        body: args.data.body,
      })),
    },
    postMedia: { deleteMany: vi.fn((args) => ({ op: 'media', args })) },
  },
}));

const remove = () =>
  DELETE(new Request('https://stacklyst.test/api/answers/a', { method: 'DELETE' }), {
    params: Promise.resolve({ id: 'a' }),
  });
const upload = '/api/posts/media/0b9f1c3e-8c1a-4a7e-9d6f-2f8a1b2c3d4e';

describe('DELETE /api/answers/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'me' } as never);
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      author_id: 'me',
      post_id: 'post',
      parent_id: 'parent',
      body: 'Minha resposta',
    } as never);
  });

  it('requires a signed-in user', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null as never);
    expect((await remove()).status).toBe(401);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing reply', async () => {
    vi.mocked(prisma.answer.findUnique).mockResolvedValue(null);
    expect((await remove()).status).toBe(404);
  });

  it('refuses to delete someone else’s reply, even on the caller’s post', async () => {
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      author_id: 'someone',
      post_id: 'post',
      parent_id: null,
      body: 'x',
    } as never);
    expect((await remove()).status).toBe(403);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('keeps replies below it in the thread and deletes the reply', async () => {
    const response = await remove();
    expect(response.status).toBe(200);
    expect(prisma.answer.updateMany).toHaveBeenCalledWith({
      where: { parent_id: 'a' },
      data: { parent_id: 'parent' },
    });
    expect(prisma.answer.delete).toHaveBeenCalledWith({ where: { id: 'a' } });
    expect(prisma.postMedia.deleteMany).not.toHaveBeenCalled();
    const operations = vi.mocked(prisma.$transaction).mock.calls[0][0] as unknown as {
      op: string;
    }[];
    expect(operations.map((operation) => operation.op)).toEqual(['reparent', 'delete']);
  });

  it('releases files uploaded for the reply but not KLIPY GIFs', async () => {
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      author_id: 'me',
      post_id: 'post',
      parent_id: null,
      body: encodeReplyMedia('Com mídia', {
        attachments: [
          { type: 'image', url: upload },
          { type: 'gif', url: 'https://static.klipy.com/ii/a/b.webp' },
        ],
        music: null,
      }),
    } as never);
    expect((await remove()).status).toBe(200);
    expect(prisma.postMedia.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['0b9f1c3e-8c1a-4a7e-9d6f-2f8a1b2c3d4e'] },
        owner_id: 'me',
        post_id: 'post',
      },
    });
  });
});

const edit = (body: unknown) =>
  PATCH(
    new Request('https://stacklyst.test/api/answers/a', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: 'a' }) }
  );

describe('PATCH /api/answers/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'me' } as never);
  });

  it('edits only the text and keeps media, location and the sensitive warning', async () => {
    const media = {
      attachments: [{ type: 'gif' as const, url: 'https://static.klipy.com/ii/a/b.webp' }],
      music: null,
    };
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      author_id: 'me',
      body: encodeReplyMedia('⚠️ Conteúdo sensível\n\nTexto antigo\n\n📍 São Paulo', media),
    } as never);
    const response = await edit({ body: 'Texto novo e melhor' });
    expect(response.status).toBe(200);
    const saved = (await response.json()).body as string;
    const parsed = parseReplyMedia(saved);
    expect(parsed.attachments).toEqual(media.attachments);
    expect(parsed.content).toBe('⚠️ Conteúdo sensível\n\nTexto novo e melhor\n\n📍 São Paulo');
  });

  it('refuses to edit someone else’s reply', async () => {
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      author_id: 'someone',
      body: 'Texto deles',
    } as never);
    expect((await edit({ body: 'Texto trocado' })).status).toBe(403);
    expect(prisma.answer.update).not.toHaveBeenCalled();
  });

  it('rejects a text-only reply shorter than five characters', async () => {
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      author_id: 'me',
      body: 'Texto antigo',
    } as never);
    expect((await edit({ body: 'oi' })).status).toBe(400);
    expect(prisma.answer.update).not.toHaveBeenCalled();
  });

  it('drops a hand-written media marker from the new text', async () => {
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      author_id: 'me',
      body: 'Texto antigo',
    } as never);
    const forged = encodeReplyMedia('Texto novo', {
      attachments: [
        { type: 'image', url: '/api/posts/media/0b9f1c3e-8c1a-4a7e-9d6f-2f8a1b2c3d4e' },
      ],
      music: null,
    });
    const response = await edit({ body: forged });
    expect(response.status).toBe(200);
    expect((await response.json()).body).toBe('Texto novo');
  });

  it('requires a signed-in user', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null as never);
    expect((await edit({ body: 'Texto novo' })).status).toBe(401);
  });
});
