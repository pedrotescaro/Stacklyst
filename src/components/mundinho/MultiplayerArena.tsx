'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalizedText } from '../../i18n/useLocalizedText';
import { translateMundinho } from '../../lib/mundinho/i18n';
import { ArrowLeft, Check, Swords, UserPlus, X } from 'lucide-react';
import type {
  ArenaAction,
  ArenaPosition,
  ArenaState,
  ArenaTransport,
} from '../../lib/mundinho/arena-types';
import { LANGUAGE_NAMES, type BattleLanguage } from '../../lib/mundinho/types';
import { ARENA } from '../../lib/mundinho/arena-rules';
import type { BattleAudio } from '../../lib/mundinho/battleAudio';
import { SKILL_CHALLENGE, SKILLS } from '../../lib/mundinho/rules';
import World from './World';
import { PixelAvatar } from './PixelArt';
import { PixelMeter } from './PixelMeter';
import { HIT_MS, HitSpark, useHits } from './BattleHit';
import { CodeBattle } from './CodeBattle';
import { QuizChallenge } from './QuizChallenge';
import { adventureAsset } from './assets';
import { RetroTransition, useRetroTransition } from './RetroTransition';

const ROOM_SYNC_MS = 600;
const PEER_SYNC_MS = 160;
const LOBBY_SYNC_MS = 7200;

export function MultiplayerArena({
  audio,
  transport,
  language,
  initialState,
  assetBase,
  onLeave,
}: {
  audio?: Pick<BattleAudio, 'play' | 'setBattle'>;
  transport: ArenaTransport;
  language: BattleLanguage;
  initialState?: ArenaState | null;
  assetBase: string;
  /** `via` is 'portal' when the player dropped into the exit stairs. */
  onLeave: (via?: 'portal') => void;
}) {
  const { text, language: uiLanguage, locale } = useLocalizedText();
  const m = (value: string) => translateMundinho(value, uiLanguage);
  const [data, setData] = useState<ArenaState | null>(initialState ?? null);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [playersOpen, setPlayersOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(0);
  const [outcome, setOutcome] = useState<ArenaState | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { transition, play: playTransition } = useRetroTransition(stage);
  const playersDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = playersDialog.current;
    if (playersOpen) dialog?.showModal();
    else dialog?.close();
  }, [playersOpen]);
  const roomRef = useRef(initialState?.room?.id);
  const active = useRef(true);
  const position = useRef<ArenaPosition>({ ...ARENA.spawn, direction: 'down', walking: false });
  const lastVersion = useRef(initialState?.room?.version ?? -1);
  const lastMatch = useRef(initialState?.room?.match);
  const syncInterval = useRef(ROOM_SYNC_MS);
  const actionPending = useRef(false);
  const apply = useCallback(
    (next: ArenaState) => {
      if (!active.current) return;
      if (next.room && next.room.id === roomRef.current && next.room.version < lastVersion.current)
        return;
      const match = next.room?.match;
      const previous = lastMatch.current;
      if (
        next.room?.id === roomRef.current &&
        match &&
        previous?.id === match.id &&
        previous.status === 'active'
      ) {
        if (audio && match.turn > previous.turn) {
          const changes = Object.entries(match.hp).map(([id, hp]) => ({
            id,
            delta: hp - (previous.hp[id] ?? hp),
          }));
          const hurt = changes.some(({ id, delta }) => id === next.selfId && delta < 0);
          const hit = changes.some(({ id, delta }) => id !== next.selfId && delta < 0);
          if (hurt || hit || match.turnOutcome === 'miss') {
            audio.play('attack');
            audio.play(hurt ? 'hurt' : hit ? 'hit' : 'miss');
          }
          if (changes.some(({ delta }) => delta > 0)) audio.play('heal');
        }
        if (match.status === 'finished') setOutcome(next);
      }
      lastMatch.current = match;
      syncInterval.current =
        match?.status !== 'active' &&
        next.room?.players.some((p) => p.id !== next.selfId && p.online)
          ? PEER_SYNC_MS
          : ROOM_SYNC_MS;
      roomRef.current = next.room?.id;
      lastVersion.current = next.room?.version ?? -1;
      setData((current) =>
        next.lobbyUnchanged
          ? { ...next, friends: current?.friends ?? [], invitations: current?.invitations ?? [] }
          : next
      );
    },
    [audio]
  );
  useEffect(() => {
    active.current = true;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    let lastLobbySync = performance.now();
    const sync = async () => {
      const started = performance.now();
      let failed = false;
      try {
        if (active.current && document.visibilityState === 'visible' && roomRef.current) {
          const lobby = started - lastLobbySync >= LOBBY_SYNC_MS;
          const next = await transport({
            type: 'sync',
            roomId: roomRef.current,
            position: position.current,
            lobby,
          });
          if (!stopped && active.current) {
            if (lobby) lastLobbySync = started;
            apply(next);
            setConnectionError('');
          }
        }
      } catch (e) {
        failed = true;
        if (!stopped && active.current)
          setConnectionError(
            e instanceof Error
              ? e.message
              : text('Reconectando à arena…', 'Reconnecting to the arena…')
          );
      } finally {
        if (!stopped && active.current) {
          const interval =
            document.visibilityState === 'visible' ? syncInterval.current : ROOM_SYNC_MS;
          const delay = failed ? 1000 : Math.max(80, interval - (performance.now() - started));
          timer = setTimeout(sync, delay);
        }
      }
    };
    const enter = async () => {
      try {
        const next = initialState?.room
          ? initialState
          : await transport({ type: 'enter', language });
        if (stopped) return;
        const own = next.room?.players.find((p) => p.id === next.selfId);
        if (own) position.current = own.position;
        apply(next);
        timer = setTimeout(sync, syncInterval.current);
      } catch (e) {
        if (!stopped)
          setError(
            e instanceof Error ? e.message : text('Não foi possível entrar.', 'Could not join.')
          );
      }
    };
    void enter();
    return () => {
      stopped = true;
      active.current = false;
      clearTimeout(timer);
      const id = roomRef.current;
      if (id) void transport({ type: 'leave', roomId: id }).catch(() => {});
    };
  }, [transport, language, initialState, apply, text]);
  const mutate = async (action: ArenaAction) => {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true);
    setError('');
    if (action.type === 'attack' || action.type === 'ready') audio?.play('select');
    try {
      const next = await transport(action);
      apply(next);
      return next;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : text('Não foi possível concluir. Tente novamente.', 'Could not finish. Try again.')
      );
    } finally {
      actionPending.current = false;
      setBusy(false);
    }
  };
  const leave = async (via?: 'portal') => {
    if (actionPending.current) return;
    if (via === 'portal') {
      // Dropping into the stairs: keep the room on screen, frozen, so the
      // player is seen sinking while the screen closes in. Applying the
      // server's "no room" reply here would unmount the arena first.
      active.current = false;
      const id = roomRef.current;
      roomRef.current = undefined;
      if (id) void transport({ type: 'leave', roomId: id }).catch(() => {});
      onLeave(via);
      return;
    }
    if (roomRef.current) {
      await mutate({ type: 'leave', roomId: roomRef.current });
    }
    roomRef.current = undefined;
    onLeave(via);
  };
  const rememberPose = useCallback((pose: ArenaPosition) => {
    position.current = pose;
  }, []);
  const activeMatchId = data?.room?.match?.status === 'active' ? data.room.match.id : undefined;
  useEffect(() => {
    if (!activeMatchId || !audio) return;
    audio.setBattle(true);
    audio.play('encounter');
    return () => audio.setBattle(false);
  }, [activeMatchId, audio]);
  useEffect(() => {
    if (!outcome?.room?.match) return;
    const winner = outcome.room.match.winnerId;
    const kind = winner ? (winner === outcome.selfId ? 'victory' : 'defeat') : 'return';
    const timer = setTimeout(() => {
      if (kind !== 'return') audio?.play(kind);
      playTransition(kind, () => setOutcome(null));
    }, HIT_MS);
    return () => clearTimeout(timer);
  }, [audio, outcome, playTransition]);
  const scene = outcome ?? data;
  const room = scene?.room;
  const self = room?.players.find((p) => p.id === scene?.selfId);
  const peer = room?.players.find((p) => p.id !== scene?.selfId);
  const match = room?.match;
  const inBattle = match?.status === 'active' || Boolean(outcome);
  const myTurn = match?.status === 'active' && match.actorId === scene?.selfId;
  // Totals arrive by polling; a drop in someone's HP is the hit to show.
  const hits = useHits(inBattle ? match?.hp : undefined, match?.id);
  const selfHit = Boolean(scene && hits[scene.selfId]);
  const result =
    match?.status === 'finished'
      ? match.winnerId === self?.id
        ? text('Você venceu!', 'You won!')
        : match.winnerId
          ? text('Você perdeu!', 'You lost!')
          : text('Empate!', 'Draw!')
      : null;
  useEffect(() => {
    if (match?.status === 'active') setPlayersOpen(false);
  }, [match?.status]);
  const friends =
    data?.friends.filter((friend) =>
      `${friend.name} ${friend.username}`.toLowerCase().includes(search.toLowerCase())
    ) ?? [];
  const content = (
    <section
      className={`ad-multiplayer ${inBattle ? '' : 'ad-arena-exploring'}`}
      aria-label={text('Arena multiplayer do Mundinho', 'World multiplayer arena')}
    >
      <header className="ad-arena-heading">
        <div>
          <h2>{text('Arena subterrânea', 'Underground arena')}</h2>
          <p>
            {text(
              'Seu mundo, um amigo e um duelo de programação.',
              'Your world, a friend and a programming duel.'
            )}
          </p>
        </div>
        <button
          type="button"
          className="ad-secondary"
          onClick={() => void leave()}
          disabled={busy || Boolean(outcome)}
        >
          <ArrowLeft size={16} /> {text('Voltar à clareira', 'Back to the clearing')}
        </button>
      </header>
      {error && (
        <p role="alert" className="ad-arena-message">
          {error}
        </p>
      )}
      {connectionError && (
        <p role="alert" className="ad-arena-message">
          {text('Conexão interrompida.', 'Connection lost.')} {connectionError}
        </p>
      )}
      {data?.notice && (
        <p role="status" className="ad-arena-message">
          {m(data.notice)}
        </p>
      )}
      {!room && !error && <p role="status">{text('Entrando na arena…', 'Entering the arena…')}</p>}
      {!room && error && (
        <button type="button" onClick={() => onLeave()}>
          {text('Voltar e tentar novamente', 'Go back and try again')}
        </button>
      )}
      {room && self && scene && (
        <>
          {match && inBattle ? (
            <>
              <div
                className={`ad-pvp-scene${selfHit ? ' is-shaking' : ''}`}
                style={{
                  backgroundImage: `url(${adventureAsset('blue-battle.png', assetBase)})`,
                }}
              >
                {room.players.map((p) => (
                  <div
                    className={`ad-pvp-player${hits[p.id] ? ' is-hit' : ''}${
                      room.players.some((other) => other.id !== p.id && hits[other.id])
                        ? ' is-attacking'
                        : ''
                    }`}
                    data-pvp-side={p.id === scene.selfId ? 'self' : 'opponent'}
                    key={p.id}
                  >
                    <div className="ad-pvp-name">
                      <div className="battle-plate-head">
                        <strong>
                          {p.name}
                          {p.id === scene.selfId ? text(' (você)', ' (you)') : ''}
                        </strong>
                        <span className="battle-plate-level">
                          {text('Nv.', 'Lv.')} {p.level}
                        </span>
                      </div>
                      <span className="ad-combatant-meta">{LANGUAGE_NAMES[p.language]}</span>
                      <PixelMeter
                        value={match.hp[p.id]}
                        max={match.stats?.[p.id]?.maxHp ?? 100}
                        label={`${text('Vida de', 'HP of')} ${p.name}`}
                      />
                      <span className="ad-hp-number">
                        {match.hp[p.id]} / {match.stats?.[p.id]?.maxHp ?? 100} {text('PV', 'HP')}
                      </span>
                    </div>
                    <div className="battle-sprite ad-pvp-sprite">
                      <PixelAvatar
                        avatar={p.avatar}
                        direction={p.id === scene.selfId ? 'right' : 'down'}
                      />
                      {hits[p.id] && (
                        <span key={hits[p.id].key} className="ad-pvp-hit">
                          <HitSpark />
                          <span
                            className={`combat-damage${p.id === scene.selfId ? ' battle-damage-player' : ''}`}
                            aria-hidden="true"
                          >
                            −{hits[p.id].amount}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {outcome ? (
                <div className="ad-pvp-turn" role="status">
                  <Swords size={18} aria-hidden="true" />
                  <strong>{result}</strong>
                </div>
              ) : (
                <>
                  <div className="ad-pvp-turn" role="status">
                    <Swords size={18} />
                    <strong>
                      {myTurn
                        ? text('Seu turno', 'Your turn')
                        : text(
                            `Turno de ${peer?.name ?? 'seu amigo'}`,
                            `${peer?.name ?? 'Your friend'}'s turn`
                          )}
                    </strong>
                    <span>
                      {text('Turno', 'Turn')} {match.turn + 1} · {text('até', 'until')}{' '}
                      {new Date(match.deadline).toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {myTurn && room.question && !room.question.code ? (
                    <QuizChallenge
                      key={`${match.id}:${match.turn}`}
                      question={room.question}
                      busy={busy}
                      onAnswer={(answer) =>
                        void mutate({
                          type: 'answer',
                          roomId: room.id,
                          matchId: match.id,
                          turn: match.turn,
                          questionId: room.question!.id,
                          answer,
                        })
                      }
                    />
                  ) : myTurn && room.question ? (
                    <CodeBattle
                      key={`${match.id}:${match.turn}`}
                      question={room.question}
                      avatar={self.avatar}
                      busy={busy}
                      battleLanguage={self.language}
                      onExecute={async (code, submit) => {
                        const next = await mutate({
                          type: 'run',
                          roomId: room.id,
                          matchId: match.id,
                          turn: match.turn,
                          questionId: room.question!.id,
                          code,
                          submit,
                        });
                        return next ? { codeRun: next.codeRun } : undefined;
                      }}
                    />
                  ) : myTurn ? (
                    <div className="ad-battle-bottom-console">
                      <p className="ad-battle-odds">
                        {match.stats?.[self.id]?.directChance ?? 75}%{' '}
                        {text('de golpe direto', 'direct hit')} ·{' '}
                        {100 - (match.stats?.[self.id]?.directChance ?? 75)}%{' '}
                        {text('de exercício', 'exercise')}
                        <span>
                          {text('Proteção:', 'Protection:')} −
                          {match.stats?.[self.id]?.protection ?? 0} {text('por golpe', 'per hit')} ·{' '}
                          {text('Vida máxima:', 'Max HP:')} {match.stats?.[self.id]?.maxHp ?? 100}{' '}
                          {text('PV', 'HP')}
                        </span>
                      </p>
                      <div
                        className="ad-skills-grid"
                        role="group"
                        aria-label={text('Ações de batalha', 'Battle actions')}
                        onKeyDown={(event) => {
                          const offset = ['ArrowRight', 'ArrowDown', 'd', 's'].includes(event.key)
                            ? 1
                            : ['ArrowLeft', 'ArrowUp', 'a', 'w'].includes(event.key)
                              ? -1
                              : 0;
                          if (!offset || event.ctrlKey || event.metaKey || event.altKey) return;
                          event.preventDefault();
                          event.currentTarget
                            .querySelectorAll<HTMLButtonElement>('button')
                            [(selectedSkill + offset + SKILLS.length) % SKILLS.length]?.focus();
                        }}
                      >
                        {SKILLS.map((skill, index) => (
                          <button
                            key={skill.id}
                            type="button"
                            className="ad-skill-card-btn"
                            data-selected={selectedSkill === index}
                            onFocus={() => setSelectedSkill(index)}
                            disabled={busy}
                            onClick={() =>
                              void mutate({
                                type: 'attack',
                                roomId: room.id,
                                matchId: match.id,
                                turn: match.turn,
                                skill: skill.id,
                              })
                            }
                          >
                            <span className="rpg-selection-cursor" aria-hidden="true" />
                            <strong>{m(skill.name)}</strong>
                            <small>{m(skill.description)}</small>
                            <em className="ad-skill-challenge">
                              {SKILL_CHALLENGE[skill.id] === 'concept'
                                ? text('Quiz de conceito', 'Concept quiz')
                                : SKILL_CHALLENGE[skill.id] === 'bug'
                                  ? text('Encontre o erro', 'Find the bug')
                                  : text('Exercício de código', 'Code exercise')}
                            </em>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="ad-arena-message">
                      {text('Seu amigo está jogando em', 'Your friend is playing in')}{' '}
                      {LANGUAGE_NAMES[peer?.language ?? language]}.{' '}
                      {text(
                        'A batalha atualiza automaticamente.',
                        'The battle updates automatically.'
                      )}
                    </p>
                  )}
                  <p className="ad-arena-rule">
                    {text(
                      'O golpe escolhido define dano, cura e desgaste. Submeter encerra o turno. Executar apenas testa. Dois minutos por turno. Sorte reduz exercícios, proteção reduz dano e relíquias aumentam a vida. Os bônus são fixados no início de cada partida.',
                      'The chosen move sets damage, healing and recoil. Submitting ends the turn. Running only tests. Two minutes per turn. Luck reduces exercises, protection reduces damage and relics increase HP. Bonuses are locked in at the start of each match.'
                    )}
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <div className="ad-arena-layout">
                <World
                  key={room.id}
                  area="arena"
                  avatar={self.avatar}
                  username={self.name}
                  assetBase={assetBase}
                  initialPosition={position.current}
                  peers={peer ? [peer] : []}
                  onPoseChange={rememberPose}
                  onEncounter={() => {}}
                  onChest={async () => ({ awarded: false, reward: 0 })}
                  onPortal={() => void leave('portal')}
                  onArenaPlayers={() => setPlayersOpen(true)}
                  arenaPlayersLabel={
                    peer
                      ? text('Adversário e batalha', 'Opponent and battle')
                      : text('Convidar amigo', 'Invite friend')
                  }
                  overlayOpen={playersOpen || Boolean(transition)}
                />
                <dialog
                  ref={playersDialog}
                  className="ad-arena-dialog"
                  aria-labelledby="arena-players-title"
                  onCancel={() => setPlayersOpen(false)}
                  onClose={() => setPlayersOpen(false)}
                  onClick={(event) => {
                    if (event.target === event.currentTarget) setPlayersOpen(false);
                  }}
                >
                  <div className="ad-arena-social">
                    <header className="ad-arena-dialog-heading">
                      <h3 id="arena-players-title">
                        {peer
                          ? text('Seu adversário', 'Your opponent')
                          : text('Chame um amigo', 'Call a friend')}
                      </h3>
                      <button
                        type="button"
                        className="ad-secondary"
                        aria-label={text('Fechar jogadores', 'Close players')}
                        onClick={() => setPlayersOpen(false)}
                      >
                        <X size={18} />
                      </button>
                    </header>
                    {result && (
                      <div className="ad-arena-result" role="status">
                        <strong>{result}</strong>
                        <p>{m(match?.log.at(-1) ?? '')}</p>
                      </div>
                    )}
                    {peer ? (
                      <>
                        <div className="ad-arena-friend">
                          <PixelAvatar avatar={peer.avatar} />
                          <div>
                            <strong>{peer.name}</strong>
                            <span>
                              @{peer.username} · {text('Nível', 'Level')} {peer.level}
                              <br />
                              {LANGUAGE_NAMES[peer.language]} ·{' '}
                              {peer.online
                                ? text('Na arena', 'In the arena')
                                : text('Reconectando…', 'Reconnecting…')}
                            </span>
                          </div>
                        </div>
                        {match?.stats?.[self.id] && (
                          <p>
                            {text('Bônus desta partida:', 'Bonuses this match:')}{' '}
                            {match.stats[self.id].maxHp} {text('PV', 'HP')} ·{' '}
                            {text('Proteção', 'Protection')} {match.stats[self.id].protection} ·{' '}
                            {text('Golpe direto', 'Direct hit')} {match.stats[self.id].directChance}
                            %.
                          </p>
                        )}
                        {match?.stats?.[peer.id] && (
                          <p>
                            {text('Equipamentos de', 'Equipment of')} {peer.name}:{' '}
                            {match.stats[peer.id].maxHp} {text('PV', 'HP')} ·{' '}
                            {text('Proteção', 'Protection')} {match.stats[peer.id].protection} ·{' '}
                            {text('Golpe direto', 'Direct hit')} {match.stats[peer.id].directChance}
                            %.
                          </p>
                        )}
                        <p>
                          {text('Você joga em', 'You play in')} {LANGUAGE_NAMES[self.language]}.{' '}
                          {text('Seu amigo joga em', 'Your friend plays in')}{' '}
                          {LANGUAGE_NAMES[peer.language]}.
                        </p>
                        <button
                          type="button"
                          className="ad-primary"
                          disabled={
                            busy ||
                            !peer.online ||
                            (match?.status === 'ready' && match.ready.includes(self.id))
                          }
                          onClick={() => void mutate({ type: 'ready', roomId: room.id })}
                        >
                          <Swords size={18} />
                          {match?.status === 'ready' && match.ready.includes(self.id)
                            ? text('Esperando seu amigo', 'Waiting for your friend')
                            : match?.status === 'finished'
                              ? text('Jogar novamente', 'Play again')
                              : text('Estou pronto para batalhar', 'I am ready to battle')}
                        </button>
                        <p className="ad-arena-rule">
                          {text(
                            'A batalha começa quando os dois confirmarem.',
                            'The battle starts when both of you confirm.'
                          )}
                        </p>
                      </>
                    ) : room.hostId === self.id ? (
                      <>
                        <p>
                          {text(
                            'Convide alguém que você segue e que também segue você. O convite vale por cinco minutos.',
                            'Invite someone you follow who also follows you. The invitation lasts five minutes.'
                          )}
                        </p>
                        {room.invitedName && (
                          <p role="status" className="ad-arena-message">
                            <Check size={16} /> {text('Convite enviado para', 'Invitation sent to')}{' '}
                            {room.invitedName}.
                          </p>
                        )}
                        <label className="ad-arena-search">
                          {text('Buscar amigo', 'Search friend')}
                          <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={text('Nome ou @usuário', 'Name or @username')}
                          />
                        </label>
                        {!scene.friends.length && (
                          <p>
                            {text(
                              'Nenhum amigo mútuo ainda. Vocês precisam se seguir para jogar juntos.',
                              'No mutual friends yet. You need to follow each other to play together.'
                            )}
                          </p>
                        )}
                        {scene.friends.length > 0 && !friends.length && (
                          <p>{text('Nenhum amigo encontrado.', 'No friends found.')}</p>
                        )}
                        <ul className="ad-arena-friends">
                          {friends.map((friend) => (
                            <li key={friend.id}>
                              <div>
                                <strong>{friend.name}</strong>
                                <span>@{friend.username}</span>
                              </div>
                              <button
                                type="button"
                                disabled={busy || Boolean(room.invitedName)}
                                aria-label={`${text('Convidar', 'Invite')} ${friend.name}`}
                                onClick={() =>
                                  void mutate({
                                    type: 'invite',
                                    roomId: room.id,
                                    friendId: friend.id,
                                  })
                                }
                              >
                                <UserPlus size={17} />
                                <span>{text('Convidar', 'Invite')}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p>
                        {text(
                          'O anfitrião está reconectando. Você pode aguardar ou voltar à clareira.',
                          'The host is reconnecting. You can wait or go back to the clearing.'
                        )}
                      </p>
                    )}
                  </div>
                </dialog>
              </div>
            </>
          )}
          {match?.status === 'active' && (
            <ol className="ad-arena-log" aria-label={text('Histórico da batalha', 'Battle log')}>
              {match.log.map((line, i) => (
                <li key={`${i}:${line}`}>{m(line)}</li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
  return (
    <div ref={stage} className="ad-arena-stage">
      {content}
      {transition && <RetroTransition key={transition.id} state={transition} />}
    </div>
  );
}
