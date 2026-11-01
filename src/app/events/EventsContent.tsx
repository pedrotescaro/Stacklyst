'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  CircleAlert,
  Clock,
  CalendarDays,
  ShieldCheck,
  Eye,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { PlatformPageHeader, PlatformPageShell } from '@/components/PlatformPageShell';
import styles from './events.module.css';
import { formatEventDate, formatEventDuration } from '@/lib/event-display';
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
  const { isEnglish, text } = useLocalizedText();
  return (
    <div className={styles.filtersPanel}>
      <div className={styles.filterHeader}>
        <h2>{text('Filtros', 'Filters')}</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={!filters.types.length}
          className={styles.clear}
        >
          {text('Limpar', 'Clear')}
        </button>
      </div>
      <fieldset>
        <legend>{text('Tipo de evento', 'Event type')}</legend>
        <div className={styles.filterOptions}>
          {EVENT_TYPE_OPTIONS.map((option) => (
            <label key={option.value}>
              <input
                type="checkbox"
                name="event-type"
                checked={filters.types.includes(option.value)}
                onChange={() => onToggleType(option.value)}
              />
              <span>{getEventTypeLabel(option.value, isEnglish)}</span>
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
  const [actionError, setActionError] = useState<string | null>(null);
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
        if (!controller.signal.aborted) setEvents(Array.isArray(data) ? data : []);
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
    if (!user) return;
    setJoiningId(eventId);
    setActionError(null);
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
        setActionError(
          errorData.message ||
            text(
              'Não foi possível se inscrever neste evento.',
              'Could not register for this event.'
            )
        );
        if (errorData.error === 'EVENT_CLOSED' || errorData.error === 'EVENT_FULL')
          setRequestVersion((version) => version + 1);
      }
    } catch {
      setActionError(
        text(
          'Não foi possível se inscrever. Verifique sua conexão e tente novamente.',
          'Could not register. Check your connection and try again.'
        )
      );
    } finally {
      setJoiningId(null);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (!user) return;
    setJoiningId(eventId);
    setActionError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setJoinedMap((current) => ({ ...current, [eventId]: false }));
        setMessage(text('Inscrição cancelada com sucesso.', 'Event registration canceled.'));
        setRequestVersion((version) => version + 1);
        setTimeout(() => setMessage(null), 4000);
      } else {
        const body = await response.json();
        setActionError(
          body.message ||
            text('Não foi possível cancelar a inscrição.', 'Could not cancel registration.')
        );
        if (body.error === 'EVENT_CLOSED') setRequestVersion((version) => version + 1);
      }
    } catch {
      setActionError(
        text(
          'Não foi possível cancelar a inscrição. Verifique sua conexão.',
          'Could not cancel registration. Check your connection.'
        )
      );
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
    <PlatformPageShell user={user}>
      <div className={styles.page}>
        <PlatformPageHeader
          title={text('Eventos', 'Events')}
          description={text(
            'Encontre desafios, confira as regras e acompanhe sua participação.',
            'Find challenges, check the rules and follow your participation.'
          )}
          actions={
            user ? (
              <button
                type="button"
                className={styles.headerActions}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={17} aria-hidden="true" />
                {text('Criar Evento', 'Create Event')}
              </button>
            ) : (
              <Link className={styles.headerActions} href="/login">
                {text('Entrar para criar', 'Sign in to create')}
              </Link>
            )
          }
        />
        {actionError && (
          <div role="alert" className={`${styles.notice} ${styles.error}`}>
            <CircleAlert size={18} aria-hidden="true" />
            <span>{actionError}</span>
          </div>
        )}
        {message && (
          <div role="status" className={styles.notice}>
            <CheckCircle size={18} aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}
        <div className={styles.toolbar}>
          <div>
            <h2 id="events-results-title">{text('Eventos disponíveis', 'Available events')}</h2>
            <p aria-live="polite" className={styles.resultCount}>
              {loading
                ? text('Atualizando eventos...', 'Updating events...')
                : `${filteredEvents.length} ${filteredEvents.length === 1 ? text('evento encontrado', 'event found') : text('eventos encontrados', 'events found')}`}
            </p>
          </div>
          <button
            type="button"
            className={styles.filtersButton}
            aria-expanded={mobileFiltersOpen}
            aria-controls="events-filter-panel"
            onClick={() => setMobileFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            {text('Filtrar eventos', 'Filter events')}
            {activeFilterCount ? ` (${activeFilterCount})` : ''}
            <ChevronDown
              size={15}
              aria-hidden="true"
              style={{ transform: mobileFiltersOpen ? 'rotate(180deg)' : undefined }}
            />
          </button>
        </div>
        <div id="events-filter-panel" hidden={!mobileFiltersOpen}>
          <EventFiltersPanel filters={filters} onToggleType={toggleType} onClear={clearFilters} />
        </div>
        <section aria-labelledby="events-results-title">
          {loading ? (
            <div
              aria-label={text('Carregando eventos disponíveis', 'Loading available events')}
              aria-busy="true"
              className={styles.empty}
            >
              <RefreshCw size={24} aria-hidden="true" />
              <p>{text('Carregando eventos...', 'Loading events...')}</p>
            </div>
          ) : error ? (
            <div className={styles.empty}>
              <CircleAlert size={28} aria-hidden="true" />
              <h3>{text('Falha ao carregar os eventos', 'Failed to load events')}</h3>
              <p>{text(error, 'Could not load events. Check your connection and try again.')}</p>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setRequestVersion((version) => version + 1)}
              >
                <RefreshCw size={16} aria-hidden="true" />
                {text('Tentar novamente', 'Try again')}
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className={styles.empty}>
              <Trophy size={30} aria-hidden="true" />
              <h3>
                {events.length === 0
                  ? text('Nenhum evento no momento', 'No events right now')
                  : text('Nenhum evento combina com os filtros', 'No events match these filters')}
              </h3>
              <p>
                {events.length === 0
                  ? text(
                      'Os próximos eventos da comunidade aparecerão aqui assim que forem publicados.',
                      'Upcoming community events will appear here when published.'
                    )
                  : text(
                      'Tente outro tipo de evento ou limpe os filtros para ver todos.',
                      'Try a different event type or clear the filters to see everything.'
                    )}
              </p>
              {activeFilterCount > 0 && (
                <button type="button" className={styles.secondary} onClick={clearFilters}>
                  {text('Limpar filtros', 'Clear filters')}
                </button>
              )}
            </div>
          ) : (
            filteredEvents.map((event) => {
              const isJoined = joinedMap[event.id] ?? event.is_joined ?? false;
              const full =
                event.max_participants !== null &&
                event._count.participants >= event.max_participants;
              const completed = event.status === 'COMPLETED';
              const openDetails = () => {
                setSelectedEventId(event.id);
                setIsDetailsModalOpen(true);
              };
              return (
                <article key={event.id} className={styles.event}>
                  {event.banner_url && (
                    <div className={styles.banner}>
                      <Image
                        src={event.banner_url}
                        alt=""
                        fill
                        sizes="(max-width: 767px) 100vw, 650px"
                      />
                    </div>
                  )}
                  <div className={styles.labels}>
                    <span className={styles.type}>{getEventTypeLabel(event.type, isEnglish)}</span>
                    <span
                      className={`${styles.status} ${event.status === 'ONGOING' ? styles.live : ''}`}
                    >
                      {completed
                        ? text('Encerrado', 'Ended')
                        : event.status === 'ONGOING'
                          ? text('Em andamento', 'In progress')
                          : text('Em breve', 'Upcoming')}
                    </span>
                    {isJoined && (
                      <span className={styles.joined}>
                        <CheckCircle size={14} aria-hidden="true" />
                        {text('Você está inscrito', 'You are registered')}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.title}>
                    <button type="button" onClick={openDetails}>
                      {event.title}
                    </button>
                  </h3>
                  <p className={styles.description}>{event.description}</p>
                  <p className={styles.organizer}>
                    {text('Por', 'By')} {event.company?.name ?? `@${event.creator.username}`}
                  </p>
                  <dl className={styles.details}>
                    <div>
                      <dt>
                        <CalendarDays size={14} aria-hidden="true" />
                        {text('Início', 'Start')}
                      </dt>
                      <dd>
                        <time dateTime={event.start_date}>
                          {formatEventDate(event.start_date, locale)}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt>
                        <Clock size={14} aria-hidden="true" />
                        {text('Término', 'End')}
                      </dt>
                      <dd>
                        <time dateTime={event.end_date}>
                          {formatEventDate(event.end_date, locale)}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt>
                        <Users size={14} aria-hidden="true" />
                        {text('Participantes', 'Participants')}
                      </dt>
                      <dd>
                        {event._count.participants}
                        {event.max_participants !== null
                          ? ` / ${event.max_participants}`
                          : ` · ${text('sem limite de vagas', 'unlimited spots')}`}
                      </dd>
                    </div>
                    <div>
                      <dt>
                        <ShieldCheck size={14} aria-hidden="true" />
                        {text('Para participar', 'Requirements')}
                      </dt>
                      <dd>
                        {text('Nível', 'Level')} {event.min_level}{' '}
                        {text('ou superior', 'or higher')}
                      </dd>
                    </div>
                  </dl>
                  <div className={styles.timeNote}>
                    <span>{text('Horário de Brasília (UTC−3)', 'Brasília time (UTC−3)')}</span>
                    <span>
                      {text('Duração:', 'Duration:')}{' '}
                      {formatEventDuration(event.start_date, event.end_date, isEnglish)}
                    </span>
                    <span>
                      {text('Recompensa:', 'Reward:')} {event.xp_reward} XP
                    </span>
                  </div>
                  <div className={styles.actions}>
                    <button type="button" className={styles.secondary} onClick={openDetails}>
                      <Eye size={16} aria-hidden="true" />
                      {text('Ver detalhes', 'View details')}
                    </button>
                    {completed ? (
                      <span className={styles.closed}>
                        {text('Evento encerrado', 'Event ended')}
                      </span>
                    ) : isJoined ? (
                      <button
                        type="button"
                        className={`${styles.secondary} ${styles.cancel}`}
                        disabled={joiningId !== null}
                        onClick={() => handleCancelEvent(event.id)}
                      >
                        <X size={16} aria-hidden="true" />
                        {joiningId === event.id
                          ? text('Cancelando...', 'Canceling...')
                          : text('Cancelar inscrição', 'Cancel registration')}
                      </button>
                    ) : !user ? (
                      <Link href="/login" className={styles.primary}>
                        {text('Entrar para participar', 'Sign in to participate')}
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={styles.primary}
                        disabled={joiningId !== null || full}
                        onClick={() => handleJoinEvent(event.id)}
                      >
                        {joiningId === event.id
                          ? text('Inscrevendo...', 'Registering...')
                          : full
                            ? text('Vagas esgotadas', 'Event full')
                            : text('Inscrever-se no evento', 'Register for event')}
                        {!full && <ArrowRight size={16} aria-hidden="true" />}
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
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
        onStatusChange={() => setRequestVersion((version) => version + 1)}
      />
    </PlatformPageShell>
  );
}
