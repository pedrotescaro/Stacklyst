import 'server-only';
import { randomInt, randomUUID } from 'node:crypto';
import { Prisma, type RpgArenaRoom } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { getAuthorDisplayName } from '@/lib/profile-style';
import { executeCode } from '@/lib/code-execution/server';
import { rateLimit } from '@/lib/ratelimit';
import {
  DEFAULT_AVATAR,
  LANGUAGES,
  levelProgress,
  type Avatar,
  type BattleLanguage,
  type CodeRun,
} from './types';
import {
  codeChallenges,
  challengeProgram,
  challengeExecutionLanguage,
  evaluateTrace,
} from './codeChallenges';
import { instrumentChallengeSource } from './codeChallengeStructures';
import {
  advanceArenaTurn,
  ARENA_INVITE_MS,
  ARENA_ONLINE_MS,
  ARENA_TURN_MS,
  validArenaPosition,
} from './arena-rules';
import type { ArenaAction, ArenaMatch, ArenaPosition, ArenaState } from './arena-types';

const roomId = z.string().uuid();
const position = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  direction: z.enum(['up', 'down', 'left', 'right']),
  walking: z.boolean(),
});
export const arenaActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('inbox') }),
  z.object({ type: z.literal('enter'), language: z.enum(LANGUAGES) }),
  z.object({ type: z.literal('invite'), roomId, friendId: z.string().min(1).max(100) }),
  z.object({ type: z.literal('accept'), roomId, language: z.enum(LANGUAGES) }),
  z.object({ type: z.literal('decline'), roomId }),
  z.object({
    type: z.literal('sync'),
    roomId,
    position: position.optional(),
    lobby: z.boolean().optional(),
  }),
  z.object({ type: z.literal('leave'), roomId }),
  z.object({ type: z.literal('ready'), roomId }),
  z.object({
    type: z.literal('run'),
    roomId,
    matchId: roomId,
    turn: z.number().int().min(0),
    questionId: z.string().max(100),
    code: z.string().min(1).max(8000),
    submit: z.boolean(),
  }),
]);
type Tx = Prisma.TransactionClient;
const userSelect = {
  id: true,
  username: true,
  avatar_config: true,
  total_xp: true,
  rpg_player: { select: { avatar: true } },
} as const;
const _include = {
  host: { select: userSelect },
  guest: { select: userSelect },
  invitee: { select: { username: true, avatar_config: true } },
} as const;
const spawn = (guest = false): ArenaPosition => ({
  x: guest ? 448 : 320,
  y: 340,
  direction: 'down',
  walking: false,
});
const matchOf = (room: RpgArenaRoom) => room.match as ArenaMatch | null;
function invalid(message: string): never {
  throw new ValidationError('ARENA_RULE', message);
}
function member(room: RpgArenaRoom, userId: string) {
  if (room.hostId !== userId && room.guestId !== userId)
    throw new ForbiddenError('ARENA_MEMBER', 'Você não participa desta arena.');
}
async function mutual(tx: Tx, first: string, second: string) {
  if (first === second) return false;
  const [result] = await tx.$queryRaw<{ allowed: boolean }[]>`
    SELECT EXISTS(SELECT 1 FROM "Follow" WHERE "followerId"=${first} AND "followingId"=${second})
      AND EXISTS(SELECT 1 FROM "Follow" WHERE "followerId"=${second} AND "followingId"=${first})
      AND NOT EXISTS(SELECT 1 FROM user_blocks WHERE
        ("blockerId"=${first} AND "blockedId"=${second}) OR ("blockerId"=${second} AND "blockedId"=${first})) AS allowed`;
  return result.allowed;
}
async function activeRoom(tx: Tx, userId: string, now: Date) {
  const cutoff = new Date(now.getTime() - ARENA_ONLINE_MS);
  return tx.rpgArenaRoom.findFirst({
    where: {
      OR: [
        { hostId: userId, hostSeenAt: { gt: cutoff } },
        { guestId: userId, guestSeenAt: { gt: cutoff } },
      ],
    },
  });
}
async function roomSnapshot(tx: Tx, id: string) {
  type Snapshot = Prisma.RpgArenaRoomGetPayload<{ include: typeof _include }>;
  const [room] = await tx.$queryRaw<Snapshot[]>`
    SELECT r.*,
      jsonb_build_object('id', h.id, 'username', h.username, 'avatar_config', h.avatar_config, 'total_xp', h.total_xp,
        'rpg_player', jsonb_build_object('avatar', hp.avatar)) AS host,
      CASE WHEN g.id IS NULL THEN NULL ELSE jsonb_build_object('id', g.id, 'username', g.username,
        'avatar_config', g.avatar_config, 'total_xp', g.total_xp, 'rpg_player', jsonb_build_object('avatar', gp.avatar)) END AS guest,
      CASE WHEN i.id IS NULL THEN NULL ELSE jsonb_build_object('username', i.username, 'avatar_config', i.avatar_config) END AS invitee
    FROM rpg_arena_rooms r JOIN "User" h ON h.id=r."hostId"
    LEFT JOIN "User" g ON g.id=r."guestId" LEFT JOIN "User" i ON i.id=r."inviteeId"
    LEFT JOIN rpg_players hp ON hp."userId"=h.id LEFT JOIN rpg_players gp ON gp."userId"=g.id
    WHERE r.id=${id}`;
  return room ?? null;
}
async function view(
  tx: Tx,
  userId: string,
  now: Date,
  id?: string,
  hydrate = true
): Promise<ArenaState> {
  const invitations = hydrate
    ? await tx.rpgArenaRoom.findMany({
        where: {
          inviteeId: userId,
          inviteExpiresAt: { gt: now },
          hostSeenAt: { gt: new Date(now.getTime() - ARENA_ONLINE_MS) },
        },
        include: { host: { select: userSelect } },
        take: 20,
      })
    : [];
  const room = id ? await roomSnapshot(tx, id) : null;
  if (room) member(room, userId);
  const follows =
    room && hydrate
      ? await tx.$queryRaw<{ id: string; username: string; avatar_config: unknown }[]>`
      SELECT u.id, u.username, u.avatar_config FROM "User" u
      JOIN "Follow" f ON f."followingId"=u.id AND f."followerId"=${userId}
      JOIN "Follow" rev ON rev."followerId"=u.id AND rev."followingId"=${userId}
      WHERE NOT EXISTS (SELECT 1 FROM user_blocks b WHERE
        (b."blockerId"=${userId} AND b."blockedId"=u.id) OR (b."blockerId"=u.id AND b."blockedId"=${userId}))
      ORDER BY u.id LIMIT 100`
      : [];
  const match = room ? matchOf(room) : null;
  const ownLanguage = room?.hostId === userId ? room.hostLanguage : room?.guestLanguage;
  const question =
    match?.status === 'active' && match.actorId === userId && ownLanguage
      ? codeChallenges(ownLanguage as BattleLanguage, match.level)[
          (match.scenario + Math.floor(match.turn / 2)) %
            codeChallenges(ownLanguage as BattleLanguage, match.level).length
        ]
      : null;
  const players = room
    ? [
        {
          user: room.host,
          language: room.hostLanguage,
          position: room.hostPosition,
          seen: room.hostSeenAt,
        },
        ...(room.guest
          ? [
              {
                user: room.guest,
                language: room.guestLanguage!,
                position: room.guestPosition,
                seen: room.guestSeenAt!,
              },
            ]
          : []),
      ].map(({ user, language, position: p, seen }) => ({
        id: user.id,
        username: user.username,
        name: getAuthorDisplayName(user),
        avatar: { ...DEFAULT_AVATAR, ...((user.rpg_player?.avatar as Partial<Avatar>) ?? {}) },
        language: language as BattleLanguage,
        level: levelProgress(user.total_xp).level,
        position: p as ArenaPosition,
        online: now.getTime() - seen.getTime() < ARENA_ONLINE_MS,
      }))
    : [];
  return {
    selfId: userId,
    serverTime: now.toISOString(),
    lobbyUnchanged: !hydrate,
    room: room
      ? {
          id: room.id,
          hostId: room.hostId,
          version: room.version,
          players,
          invitedName:
            room.invitee && room.inviteExpiresAt && room.inviteExpiresAt > now
              ? getAuthorDisplayName(room.invitee)
              : null,
          match,
          question,
        }
      : null,
    invitations: invitations.map((r) => ({
      roomId: r.id,
      hostName: getAuthorDisplayName(r.host),
      expiresAt: r.inviteExpiresAt!.toISOString(),
    })),
    friends: follows.map((u) => ({
      id: u.id,
      username: u.username,
      name: getAuthorDisplayName(u),
    })),
  };
}

export async function arena(userId: string, action: ArenaAction): Promise<ArenaState> {
  let codeRun: CodeRun | undefined;
  const admissionIds = [userId];
  if (action.type === 'accept') {
    const invitation = await prisma.rpgArenaRoom.findUnique({
      where: { id: action.roomId },
      select: { hostId: true },
    });
    if (invitation) admissionIds.push(invitation.hostId);
  }
  if (action.type === 'run') {
    await rateLimit(`arena-run:${userId}`, { limit: 12, window: '1 m', endpoint: '/api/mundinho' });
    // Compilers run without holding a room lock. The turn is checked again below.
    const room = await prisma.rpgArenaRoom.findUnique({ where: { id: action.roomId } });
    if (!room) throw new NotFoundError();
    member(room, userId);
    const match = matchOf(room);
    if (
      !match ||
      match.id !== action.matchId ||
      match.status !== 'active' ||
      match.actorId !== userId ||
      match.turn !== action.turn
    )
      invalid('Este turno já mudou. Atualize a arena.');
    const language = (
      room.hostId === userId ? room.hostLanguage : room.guestLanguage
    ) as BattleLanguage;
    const challenges = codeChallenges(language, match.level);
    const question = challenges[(match.scenario + Math.floor(match.turn / 2)) % challenges.length];
    if (question.id !== action.questionId) invalid('O desafio deste turno mudou.');
    const prepared = instrumentChallengeSource(language, action.code, question);
    if (prepared.error) codeRun = { passed: false, trace: [], error: prepared.error };
    else {
      const result = await executeCode(
        challengeProgram(language, prepared.source, question),
        challengeExecutionLanguage(language)
      );
      codeRun = result.ok
        ? evaluateTrace(result.output, question)
        : {
            passed: false,
            trace: [],
            retryable: true,
            error: result.error ?? 'Executor indisponível. Seu turno foi preservado.',
          };
    }
  }
  return prisma.$transaction(
    async (tx) => {
      // All admissions lock both identities in the same order. Accepting another
      // room cannot race a friend's acceptance into your own room.
      if (action.type === 'enter' || action.type === 'accept')
        for (const id of [...new Set(admissionIds)].sort())
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`arena-user:${id}`}))`;
      const locked =
        'roomId' in action
          ? await tx.$queryRaw<
              (RpgArenaRoom & { serverNow: Date })[]
            >`SELECT *, clock_timestamp() AS "serverNow" FROM rpg_arena_rooms WHERE id = ${action.roomId} FOR UPDATE`
          : [];
      let room: RpgArenaRoom | null = locked[0] ?? null;
      const now =
        locked[0]?.serverNow ??
        (await tx.$queryRaw<{ now: Date }[]>`SELECT clock_timestamp() AS now`)[0].now;
      if (action.type === 'inbox') return view(tx, userId, now);
      if (action.type === 'enter') {
        const existing = await activeRoom(tx, userId, now);
        if (existing) {
          if (existing.guestId && !(await mutual(tx, existing.hostId, existing.guestId))) {
            await tx.rpgArenaRoom.update({
              where: { id: existing.id },
              data: {
                guestId: null,
                guestLanguage: null,
                guestSeenAt: null,
                match: Prisma.DbNull,
                version: { increment: 1 },
              },
            });
            if (userId !== existing.hostId)
              throw new ForbiddenError(
                'ARENA_MUTUAL',
                'Vocês precisam se seguir mutuamente para entrar.'
              );
          }
          return view(tx, userId, now, existing.id);
        }
        const joined = await tx.rpgArenaRoom.findUnique({ where: { guestId: userId } });
        if (
          joined &&
          joined.guestSeenAt &&
          joined.guestSeenAt.getTime() > 0 &&
          now.getTime() - joined.hostSeenAt.getTime() < ARENA_ONLINE_MS &&
          (await mutual(tx, joined.hostId, userId))
        ) {
          const resumed = await tx.rpgArenaRoom.updateMany({
            where: { id: joined.id, guestId: userId },
            data: { guestSeenAt: now, version: { increment: 1 } },
          });
          if (resumed.count) return view(tx, userId, now, joined.id);
        }
        const old = await tx.rpgArenaRoom.findUnique({ where: { hostId: userId } });
        // A host's disconnect does not erase an arena occupied by the invited friend.
        if (
          old?.guestId &&
          old.guestSeenAt &&
          now.getTime() - old.guestSeenAt.getTime() < ARENA_ONLINE_MS
        ) {
          await tx.rpgArenaRoom.update({ where: { id: old.id }, data: { hostSeenAt: now } });
          return view(tx, userId, now, old.id);
        }
        await tx.rpgArenaRoom.updateMany({
          where: { guestId: userId },
          data: {
            guestId: null,
            guestLanguage: null,
            guestSeenAt: null,
            match: Prisma.DbNull,
            version: { increment: 1 },
          },
        });
        const room = await tx.rpgArenaRoom.upsert({
          where: { hostId: userId },
          create: { hostId: userId, hostLanguage: action.language, hostSeenAt: now },
          update: {
            hostLanguage: action.language,
            hostSeenAt: now,
            hostPosition: spawn(),
            guestId: null,
            guestLanguage: null,
            guestSeenAt: null,
            inviteeId: null,
            inviteExpiresAt: null,
            match: Prisma.DbNull,
            version: { increment: 1 },
          },
        });
        return view(tx, userId, now, room.id);
      }
      if (!room) throw new NotFoundError('ARENA_NOT_FOUND', 'A arena não está mais disponível.');
      if (action.type === 'decline') {
        if (room.inviteeId !== userId) throw new ForbiddenError();
        await tx.rpgArenaRoom.update({
          where: { id: room.id },
          data: { inviteeId: null, inviteExpiresAt: null, version: { increment: 1 } },
        });
        return view(tx, userId, now);
      }
      if (action.type === 'accept') {
        if (room.guestId === userId) {
          if (!room.guestSeenAt?.getTime() || !(await mutual(tx, room.hostId, userId)))
            throw new ForbiddenError(
              'ARENA_MUTUAL',
              'Vocês precisam se seguir mutuamente e estar nesta arena.'
            );
          return view(tx, userId, now, room.id);
        }
        if (room.inviteeId !== userId || !room.inviteExpiresAt || room.inviteExpiresAt <= now)
          invalid('Este convite expirou ou não pertence a você.');
        if (room.guestId || now.getTime() - room.hostSeenAt.getTime() >= ARENA_ONLINE_MS)
          invalid('O anfitrião saiu ou a arena já está ocupada.');
        if (!(await mutual(tx, room.hostId, userId)))
          throw new ForbiddenError(
            'ARENA_MUTUAL',
            'Vocês precisam se seguir mutuamente para entrar.'
          );
        const own = await activeRoom(tx, userId, now);
        if (own && own.id !== room.id && (own.guestId || matchOf(own)?.status === 'active'))
          invalid('Saia da sua arena atual antes de aceitar outro convite.');
        await tx.rpgArenaRoom.updateMany({
          where: { guestId: userId },
          data: {
            guestId: null,
            guestLanguage: null,
            guestSeenAt: null,
            match: Prisma.DbNull,
            version: { increment: 1 },
          },
        });
        // Invalidate invitations from a prior empty personal arena when joining a friend.
        await tx.rpgArenaRoom.updateMany({
          where: { hostId: userId },
          data: {
            hostSeenAt: new Date(0),
            inviteeId: null,
            inviteExpiresAt: null,
            version: { increment: 1 },
          },
        });
        const users = await tx.user.findMany({
          where: { id: { in: [userId, room.hostId] } },
          select: { total_xp: true },
        });
        const match: ArenaMatch = {
          id: randomUUID(),
          status: 'ready',
          ready: [],
          hp: { [room.hostId]: 100, [userId]: 100 },
          actorId: room.hostId,
          turn: 0,
          scenario: randomInt(codeChallenges('JS').length),
          level: Math.min(3, ...users.map((u) => levelProgress(u.total_xp).level)),
          deadline: now.toISOString(),
          winnerId: null,
          log: ['Dois aventureiros na arena. Confirmem para começar.'],
        };
        await tx.rpgArenaRoom.update({
          where: { id: room.id },
          data: {
            guestId: userId,
            guestLanguage: action.language,
            guestSeenAt: now,
            guestPosition: spawn(true),
            inviteeId: null,
            inviteExpiresAt: null,
            match: match as unknown as Prisma.InputJsonValue,
            version: { increment: 1 },
          },
        });
        return view(tx, userId, now, room.id);
      }
      member(room, userId);
      const lastSeen = room.hostId === userId ? room.hostSeenAt : room.guestSeenAt;
      if (action.type !== 'leave' && lastSeen?.getTime() === 0)
        throw new ForbiddenError(
          'ARENA_LEFT',
          'Você já saiu desta arena. Entre novamente pelo buraco.'
        );
      if (room.guestId && !(await mutual(tx, room.hostId, room.guestId))) {
        const guest = room.guestId;
        await tx.rpgArenaRoom.update({
          where: { id: room.id },
          data: {
            guestId: null,
            guestLanguage: null,
            guestSeenAt: null,
            match: Prisma.DbNull,
            version: { increment: 1 },
          },
        });
        if (userId === guest)
          return {
            ...(await view(tx, userId, now)),
            notice: 'A arena foi encerrada porque vocês não são mais amigos mútuos.',
          };
        room = (await tx.rpgArenaRoom.findUnique({ where: { id: room.id } }))!;
      }
      let match = matchOf(room);
      const patch: Prisma.RpgArenaRoomUpdateInput = { version: { increment: 1 } };
      const host = room.hostId === userId;
      if (action.type === 'leave') {
        if (match?.status === 'active')
          match = {
            ...match,
            status: 'finished',
            winnerId: host ? room.guestId : room.hostId,
            log: [...match.log, 'O adversário deixou a arena. Vitória por desistência.'].slice(-8),
          };
        await tx.rpgArenaRoom.update({
          where: { id: room.id },
          data: {
            ...patch,
            ...(host
              ? { hostSeenAt: new Date(0), invitee: { disconnect: true }, inviteExpiresAt: null }
              : { guestSeenAt: new Date(0) }),
            ...(match ? { match: match as unknown as Prisma.InputJsonValue } : {}),
          },
        });
        return view(tx, userId, now);
      }
      if (host) patch.hostSeenAt = now;
      else patch.guestSeenAt = now;
      const otherSeen = host ? room.guestSeenAt : room.hostSeenAt;
      if (match?.status === 'active' && otherSeen && now.getTime() - otherSeen.getTime() > 90_000) {
        match = {
          ...match,
          status: 'finished',
          winnerId: userId,
          log: [...match.log, 'O adversário desconectou. Vitória por desconexão.'].slice(-8),
        };
      } else if (match?.status === 'active' && new Date(match.deadline) <= now) {
        match = advanceArenaTurn(
          match,
          false,
          now,
          'Tempo esgotado. O turno passou para o adversário.'
        );
      }
      if (action.type === 'sync' && action.position && match?.status !== 'active') {
        const old = (host ? room.hostPosition : room.guestPosition) as ArenaPosition;
        const elapsed = now.getTime() - (host ? room.hostSeenAt : room.guestSeenAt!).getTime();
        if (validArenaPosition(old, action.position, elapsed)) {
          if (host) patch.hostPosition = action.position;
          else patch.guestPosition = action.position;
        }
      }
      if (action.type === 'invite') {
        if (!host) throw new ForbiddenError('ARENA_HOST', 'Somente o anfitrião pode convidar.');
        if (
          room.guestId &&
          room.guestSeenAt &&
          now.getTime() - room.guestSeenAt.getTime() < ARENA_ONLINE_MS
        )
          invalid('Já há um amigo nesta arena.');
        if (match?.status === 'active')
          invalid('Encerre a batalha antes de convidar outra pessoa.');
        if (!(await mutual(tx, userId, action.friendId)))
          throw new ForbiddenError(
            'ARENA_MUTUAL',
            'Convide alguém que segue você e que você também segue.'
          );
        if (
          room.inviteExpiresAt &&
          room.inviteExpiresAt > now &&
          room.inviteeId &&
          room.inviteeId !== action.friendId
        )
          invalid('Aguarde o convite atual expirar antes de convidar outro amigo.');
        patch.invitee = { connect: { id: action.friendId } };
        patch.inviteExpiresAt = new Date(now.getTime() + ARENA_INVITE_MS);
        patch.guest = { disconnect: true };
        patch.guestLanguage = null;
        patch.guestSeenAt = null;
        match = null;
      }
      if (action.type === 'ready') {
        if (!room.guestId || !otherSeen || now.getTime() - otherSeen.getTime() > ARENA_ONLINE_MS)
          invalid('Espere seu amigo ficar online na arena.');
        if (match?.status === 'finished')
          match = {
            ...match,
            id: randomUUID(),
            status: 'ready',
            ready: [],
            hp: { [room.hostId]: 100, [room.guestId]: 100 },
            turn: 0,
            winnerId: null,
            scenario: match.scenario + 1,
            log: ['Revanche solicitada. Confirmem para começar.'],
          };
        if (!match || match.status !== 'ready') invalid('Esta batalha já foi iniciada.');
        match = { ...match, ready: [...new Set([...match.ready, userId])] };
        if (match.ready.length === 2)
          match = {
            ...match,
            status: 'active',
            actorId: randomInt(2) ? room.hostId : room.guestId,
            deadline: new Date(now.getTime() + ARENA_TURN_MS).toISOString(),
            log: ['Batalha iniciada! Resolva o desafio para causar 30 de dano.'],
          };
      }
      let notice: string | undefined;
      if (action.type === 'run') {
        if (
          !match ||
          match.id !== action.matchId ||
          match.status !== 'active' ||
          match.actorId !== userId ||
          match.turn !== action.turn
        ) {
          notice = 'O turno mudou durante a execução. Nenhum golpe foi repetido.';
          codeRun = undefined;
        } else if (action.submit && codeRun && !codeRun.retryable)
          match = advanceArenaTurn(
            match,
            codeRun.passed,
            now,
            codeRun.passed
              ? 'Código correto! 30 de dano no adversário.'
              : 'O código não passou. Turno do adversário.'
          );
      }
      patch.match = match ? (match as unknown as Prisma.InputJsonValue) : Prisma.DbNull;
      await tx.rpgArenaRoom.update({ where: { id: room.id }, data: patch });
      return {
        ...(await view(
          tx,
          userId,
          now,
          room.id,
          action.type === 'invite' || (action.type === 'sync' && action.lobby === true)
        )),
        ...(codeRun ? { codeRun } : {}),
        ...(notice ? { notice } : {}),
      };
    },
    { timeout: 15_000, maxWait: 10_000 }
  );
}
