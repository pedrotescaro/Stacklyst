'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Swords, UserPlus, X } from 'lucide-react';
import type {
  ArenaAction,
  ArenaPosition,
  ArenaState,
  ArenaTransport,
} from '../../lib/mundinho/arena-types';
import { LANGUAGE_NAMES, type BattleLanguage } from '../../lib/mundinho/types';
import { ARENA } from '../../lib/mundinho/arena-rules';
import { SKILLS } from '../../lib/mundinho/rules';
import World from './World';
import { PixelAvatar } from './PixelArt';
import { PixelMeter } from './PixelMeter';
import { CodeBattle } from './CodeBattle';
import { adventureAsset } from './assets';

export function MultiplayerArena({
  transport,
  language,
  initialState,
  assetBase,
  onLeave,
}: {
  transport: ArenaTransport;
  language: BattleLanguage;
  initialState?: ArenaState | null;
  assetBase: string;
  onLeave: () => void;
}) {
  const [data, setData] = useState<ArenaState | null>(initialState ?? null);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [playersOpen, setPlayersOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(0);
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
  const actionPending = useRef(false);
  const apply = useCallback((next: ArenaState) => {
    if (!active.current) return;
    if (next.room && next.room.id === roomRef.current && next.room.version < lastVersion.current)
      return;
    roomRef.current = next.room?.id;
    lastVersion.current = next.room?.version ?? -1;
    setData((current) =>
      next.lobbyUnchanged
        ? { ...next, friends: current?.friends ?? [], invitations: current?.invitations ?? [] }
        : next
    );
  }, []);
  useEffect(() => {
    active.current = true;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    let syncCount = 0;
    const sync = async () => {
      try {
        if (document.visibilityState === 'visible' && roomRef.current) {
          const next = await transport({
            type: 'sync',
            roomId: roomRef.current,
            position: position.current,
            lobby: ++syncCount % 12 === 0,
          });
          if (!stopped) {
            apply(next);
            setConnectionError('');
          }
        }
      } catch (e) {
        if (!stopped) setConnectionError(e instanceof Error ? e.message : 'Reconectando à arena…');
      } finally {
        if (!stopped) timer = setTimeout(sync, 600);
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
        timer = setTimeout(sync, 1000);
      } catch (e) {
        if (!stopped) setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
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
  }, [transport, language, initialState, apply]);
  const mutate = async (action: ArenaAction) => {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true);
    setError('');
    try {
      const next = await transport(action);
      apply(next);
      return next;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível concluir. Tente novamente.');
    } finally {
      actionPending.current = false;
      setBusy(false);
    }
  };
  const leave = async () => {
    if (actionPending.current) return;
    if (roomRef.current) {
      await mutate({ type: 'leave', roomId: roomRef.current });
    }
    roomRef.current = undefined;
    onLeave();
  };
  const rememberPose = useCallback((pose: ArenaPosition) => {
    position.current = pose;
  }, []);
  const room = data?.room;
  const self = room?.players.find((p) => p.id === data?.selfId);
  const peer = room?.players.find((p) => p.id !== data?.selfId);
  const match = room?.match;
  const myTurn = match?.status === 'active' && match.actorId === data?.selfId;
  useEffect(() => {
    if (match?.status === 'active') setPlayersOpen(false);
  }, [match?.status]);
  const friends =
    data?.friends.filter((friend) =>
      `${friend.name} ${friend.username}`.toLowerCase().includes(search.toLowerCase())
    ) ?? [];
  return (
    <section
      className={`ad-multiplayer ${match?.status === 'active' ? '' : 'ad-arena-exploring'}`}
      aria-label="Arena multiplayer do Mundinho"
    >
      <header className="ad-arena-heading">
        <div>
          <h2>Arena subterrânea</h2>
          <p>Seu mundo, um amigo e um duelo de programação.</p>
        </div>
        <button type="button" className="ad-secondary" onClick={() => void leave()} disabled={busy}>
          <ArrowLeft size={16} /> Voltar à clareira
        </button>
      </header>
      {error && (
        <p role="alert" className="ad-arena-message">
          {error}
        </p>
      )}
      {connectionError && (
        <p role="alert" className="ad-arena-message">
          Conexão interrompida. {connectionError}
        </p>
      )}
      {data?.notice && (
        <p role="status" className="ad-arena-message">
          {data.notice}
        </p>
      )}
      {!room && !error && <p role="status">Entrando na arena…</p>}
      {!room && error && (
        <button type="button" onClick={onLeave}>
          Voltar e tentar novamente
        </button>
      )}
      {room && self && (
        <>
          {match?.status === 'active' ? (
            <>
              <div
                className="ad-pvp-scene"
                style={{
                  backgroundImage: `url(${adventureAsset('battle-background.png', assetBase)})`,
                }}
              >
                {room.players.map((p) => (
                  <div
                    className="ad-pvp-player"
                    data-pvp-side={p.id === data.selfId ? 'self' : 'opponent'}
                    key={p.id}
                  >
                    <div className="ad-pvp-name">
                      <strong>
                        {p.name}
                        {p.id === data.selfId ? ' (você)' : ''}
                      </strong>
                      <span>
                        {LANGUAGE_NAMES[p.language]} · Nível {p.level}
                      </span>
                      <PixelMeter
                        value={match.hp[p.id]}
                        max={match.stats?.[p.id]?.maxHp ?? 100}
                        label={`Vida de ${p.name}`}
                      />
                      <span>
                        {match.hp[p.id]} / {match.stats?.[p.id]?.maxHp ?? 100} PV
                      </span>
                    </div>
                    <PixelAvatar
                      avatar={p.avatar}
                      direction={p.id === data.selfId ? 'right' : 'down'}
                    />
                  </div>
                ))}
              </div>
              <div className="ad-pvp-turn" role="status">
                <Swords size={18} />
                <strong>{myTurn ? 'Seu turno' : `Turno de ${peer?.name ?? 'seu amigo'}`}</strong>
                <span>
                  Turno {match.turn + 1} · até{' '}
                  {new Date(match.deadline).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {myTurn && room.question ? (
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
                    {match.stats?.[self.id]?.directChance ?? 75}% de golpe direto ·{' '}
                    {100 - (match.stats?.[self.id]?.directChance ?? 75)}% de exercício
                    <span>
                      Proteção: −{match.stats?.[self.id]?.protection ?? 0} por golpe · Vida máxima:{' '}
                      {match.stats?.[self.id]?.maxHp ?? 100} PV
                    </span>
                  </p>
                  <div
                    className="ad-skills-grid"
                    role="group"
                    aria-label="Ações de batalha"
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
                        <strong>{skill.name}</strong>
                        <small>{skill.description}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="ad-arena-message">
                  Seu amigo está jogando em {LANGUAGE_NAMES[peer?.language ?? language]}. A batalha
                  atualiza automaticamente.
                </p>
              )}
              <p className="ad-arena-rule">
                O golpe escolhido define dano, cura e desgaste. Submeter encerra o turno. Executar
                apenas testa. Dois minutos por turno. Sorte reduz exercícios, proteção reduz dano e
                relíquias aumentam a vida. Os bônus são fixados no início de cada partida.
              </p>
            </>
          ) : (
            <>
              <div className="ad-arena-layout">
                <button
                  type="button"
                  className="ad-secondary ad-arena-players-button"
                  onClick={() => setPlayersOpen(true)}
                >
                  <Swords size={18} /> {peer ? 'Adversário e batalha' : 'Convidar amigo'}
                </button>
                <World
                  key={room.id}
                  area="arena"
                  avatar={self.avatar}
                  username={self.name}
                  assetBase={assetBase}
                  initialPosition={position.current}
                  peers={room.players.filter((p) => p.id !== data.selfId)}
                  onPoseChange={rememberPose}
                  onEncounter={() => {}}
                  onChest={async () => ({ awarded: false, reward: 0 })}
                  onPortal={() => void leave()}
                  onBack={() => void leave()}
                  onArenaPlayers={() => setPlayersOpen(true)}
                  overlayOpen={playersOpen}
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
                      <h3 id="arena-players-title">{peer ? 'Seu adversário' : 'Chame um amigo'}</h3>
                      <button
                        type="button"
                        className="ad-secondary"
                        aria-label="Fechar jogadores"
                        onClick={() => setPlayersOpen(false)}
                      >
                        <X size={18} />
                      </button>
                    </header>
                    {match?.status === 'finished' && (
                      <div className="ad-arena-result" role="status">
                        <strong>
                          {match.winnerId
                            ? `${room.players.find((p) => p.id === match.winnerId)?.name ?? 'Seu adversário'} venceu!`
                            : 'Empate!'}
                        </strong>
                        <p>{match.log.at(-1)}</p>
                      </div>
                    )}
                    {peer ? (
                      <>
                        <div className="ad-arena-friend">
                          <PixelAvatar avatar={peer.avatar} />
                          <div>
                            <strong>{peer.name}</strong>
                            <span>
                              @{peer.username} · Nível {peer.level}
                              <br />
                              {LANGUAGE_NAMES[peer.language]} ·{' '}
                              {peer.online ? 'Na arena' : 'Reconectando…'}
                            </span>
                          </div>
                        </div>
                        {match?.stats?.[self.id] && (
                          <p>
                            Bônus desta partida: {match.stats[self.id].maxHp} PV · Proteção{' '}
                            {match.stats[self.id].protection} · Golpe direto{' '}
                            {match.stats[self.id].directChance}%.
                          </p>
                        )}
                        {match?.stats?.[peer.id] && (
                          <p>
                            Equipamentos de {peer.name}: {match.stats[peer.id].maxHp} PV · Proteção{' '}
                            {match.stats[peer.id].protection} · Golpe direto{' '}
                            {match.stats[peer.id].directChance}%.
                          </p>
                        )}
                        <p>
                          Você joga em {LANGUAGE_NAMES[self.language]}. Seu amigo joga em{' '}
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
                            ? 'Esperando seu amigo'
                            : match?.status === 'finished'
                              ? 'Jogar novamente'
                              : 'Estou pronto para batalhar'}
                        </button>
                        <p className="ad-arena-rule">
                          A batalha começa quando os dois confirmarem.
                        </p>
                      </>
                    ) : room.hostId === self.id ? (
                      <>
                        <p>
                          Convide alguém que você segue e que também segue você. O convite vale por
                          cinco minutos.
                        </p>
                        {room.invitedName && (
                          <p role="status" className="ad-arena-message">
                            <Check size={16} /> Convite enviado para {room.invitedName}.
                          </p>
                        )}
                        <label className="ad-arena-search">
                          Buscar amigo
                          <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nome ou @usuário"
                          />
                        </label>
                        {!data.friends.length && (
                          <p>
                            Nenhum amigo mútuo ainda. Vocês precisam se seguir para jogar juntos.
                          </p>
                        )}
                        {data.friends.length > 0 && !friends.length && (
                          <p>Nenhum amigo encontrado.</p>
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
                                aria-label={`Convidar ${friend.name}`}
                                onClick={() =>
                                  void mutate({
                                    type: 'invite',
                                    roomId: room.id,
                                    friendId: friend.id,
                                  })
                                }
                              >
                                <UserPlus size={17} />
                                <span>Convidar</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p>O anfitrião está reconectando. Você pode aguardar ou voltar à clareira.</p>
                    )}
                  </div>
                </dialog>
              </div>
            </>
          )}
          {match?.status === 'active' && (
            <ol className="ad-arena-log" aria-label="Histórico da batalha">
              {match.log.map((line, i) => (
                <li key={`${i}:${line}`}>{line}</li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
