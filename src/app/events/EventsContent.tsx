'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  CircleAlert,
  Clock,
  Eye,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { CreateEventModal } from '@/components/events/CreateEventModal';
import { EventDetailsModal } from '@/components/events/EventDetailsModal';

export type EventType = 'HACKATHON' | 'CHAMPIONSHIP' | 'WORKSHOP' | 'CHALLENGE';

export interface EventItem {
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
  creator: { username: string };
  company: { name: string; is_verified: boolean } | null;
  _count: { participants: number };
  is_joined?: boolean;
  user_participation?: any;
}

export interface EventFilters {
  types: EventType[];
}

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'CHAMPIONSHIP', label: 'Campeonato' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'CHALLENGE', label: 'Desafio ao vivo' },
];

const EMPTY_FILTERS: EventFilters = { types: [] };

function getEventTypeLabel(type: EventType, english = false) {
  const labels: Record<EventType, string> = {
    HACKATHON: 'Hackathon',
    CHAMPIONSHIP: english ? 'Championship' : 'Campeonato',
    WORKSHOP: 'Workshop',
    CHALLENGE: english ? 'Live challenge' : 'Desafio ao vivo',
  };
  return labels[type] ?? type;
}

export function filterEvents(events: EventItem[], filters: EventFilters) {
  if (filters.types.length === 0) return events;
  return events.filter((event) => filters.types.includes(event.type));
}

function EventFiltersPanel({
  filters,
  onToggleType,
  onClear,
}: {
  filters: EventFilters;
  onToggleType: (type: EventType) => void;
  onClear: () => void;
}) {
  const { text } = useLocalizedText();
  const activeFilterCount = filters.types.length;

  return (
    <div className="rounded-2xl border border-dd-border bg-dd-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black text-dd-text">{text('Filtros', 'Filters')}</h2>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-dd-accent px-2 py-0.5 text-[10px] font-black text-white tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={activeFilterCount === 0}
          className="dd-focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-dd-accent transition-colors hover:bg-dd-accent/10 disabled:cursor-not-allowed disabled:text-dd-muted/60 disabled:hover:bg-transparent"
        >
          <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
          {text('Limpar', 'Clear')}
        </button>
      </div>

      <fieldset className="mt-5 space-y-2.5">
        <legend className="text-xs font-bold text-dd-text">
          {text('Tipo de evento', 'Event type')}
        </legend>
        <p className="text-xs font-medium leading-5 text-dd-muted">
          {text('Escolha uma ou mais categorias.', 'Choose one or more categories.')}
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1 xl:grid-cols-1">
          {EVENT_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              htmlFor={`events-type-${option.value}`}
              className="flex min-h-8 cursor-pointer items-center gap-2 text-xs font-medium text-dd-muted transition-colors hover:text-dd-text"
            >
              <input
                id={`events-type-${option.value}`}
                name="event-type"
                type="checkbox"
                checked={filters.types.includes(option.value)}
                onChange={() => onToggleType(option.value)}
                className="h-4 w-4 rounded border-dd-border bg-dd-bg accent-[var(--color-dd-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dd-accent"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function EventsContent({ user }: { user: any }) {
  const { isEnglish, locale, text } = useLocalizedText();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/events', { signal: controller.signal });
        if (!response.ok) throw new Error('Não foi possível consultar os eventos agora.');

        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if ((loadError as Error).name !== 'AbortError') {
          setError(
            'Não foi possível carregar os eventos. Verifique sua conexão e tente novamente.'
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadEvents();
    return () => controller.abort();
  }, [requestVersion]);

  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);
  const activeFilterCount = filters.types.length;

  const toggleType = (type: EventType) => {
    setFilters((current) => ({
      types: current.types.includes(type)
        ? current.types.filter((item) => item !== type)
        : [...current.types, type],
    }));
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setJoiningId(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method: 'POST',
      });
      if (response.ok) {
        setJoinedMap((current) => ({ ...current, [eventId]: true }));
        setMessage(
          text('Inscrição no evento realizada com sucesso!', 'Event registration successful!')
        );
        setRequestVersion((version) => version + 1);
        setTimeout(() => setMessage(null), 4000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.message || 'Falha ao se inscrever no evento.');
      }
    } catch (joinError) {
      console.error(joinError);
    } finally {
      setJoiningId(null);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setJoiningId(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setJoinedMap((current) => ({ ...current, [eventId]: false }));
        setMessage(text('Inscrição cancelada com sucesso.', 'Event registration canceled.'));
        setRequestVersion((version) => version + 1);
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (cancelError) {
      console.error(cancelError);
    } finally {
      setJoiningId(null);
    }
  };

  const handleEventCreated = () => {
    setMessage(
      text('Evento criado e publicado com sucesso!', 'Event created and published successfully!')
    );
    setRequestVersion((version) => version + 1);
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="dd-platform-shell dd-platform-shell--fullscreen selection:bg-dd-accent/30 selection:text-dd-text">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-10">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <header className="border-b border-dd-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-purple-400">
                  {text('Competições & Comunidade', 'Competitions & Community')}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-[-0.025em] text-dd-text md:text-3xl">
                {text('Eventos, Hackathons & Campeonatos', 'Events, Hackathons & Championships')}
              </h1>
              <p className="mt-1 max-w-[68ch] text-sm font-medium leading-6 text-dd-muted">
                {text(
                  'Participe de desafios ao vivo, hackathons patrocinados por empresas e ganhe XP e badges exclusivas.',
                  'Join live challenges and company-sponsored hackathons to earn XP and exclusive badges.'
                )}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    window.location.href = '/login';
                    return;
                  }
                  setIsCreateModalOpen(true);
                }}
                className="dd-focus-ring flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-black shadow-md shadow-purple-900/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{text('Criar Evento', 'Create Event')}</span>
              </button>
            </div>
          </header>

          {message && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-400 animate-fade-in">
              <CheckCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
            <aside
              className="order-first xl:sticky xl:top-6 xl:order-last xl:self-start"
              aria-label={text('Filtros de eventos', 'Event filters')}
            >
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                aria-expanded={mobileFiltersOpen}
                aria-controls="events-filter-panel"
                className="dd-focus-ring flex min-h-12 w-full items-center justify-between rounded-xl border border-dd-border bg-dd-surface px-4 text-sm font-black text-dd-text xl:hidden"
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-dd-accent" />
                  {text('Filtrar eventos', 'Filter events')}
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-dd-accent px-2 py-0.5 text-[10px] font-black text-white tabular-nums">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 text-dd-muted transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                id="events-filter-panel"
                className={`${mobileFiltersOpen ? 'mt-3 block' : 'hidden'} xl:block`}
              >
                <EventFiltersPanel
                  filters={filters}
                  onToggleType={toggleType}
                  onClear={clearFilters}
                />
              </div>
            </aside>

            <section
              className="order-last min-w-0 xl:order-first"
              aria-labelledby="events-results-title"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 id="events-results-title" className="text-sm font-black text-dd-text">
                    {text('Eventos disponíveis', 'Available events')}
                  </h2>
                  <p aria-live="polite" className="mt-0.5 text-xs font-medium text-dd-muted">
                    {loading
                      ? text('Atualizando eventos...', 'Updating events...')
                      : `${filteredEvents.length} ${filteredEvents.length === 1 ? text('evento encontrado', 'event found') : text('eventos encontrados', 'events found')}`}
                  </p>
                </div>
                {activeFilterCount > 0 && !loading && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="dd-focus-ring min-h-10 rounded-lg px-2 text-xs font-bold text-dd-accent hover:bg-dd-accent/10 xl:hidden"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {loading ? (
                <div
                  aria-label={text('Carregando eventos disponíveis', 'Loading available events')}
                  aria-busy="true"
                  className="rounded-2xl border border-dd-border bg-dd-surface p-12 text-center text-xs font-bold text-dd-muted"
                >
                  {text('Carregando eventos...', 'Loading events...')}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-500/35 bg-red-500/10 px-5 py-8 text-center">
                  <CircleAlert aria-hidden="true" className="mx-auto h-8 w-8 text-red-400" />
                  <h3 className="mt-3 text-base font-black text-dd-text">
                    {text('Falha ao carregar os eventos', 'Failed to load events')}
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-sm font-medium leading-6 text-dd-muted">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRequestVersion((version) => version + 1)}
                    className="dd-focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-dd-border bg-dd-bg px-4 text-sm font-black text-dd-text hover:border-dd-accent/60"
                  >
                    <RefreshCw aria-hidden="true" className="h-4 w-4" />
                    {text('Tentar novamente', 'Try again')}
                  </button>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="rounded-2xl border border-dd-border bg-dd-surface px-5 py-10 text-center">
                  <Trophy aria-hidden="true" className="mx-auto h-9 w-9 text-purple-400" />
                  <h3 className="mt-3 text-base font-black text-dd-text">
                    {events.length === 0
                      ? text('Nenhum evento no momento', 'No events right now')
                      : text(
                          'Nenhum evento combina com os filtros',
                          'No events match these filters'
                        )}
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-sm font-medium leading-6 text-dd-muted">
                    {events.length === 0
                      ? text(
                          'Novos hackathons e campeonatos serão exibidos aqui assim que forem publicados.',
                          'New hackathons and championships will appear here when published.'
                        )
                      : text(
                          'Selecione outros tipos ou limpe os filtros para ampliar os resultados.',
                          'Select other types or clear filters to broaden the results.'
                        )}
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="dd-focus-ring mt-4 min-h-10 rounded-xl bg-dd-accent px-4 text-sm font-black text-white hover:bg-blue-600"
                    >
                      {text('Limpar filtros', 'Clear filters')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredEvents.map((event) => {
                    const isJoined = joinedMap[event.id] ?? event.is_joined ?? false;
                    const spotsFilled =
                      typeof event.max_participants === 'number' && event.max_participants > 0
                        ? Math.min(
                            100,
                            Math.round((event._count.participants / event.max_participants) * 100)
                          )
                        : null;

                    return (
                      <article
                        key={event.id}
                        className="group flex flex-col justify-between gap-4 rounded-3xl border border-dd-border bg-dd-surface p-6 shadow-sm transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/20 overflow-hidden relative"
                      >
                        {event.banner_url && (
                          <div className="relative h-28 -mx-6 -mt-6 mb-1 overflow-hidden bg-purple-950/40">
                            <Image
                              src={event.banner_url}
                              alt={event.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dd-surface via-dd-surface/40 to-transparent" />
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-purple-400 border border-purple-500/30">
                              {getEventTypeLabel(event.type, isEnglish)}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-xs font-bold text-yellow-400">
                              <Zap aria-hidden="true" className="h-3.5 w-3.5 fill-current" />+
                              {event.xp_reward} XP
                            </span>
                          </div>

                          <h3
                            onClick={() => {
                              setSelectedEventId(event.id);
                              setIsDetailsModalOpen(true);
                            }}
                            className="text-base font-black text-dd-text hover:text-purple-400 transition-colors cursor-pointer"
                          >
                            {event.title}
                          </h3>
                          <p className="line-clamp-3 text-xs font-medium text-dd-muted leading-relaxed">
                            {event.description}
                          </p>

                          {spotsFilled !== null && (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-dd-muted">
                                <span>{text('Vagas preenchidas', 'Capacity filled')}</span>
                                <span className="font-mono">
                                  {event._count.participants} / {event.max_participants}
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-dd-bg overflow-hidden border border-dd-border/50">
                                <div
                                  className="h-full rounded-full bg-purple-500 transition-all duration-300"
                                  style={{ width: `${spotsFilled}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-dd-border/60 pt-3 text-[11px] font-medium text-dd-muted">
                            <span className="flex items-center gap-1.5">
                              <Users aria-hidden="true" className="h-3.5 w-3.5 text-purple-400" />
                              {event._count.participants} {text('inscritos', 'participants')}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock aria-hidden="true" className="h-3.5 w-3.5 text-purple-400" />
                              {new Date(event.start_date).toLocaleDateString(locale)}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEventId(event.id);
                              setIsDetailsModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-dd-border bg-dd-surface hover:bg-dd-surface-subtle hover:border-purple-500/50 text-dd-text text-xs font-bold transition-all cursor-pointer"
                            title={text('Ver detalhes do evento', 'View event details')}
                          >
                            <Eye className="w-4 h-4 text-purple-400" />
                            <span className="hidden sm:inline">{text('Detalhes', 'Details')}</span>
                          </button>

                          {isJoined ? (
                            <button
                              type="button"
                              onClick={() => handleCancelEvent(event.id)}
                              disabled={joiningId === event.id}
                              className="group/btn flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-xs font-bold border border-emerald-500/30 bg-emerald-500/15 hover:bg-red-500/15 hover:border-red-500/30 text-emerald-400 hover:text-red-400 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                              title={text(
                                'Clique para cancelar inscrição',
                                'Click to cancel registration'
                              )}
                            >
                              {joiningId === event.id ? (
                                text('Atualizando...', 'Updating...')
                              ) : (
                                <>
                                  <CheckCircle
                                    aria-hidden="true"
                                    className="h-4 w-4 group-hover/btn:hidden"
                                  />
                                  <X
                                    aria-hidden="true"
                                    className="h-4 w-4 hidden group-hover/btn:block"
                                  />
                                  <span className="group-hover/btn:hidden">
                                    {text('Inscrito no evento', 'Registered')}
                                  </span>
                                  <span className="hidden group-hover/btn:inline">
                                    {text('Cancelar inscrição', 'Cancel registration')}
                                  </span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleJoinEvent(event.id)}
                              disabled={joiningId === event.id}
                              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-xs font-bold shadow-md transition-all bg-purple-600 text-white hover:bg-purple-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {joiningId === event.id ? (
                                text('Inscrevendo...', 'Registering...')
                              ) : (
                                <>
                                  <span>
                                    {text('Inscrever-se no evento', 'Register for event')}
                                  </span>
                                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <CreateEventModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleEventCreated}
      />

      <EventDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedEventId(null);
        }}
        eventId={selectedEventId}
        currentUser={user}
        onStatusChange={() => setRequestVersion((v) => v + 1)}
      />
    </div>
  );
}
