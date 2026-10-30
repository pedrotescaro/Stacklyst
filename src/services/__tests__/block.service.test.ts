// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  userBlock: { findFirst: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn() },
  follow: { deleteMany: vi.fn() },
  duelRequest: { updateMany: vi.fn() },
  notification: { deleteMany: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({
  prisma: { ...db, $transaction: (fn: (tx: unknown) => unknown) => fn(db) },
}));
import { BlockService, visibleUserWhere } from '../block.service';

describe('mutual user blocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.user.findUnique.mockResolvedValue({ id: 'other' });
    db.userBlock.findFirst.mockResolvedValue(null);
  });

  it('rejects blocking oneself and nonexistent users before any writes', async () => {
    await expect(BlockService.block('me', 'me')).rejects.toMatchObject({
      code: 'SELF_BLOCK',
      statusCode: 400,
    });
    db.user.findUnique.mockResolvedValue(null);
    await expect(BlockService.block('me', 'missing')).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    });
    expect(db.userBlock.upsert).not.toHaveBeenCalled();
  });

  it('stores a directional idempotent block and removes follows, notifications and pending invites in both directions', async () => {
    await expect(BlockService.block('me', 'other')).resolves.toEqual({ blocked: true });
    expect(db.userBlock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: { blockerId: 'me', blockedId: 'other' }, update: {} })
    );
    expect(db.follow.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { followerId: 'me', followingId: 'other' },
          { followerId: 'other', followingId: 'me' },
        ],
      },
    });
    expect(db.duelRequest.updateMany).toHaveBeenCalledWith({
      where: {
        status: 'PENDING',
        OR: [
          { sender_id: 'me', receiver_id: 'other' },
          { sender_id: 'other', receiver_id: 'me' },
        ],
      },
      data: { status: 'REJECTED' },
    });
    expect(db.notification.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { userId: 'me', actorId: 'other' },
          { userId: 'other', actorId: 'me' },
        ],
      },
    });
  });

  it.each(['me', 'other'])(
    'refuses interaction when either account placed the block (%s)',
    async (blockerId) => {
      db.userBlock.findFirst.mockResolvedValue({ blockerId });
      await expect(BlockService.assertCanInteract('me', 'other')).rejects.toMatchObject({
        code: 'USER_BLOCKED',
        statusCode: 403,
      });
      expect(db.userBlock.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { blockerId: 'me', blockedId: 'other' },
              { blockerId: 'other', blockedId: 'me' },
            ],
          },
        })
      );
    }
  );

  it('allows unblocked accounts and own content', async () => {
    await expect(BlockService.assertCanInteract('me', 'other')).resolves.toBeUndefined();
    db.userBlock.findFirst.mockClear();
    await expect(BlockService.assertCanInteract('me', 'me')).resolves.toBeUndefined();
    expect(db.userBlock.findFirst).not.toHaveBeenCalled();
  });

  it('only deletes the authenticated account’s own block on unblock', async () => {
    await expect(BlockService.unblock('me', 'other')).resolves.toEqual({ blocked: false });
    expect(db.userBlock.deleteMany).toHaveBeenCalledExactlyOnceWith({
      where: { blockerId: 'me', blockedId: 'other' },
    });
    expect(db.follow.deleteMany).not.toHaveBeenCalled();
  });

  it('only lists blocks placed by the requester', async () => {
    db.userBlock.findMany.mockResolvedValue([]);
    await BlockService.list('me');
    expect(db.userBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { blockerId: 'me' },
        select: expect.objectContaining({ blocked: expect.any(Object) }),
      })
    );
  });

  it('filters both directions in user relations while keeping anonymous content public', () => {
    expect(visibleUserWhere('me')).toEqual({
      blocks_made: { none: { blockedId: 'me' } },
      blocks_received: { none: { blockerId: 'me' } },
    });
    expect(visibleUserWhere(null)).toEqual({});
  });
});
