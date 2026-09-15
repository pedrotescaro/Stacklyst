'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  X,
  Calendar,
  Clock,
  Trophy,
  Users,
  Zap,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Trash2,
  UserCheck,
  UserMinus,
  AlertCircle,
  Medal,
} from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import type { EventType } from '@/app/events/EventsContent';
import { EventChallengesSection } from '@/components/events/EventChallengesSection';

interface EventParticipantItem {
  id: string;
  score: number;
  joined_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    total_xp: number;
  };
}

interface EventDetails {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: EventType;
  status: string;
  banner_url: string | null;
  min_level: number;
  max_participants: number | null;
  xp_reward: number;
  start_date: string;
  end_date: string;
  creator: { id: string; username: string; avatar_url: string | null };
  company: { name: string; is_verified: boolean } | null;
  participants: EventParticipantItem[];
  _count: { participants: number };
  is_joined?: boolean;
}

interface EventDetailsModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string | null;
  currentUser: any;
  onStatusChange: () => void;
}

export function EventDetailsModal({
  open,
  onClose,
  eventId,
  currentUser,
  onStatusChange,
}: EventDetailsModalProps) {
  const { locale, text } = useLocalizedText();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !eventId) {
      setEvent(null);
      setError(null);
      setFeedbackMessage(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) {
          throw new Error('Não foi possível carregar os detalhes do evento.');
        }
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao consultar evento.');
      } finally {
        setLoading(false);
      }
    };

    void fetchDetails();
  }, [open, eventId]);

  const handleJoin = async () => {
    if (!eventId || !currentUser) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch(`/api/events/${eventId}/participate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Falha ao se inscrever.');
      }

      setFeedbackMessage(text('Inscrição confirmada com sucesso!', 'Registration confirmed!'));
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              is_joined: true,
              _count: { participants: prev._count.participants + 1 },
              participants: [
                {
                  id: 'temp-' + Date.now(),
                  score: 0,
                  joined_at: new Date().toISOString(),
                  user: {
                    id: currentUser.id,
                    username: currentUser.username,
                    avatar_url: currentUser.avatar_url || null,
                    total_xp: currentUser.total_xp || 0,
                  },
                },
                ...prev.participants,
              ],
            }
          : null
      );
      onStatusChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelParticipation = async () => {
    if (!eventId || !currentUser) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch(`/api/events/${eventId}/participate`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Falha ao cancelar inscrição.');
      }

      setFeedbackMessage(text('Inscrição cancelada com sucesso.', 'Participation canceled.'));
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              is_joined: false,
              _count: { participants: Math.max(0, prev._count.participants - 1) },
              participants: prev.participants.filter((p) => p.user.id !== currentUser.id),
            }
          : null
      );
      onStatusChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    const confirmDelete = window.confirm(
      text(
        'Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.',
        'Are you sure you want to delete this event? This action cannot be undone.'
      )
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao excluir evento.');
      }

      onStatusChange();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const isCreatorOrAdmin =
    currentUser && event && (currentUser.id === event.creator.id || currentUser.role === 'ADMIN');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {text('Ao Vivo', 'Live')}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700">
            {text('Encerrado', 'Finished')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {text('Em breve', 'Upcoming')}
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-dd-bg border border-dd-border rounded-2xl shadow-2xl overflow-hidden z-10"
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            {/* Top Bar with Close Button */}
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-black/70 hover:bg-black text-white transition-all shadow-md backdrop-blur-md cursor-pointer hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <p className="text-xs font-bold text-dd-muted">
                  {text('Carregando informações do evento...', 'Loading event details...')}
                </p>
              </div>
            ) : error && !event ? (
              <div className="p-8 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                <h3 className="text-base font-bold text-dd-text">{error}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-dd-surface border border-dd-border text-xs font-bold text-dd-text hover:border-dd-accent"
                >
                  {text('Fechar', 'Close')}
                </button>
              </div>
            ) : event ? (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
                  {/* Banner / Visual Header */}
                  <div className="relative h-44 sm:h-52 w-full bg-gradient-to-br from-purple-950/80 via-purple-900/40 to-dd-bg shrink-0 overflow-hidden">
                    {event.banner_url && (
                      <Image
                        src={event.banner_url}
                        alt={event.title}
                        fill
                        sizes="100%"
                        className="object-cover opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dd-bg via-dd-bg/40 to-transparent" />

                    <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(event.status)}
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/30 text-purple-300 border border-purple-500/40">
                            {event.type}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                          {event.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-yellow-500/40 backdrop-blur-md">
                        <Zap className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-black font-mono text-yellow-400">
                          +{event.xp_reward} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  {feedbackMessage && (
                    <div className="mx-6 mt-4 flex items-center gap-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{feedbackMessage}</span>
                    </div>
                  )}

                  {error && (
                    <div className="mx-6 mt-4 flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Main Body */}
                  <div className="p-5 sm:p-6 space-y-6 flex-1">
                    {/* Info Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-dd-surface border border-dd-border flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-dd-muted flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          {text('Início', 'Start')}
                        </span>
                        <span className="text-xs font-black text-dd-text mt-2">
                          {new Date(event.start_date).toLocaleDateString(locale, {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-dd-surface border border-dd-border flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-dd-muted flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          {text('Término', 'End')}
                        </span>
                        <span className="text-xs font-black text-dd-text mt-2">
                          {new Date(event.end_date).toLocaleDateString(locale, {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-dd-surface border border-dd-border flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-dd-muted flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          {text('Inscrições', 'Registrations')}
                        </span>
                        <span className="text-xs font-black text-dd-text mt-2">
                          {event._count.participants}{' '}
                          {event.max_participants
                            ? `/ ${event.max_participants}`
                            : text('inscritos', 'joined')}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-dd-surface border border-dd-border flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-dd-muted flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                          {text('Nível Mínimo', 'Min Level')}
                        </span>
                        <span className="text-xs font-black text-dd-text mt-2">
                          {text('Nível', 'Level')} {event.min_level}
                        </span>
                      </div>
                    </div>

                    {/* Description & Rules */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 mb-2">
                        {text('Sobre o Evento & Regras', 'About the Event & Rules')}
                      </h3>
                      <div className="p-4 rounded-xl bg-dd-surface border border-dd-border text-sm text-dd-text font-medium leading-relaxed whitespace-pre-line">
                        {event.description}
                      </div>
                    </div>

                    {/* Organizer info */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-dd-surface/50 border border-dd-border text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-black text-purple-300">
                          {event.creator.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-dd-muted block text-[10px] font-bold">
                            {text('Organizado por', 'Organized by')}
                          </span>
                          <span className="font-bold text-dd-text">@{event.creator.username}</span>
                          {event.company && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-black">
                              {event.company.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <EventChallengesSection eventId={event.id} />

                    {/* Leaderboard / Participants List */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5" />
                          {text('Ranking / Participantes', 'Leaderboard / Participants')} (
                          {event.participants.length})
                        </h3>
                      </div>

                      {event.participants.length === 0 ? (
                        <div className="p-6 text-center rounded-xl bg-dd-surface border border-dd-border text-xs text-dd-muted font-medium">
                          {text(
                            'Seja o primeiro a se inscrever neste evento!',
                            'Be the first to register for this event!'
                          )}
                        </div>
                      ) : (
                        <div className="border border-dd-border rounded-xl bg-dd-surface overflow-hidden divide-y divide-dd-border/60 max-h-56 overflow-y-auto">
                          {event.participants.map((p, index) => {
                            const rank = index + 1;
                            const isCurrentUser = currentUser?.id === p.user.id;

                            return (
                              <div
                                key={p.id}
                                className={`flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${
                                  isCurrentUser ? 'bg-purple-500/10' : 'hover:bg-dd-surface-subtle'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-5 text-center font-black font-mono">
                                    {rank === 1 ? (
                                      <Medal className="w-4 h-4 text-yellow-400 mx-auto" />
                                    ) : rank === 2 ? (
                                      <Medal className="w-4 h-4 text-slate-300 mx-auto" />
                                    ) : rank === 3 ? (
                                      <Medal className="w-4 h-4 text-amber-600 mx-auto" />
                                    ) : (
                                      <span className="text-dd-muted text-[11px]">{rank}</span>
                                    )}
                                  </span>

                                  <div className="w-7 h-7 rounded-full bg-dd-bg border border-dd-border overflow-hidden flex items-center justify-center font-bold text-[10px] text-dd-muted">
                                    {p.user.avatar_url ? (
                                      <Image
                                        src={p.user.avatar_url}
                                        alt={p.user.username}
                                        width={28}
                                        height={28}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      p.user.username.slice(0, 2).toUpperCase()
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-dd-text">
                                      @{p.user.username}
                                    </span>
                                    {isCurrentUser && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                                        {text('Você', 'You')}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 font-mono font-bold">
                                  <span className="text-dd-muted text-[11px]">
                                    {p.user.total_xp} XP
                                  </span>
                                  {p.score > 0 && (
                                    <span className="text-emerald-400 text-xs">{p.score} pts</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-dd-border/80 bg-dd-surface shrink-0">
                  <div>
                    {isCreatorOrAdmin && (
                      <button
                        type="button"
                        onClick={handleDeleteEvent}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{text('Excluir Evento', 'Delete Event')}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-dd-muted hover:text-dd-text hover:bg-dd-surface-subtle transition-colors cursor-pointer"
                    >
                      {text('Fechar', 'Close')}
                    </button>

                    {event.is_joined ? (
                      <button
                        type="button"
                        onClick={handleCancelParticipation}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                        <span>{text('Cancelar Inscrição', 'Cancel Registration')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleJoin}
                        disabled={actionLoading || !currentUser}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-black shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{text('Processando...', 'Processing...')}</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>{text('Inscrever-se no Evento', 'Register for Event')}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
