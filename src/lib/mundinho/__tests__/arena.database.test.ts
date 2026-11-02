// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import dotenv from 'dotenv';
import type { PrismaClient } from '@prisma/client';
import type { arena as ArenaService } from '../arena';
import { DEFAULT_AVATAR } from '../types';
import { challengeSolution } from './codeChallengeSolutions';
vi.mock('@/lib/ratelimit', () => ({ rateLimit: vi.fn() }));

describe.runIf(process.env.RUN_MUNDINHO_DB_TEST === '1')(
  'Arena with real PostgreSQL and JS/TS execution',
  () => {
    let prisma: PrismaClient;
    let arena: typeof ArenaService;
    const ids = Array.from({ length: 4 }, () => crypto.randomUUID());
    const [host, guest, stranger, rival] = ids;
    beforeAll(async () => {
      dotenv.config({ path: '.env.local', quiet: true });
      ({ prisma } = await import('@/lib/prisma'));
      ({ arena } = await import('../arena'));
      for (const [index, id] of ids.entries())
        await prisma.user.create({
          data: {
            id,
            username: `arena_qa_${id.replaceAll('-', '').slice(0, 18)}`,
            email: `${id}@arena-qa.invalid`,
            avatar_config: {
              displayName: ['Host QA', 'Amigo QA', 'Estranho QA', 'Rival QA'][index],
            },
            rpg_player: {
              create: {
                avatar: {
                  ...DEFAULT_AVATAR,
                  outfit: index,
                  hairTint: index ? '#d69b64' : '#2e8be0',
                },
              },
            },
          },
        });
    }, 30000);
    afterAll(async () => {
      if (prisma) {
        await prisma.user.deleteMany({ where: { id: { in: ids } } });
        await prisma.$disconnect();
      }
    });
    it('supports invitations, shared movement, independent languages and a complete authoritative match', async () => {
      const first = await arena(host, { type: 'enter', language: 'JS' });
      const roomId = first.room!.id;
      expect(first.room?.players[0].name).toBe('Host QA');
      expect(first.friends).toHaveLength(0);
      await expect(arena(host, { type: 'invite', roomId, friendId: guest })).rejects.toThrow(
        'Convide alguém'
      );
      await prisma.follow.createMany({
        data: [
          { followerId: host, followingId: guest },
          { followerId: guest, followingId: host },
          { followerId: host, followingId: rival },
          { followerId: rival, followingId: host },
        ],
      });
      await prisma.userBlock.create({ data: { blockerId: rival, blockedId: host } });
      const refreshed = await arena(host, { type: 'sync', roomId, lobby: true });
      expect(refreshed.friends.map((f) => f.id)).toEqual([guest]);
      await expect(arena(stranger, { type: 'sync', roomId })).rejects.toThrow('não participa');
      await expect(arena(host, { type: 'invite', roomId, friendId: rival })).rejects.toThrow(
        'Convide alguém'
      );
      await arena(host, { type: 'invite', roomId, friendId: guest });
      const inbox = await arena(guest, { type: 'inbox' });
      expect(inbox.invitations[0]).toMatchObject({ roomId, hostName: 'Host QA' });
      await expect(arena(stranger, { type: 'accept', roomId, language: 'PYTHON' })).rejects.toThrow(
        'não pertence'
      );
      const joined = await arena(guest, { type: 'accept', roomId, language: 'TS' });
      expect(joined.room?.players.map((p) => p.language)).toEqual(['JS', 'TS']);
      expect(joined.room?.players[0].avatar).toEqual({
        ...DEFAULT_AVATAR,
        outfit: 0,
        hairTint: '#2e8be0',
      });
      expect(joined.room?.players[1].avatar.outfit).toBe(1);
      const duplicateJoin = await arena(guest, { type: 'accept', roomId, language: 'PYTHON' });
      expect(duplicateJoin.room?.players[1].language).toBe('TS');
      await arena(host, {
        type: 'sync',
        roomId,
        position: { x: 342, y: 340, direction: 'right', walking: true },
      });
      expect((await arena(guest, { type: 'sync', roomId })).room?.players[0].position.x).toBe(342);
      await prisma.rpgPlayer.update({
        where: { userId: host },
        data: { avatar: { ...DEFAULT_AVATAR, outfit: 4 } },
      });
      expect((await arena(guest, { type: 'sync', roomId })).room?.players[0].avatar.outfit).toBe(4);
      expect((await arena(host, { type: 'ready', roomId })).room?.match?.status).toBe('ready');
      let current = await arena(guest, { type: 'ready', roomId });
      expect(current.room?.match?.status).toBe('active');
      for (let turn = 0; turn < 8; turn++) {
        const match = current.room!.match!;
        const actor = match.actorId;
        const own = await arena(actor, { type: 'sync', roomId });
        const question = own.room!.question!;
        const language = own.room!.players.find((p) => p.id === actor)!.language;
        const action = {
          type: 'run' as const,
          roomId,
          matchId: match.id,
          turn: match.turn,
          questionId: question.id,
          code: challengeSolution(question, language),
          submit: true,
        };
        if (!turn) {
          const preview = await arena(actor, { ...action, submit: false });
          expect(preview.codeRun?.passed).toBe(true);
          expect(preview.room?.match?.turn).toBe(0);
          const [one, two] = await Promise.allSettled([arena(actor, action), arena(actor, action)]);
          expect([one, two].some((r) => r.status === 'fulfilled')).toBe(true);
          current = await arena(actor, { type: 'sync', roomId });
          expect(current.room?.match?.turn).toBe(1);
          expect(Object.values(current.room!.match!.hp).sort((a, b) => a - b)).toEqual([70, 100]);
        } else current = await arena(actor, action);
        if (current.room?.match?.status === 'finished') break;
      }
      expect(current.room?.match).toMatchObject({ status: 'finished' });
      expect(current.room?.match?.winnerId).toBeTruthy();
      const ready = await arena(host, { type: 'ready', roomId });
      expect(ready.room?.match).toMatchObject({
        status: 'ready',
        hp: { [host]: 100, [guest]: 100 },
      });
      await arena(guest, { type: 'ready', roomId });
      const resigned = await arena(guest, { type: 'leave', roomId });
      expect(resigned.room).toBeNull();
      expect((await arena(host, { type: 'sync', roomId })).room?.match).toMatchObject({
        status: 'finished',
        winnerId: host,
      });
      await arena(host, { type: 'invite', roomId, friendId: guest });
      await prisma.rpgArenaRoom.update({
        where: { id: roomId },
        data: { inviteExpiresAt: new Date(0) },
      });
      await expect(arena(guest, { type: 'accept', roomId, language: 'TS' })).rejects.toThrow(
        'expirou'
      );
      await arena(host, { type: 'invite', roomId, friendId: guest });
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId: guest, followingId: host } },
      });
      await expect(arena(guest, { type: 'accept', roomId, language: 'TS' })).rejects.toThrow(
        'mutuamente'
      );
      await prisma.follow.create({ data: { followerId: guest, followingId: host } });
      await arena(guest, { type: 'accept', roomId, language: 'TS' });
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId: guest, followingId: host } },
      });
      await expect(arena(guest, { type: 'accept', roomId, language: 'TS' })).rejects.toThrow(
        'mutuamente'
      );
      await expect(arena(guest, { type: 'enter', language: 'TS' })).rejects.toThrow('mutuamente');
      await arena(host, { type: 'sync', roomId });
      await prisma.follow.createMany({
        data: [
          { followerId: guest, followingId: host },
          { followerId: host, followingId: stranger },
          { followerId: stranger, followingId: host },
        ],
      });
      const other = await arena(stranger, { type: 'enter', language: 'PYTHON' });
      await arena(stranger, { type: 'invite', roomId: other.room!.id, friendId: host });
      await arena(host, { type: 'invite', roomId, friendId: guest });
      const admissions = await Promise.allSettled([
        arena(host, { type: 'accept', roomId: other.room!.id, language: 'JS' }),
        arena(guest, { type: 'accept', roomId, language: 'TS' }),
      ]);
      expect(admissions.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    }, 240000);
  }
);
