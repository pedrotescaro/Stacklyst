'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Trophy,
  Users,
  Zap,
  ShieldAlert,
  Loader2,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import type { EventType } from '@/app/events/EventsContent';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (event: any) => void;
}

export function CreateEventModal({ open, onClose, onCreated }: CreateEventModalProps) {
  const { isEnglish, text } = useLocalizedText();

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('HACKATHON');
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [minLevel, setMinLevel] = useState(1);
  const [maxParticipants, setMaxParticipants] = useState<string>('');
  const [xpReward, setXpReward] = useState(300);
  const [bannerUrl, setBannerUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError(
        text('O título deve ter pelo menos 3 caracteres.', 'Title must be at least 3 characters.')
      );
      return;
    }

    if (description.trim().length < 10) {
      setError(
        text(
          'A descrição deve ter pelo menos 10 caracteres.',
          'Description must be at least 10 characters.'
        )
      );
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError(text('Datas de início ou fim inválidas.', 'Invalid start or end dates.'));
      return;
    }

    if (end <= start) {
      setError(
        text(
          'A data de término deve ser posterior à data de início.',
          'End date must be after start date.'
        )
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        min_level: Math.max(1, Number(minLevel) || 1),
        max_participants: maxParticipants ? Math.max(1, parseInt(maxParticipants, 10)) : undefined,
        xp_reward: Math.max(0, Number(xpReward) || 0),
        banner_url: bannerUrl.trim() || undefined,
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Erro ao criar evento.');
      }

      onCreated(data.event);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao conectar com o servidor.');
    } finally {
      setSubmitting(false);
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
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

          {/* Dialog */}
          <motion.div
            className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-dd-bg border border-dd-border rounded-2xl shadow-2xl overflow-hidden z-10"
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dd-border/80 bg-dd-surface shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-dd-text">
                    {text('Criar Novo Evento', 'Create New Event')}
                  </h2>
                  <p className="text-xs text-dd-muted font-medium">
                    {text(
                      'Organize um hackathon, campeonato ou workshop comunitário',
                      'Host a hackathon, championship or community workshop'
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-dd-muted hover:text-dd-text hover:bg-dd-surface-subtle transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-5 sm:p-6 space-y-5 flex-1">
                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-dd-text mb-1.5">
                    {text('Título do Evento *', 'Event Title *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={text(
                      'Ex: Hackathon de Inteligência Artificial 2026',
                      'Ex: AI Hackathon 2026'
                    )}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dd-surface border border-dd-border text-sm text-dd-text placeholder:text-dd-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Type & XP Reward */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1.5">
                      {text('Tipo de Evento', 'Event Type')}
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as EventType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dd-surface border border-dd-border text-sm text-dd-text focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                    >
                      <option value="HACKATHON">Hackathon</option>
                      <option value="CHAMPIONSHIP">
                        {isEnglish ? 'Championship' : 'Campeonato'}
                      </option>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="CHALLENGE">
                        {isEnglish ? 'Live Challenge' : 'Desafio ao Vivo'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1.5">
                      {text('Recompensa (XP)', 'Reward (XP)')}
                    </label>
                    <div className="relative">
                      <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={xpReward}
                        onChange={(e) => setXpReward(Number(e.target.value))}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dd-surface border border-dd-border text-sm font-mono text-dd-text focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-dd-text mb-1.5">
                    {text('Descrição e Regras *', 'Description & Rules *')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={text(
                      'Explique o objetivo do evento, regras de participação, critérios de avaliação e prazos...',
                      'Explain event objectives, participation rules, grading criteria and deadlines...'
                    )}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dd-surface border border-dd-border text-sm text-dd-text placeholder:text-dd-muted/60 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {text('Início *', 'Start *')}
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dd-surface border border-dd-border text-xs sm:text-sm text-dd-text focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      {text('Término *', 'End *')}
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dd-surface border border-dd-border text-xs sm:text-sm text-dd-text focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Min Level & Max Participants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                      {text('Nível Mínimo do Usuário', 'Minimum User Level')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={minLevel}
                      onChange={(e) => setMinLevel(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dd-surface border border-dd-border text-sm text-dd-text focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      {text('Limite de Vagas (opcional)', 'Max Participants (optional)')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder={text('Sem limite', 'No limit')}
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dd-surface border border-dd-border text-sm text-dd-text placeholder:text-dd-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Banner URL (optional) */}
                <div>
                  <label className="block text-xs font-bold text-dd-text mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    {text('URL do Banner (opcional)', 'Banner Image URL (optional)')}
                  </label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dd-surface border border-dd-border text-sm text-dd-text placeholder:text-dd-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dd-border/80 bg-dd-surface shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-dd-muted hover:text-dd-text hover:bg-dd-surface-subtle transition-colors cursor-pointer"
                >
                  {text('Cancelar', 'Cancel')}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-black shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{text('Criando...', 'Creating...')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{text('Publicar Evento', 'Publish Event')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
