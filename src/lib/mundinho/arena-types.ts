import type { Avatar, BattleLanguage, CodeRun, PublicQuestion } from './types';

export type ArenaPosition = { x: number; y: number; direction: string; walking: boolean };
export type ArenaMatch = {
  id: string;
  status: 'ready' | 'active' | 'finished';
  ready: string[];
  hp: Record<string, number>;
  actorId: string;
  turn: number;
  scenario: number;
  level: number;
  deadline: string;
  winnerId: string | null;
  log: string[];
};
export type ArenaPlayer = {
  id: string;
  name: string;
  username: string;
  avatar: Avatar;
  language: BattleLanguage;
  level: number;
  online: boolean;
  position: ArenaPosition;
};
export type ArenaInvitation = { roomId: string; hostName: string; expiresAt: string };
export type ArenaState = {
  selfId: string;
  serverTime: string;
  room: null | {
    id: string;
    hostId: string;
    version: number;
    players: ArenaPlayer[];
    invitedName: string | null;
    match: ArenaMatch | null;
    question: PublicQuestion | null;
  };
  friends: { id: string; name: string; username: string }[];
  invitations: ArenaInvitation[];
  codeRun?: CodeRun;
  notice?: string;
  lobbyUnchanged?: boolean;
};
export type ArenaAction =
  | { type: 'inbox' }
  | { type: 'enter'; language: BattleLanguage }
  | { type: 'invite'; roomId: string; friendId: string }
  | { type: 'accept'; roomId: string; language: BattleLanguage }
  | { type: 'decline'; roomId: string }
  | { type: 'sync'; roomId: string; position?: ArenaPosition; lobby?: boolean }
  | { type: 'leave'; roomId: string }
  | { type: 'ready'; roomId: string }
  | {
      type: 'run';
      roomId: string;
      matchId: string;
      turn: number;
      questionId: string;
      code: string;
      submit: boolean;
    };
export type ArenaTransport = (action: ArenaAction) => Promise<ArenaState>;
