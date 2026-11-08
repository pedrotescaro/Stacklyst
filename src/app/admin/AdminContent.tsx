'use client';

import {
  useEffect,
  useState,
  useRef,
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { PlatformPageHeader, PlatformPageShell } from '@/components/PlatformPageShell';
import styles from './admin.module.css';

interface AdminMetrics {
  users: { total: number; active: number; newLast7Days: number };
  duels: { total: number; completed: number; pendingEvaluation: number };
  jobs: { total: number; active: number };
  companies: { total: number; verified: number };
  events: { total: number; active: number };
  moderation: { pendingReports: number; pendingEvaluatorApps: number };
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'EVALUATOR' | 'ADMIN' | 'RECRUITER';
  total_xp: number;
  created_at: string;
}

interface EvaluatorApp {
  id: string;
  user_id: string;
  motivation: string;
  tech_stack: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    total_xp: number;
    streak_days: number;
    role: string;
    evaluator_profile: {
      reputation: number;
      evaluations_count: number;
      status: 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'REVOKED';
      sanction_reason: string | null;
    } | null;
  };
}

interface ReportItem {
  id: string;
  reason: string;
  created_at: string;
  user: { id: string; username: string };
  post: { id: string; title: string; body: string; author: { id: string; username: string } };
}

type Tab = 'overview' | 'evaluators' | 'users' | 'reports';
type UserRole = AdminUser['role'];
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'evaluators', label: 'Avaliadores' },
  { id: 'users', label: 'Usuários' },
  { id: 'reports', label: 'Moderação' },
];
const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'Desenvolvedor',
  EVALUATOR: 'Avaliador',
  ADMIN: 'Administrador',
  RECRUITER: 'Recrutador',
};
const APPLICATION_LABELS = { PENDING: 'Em análise', APPROVED: 'Aprovada', REJECTED: 'Recusada' };
const PROFILE_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  PROBATION: 'Em observação',
  SUSPENDED: 'Suspenso',
  REVOKED: 'Revogado',
};
const formatNumber = (value: number) => value.toLocaleString('pt-BR');
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR');

export function AdminContent({ user }: { user: ComponentProps<typeof PlatformPageShell>['user'] }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [evaluatorApps, setEvaluatorApps] = useState<EvaluatorApp[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [dismissNotes, setDismissNotes] = useState<Record<string, string>>({});
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({});
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [failedLoads, setFailedLoads] = useState<number[]>([]);
  const [usersError, setUsersError] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const actionLock = useRef(false);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some((tab) => tab.id === requested)) setActiveTab(requested as Tab);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadDashboard() {
      setLoading(true);
      setLoadError('');
      setFailedLoads([]);
      const endpoints = ['/api/admin/metrics', '/api/admin/evaluators', '/api/admin/reports'];
      const labels = ['resumo da plataforma', 'candidaturas de avaliadores', 'denúncias'];
      const results = await Promise.allSettled(
        endpoints.map(async (endpoint) => {
          const response = await fetch(endpoint, { signal: controller.signal, cache: 'no-store' });
          if (!response.ok) throw new Error('Falha na consulta');
          return response.json();
        })
      );
      if (controller.signal.aborted) return;
      const failed: string[] = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failed.push(labels[index]);
          return;
        }
        if (index === 0) setMetrics(result.value);
        if (index === 1) setEvaluatorApps(Array.isArray(result.value) ? result.value : []);
        if (index === 2) setReportsList(Array.isArray(result.value) ? result.value : []);
      });
      setFailedLoads(
        results.flatMap((result, index) => (result.status === 'rejected' ? [index] : []))
      );
      if (failed.length)
        setLoadError(`Não foi possível carregar: ${failed.join(', ')}. Tente novamente.`);
      setLoading(false);
    }
    void loadDashboard();
    return () => controller.abort();
  }, [refreshVersion]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadUsers() {
      setUsersLoading(true);
      setUsersError('');
      try {
        const params = new URLSearchParams({ page: String(usersPage), limit: '20' });
        if (searchQuery) params.set('search', searchQuery);
        const response = await fetch(`/api/admin/users?${params}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Falha na consulta');
        const data = await response.json();
        if (controller.signal.aborted) return;
        setUsersList(Array.isArray(data.users) ? data.users : []);
        setPagination({
          total: data.pagination?.total ?? data.users?.length ?? 0,
          totalPages: data.pagination?.totalPages ?? 1,
        });
      } catch {
        if (!controller.signal.aborted)
          setUsersError('Não foi possível carregar os usuários. Tente novamente.');
      } finally {
        if (!controller.signal.aborted) setUsersLoading(false);
      }
    }
    void loadUsers();
    return () => controller.abort();
  }, [refreshVersion, usersPage, searchQuery]);

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
  }
  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, tab: Tab) {
    const index = TABS.findIndex((item) => item.id === tab);
    const nextIndex =
      event.key === 'ArrowRight'
        ? (index + 1) % TABS.length
        : event.key === 'ArrowLeft'
          ? (index + TABS.length - 1) % TABS.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? TABS.length - 1
              : null;
    if (nextIndex === null) return;
    event.preventDefault();
    selectTab(TABS[nextIndex].id);
    document.getElementById(`admin-tab-${TABS[nextIndex].id}`)?.focus();
  }
  async function performAction(
    key: string,
    endpoint: string,
    method: string,
    payload: unknown,
    success: string
  ) {
    if (actionLock.current) return;
    actionLock.current = true;
    setPendingAction(key);
    setActionMessage(null);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(data?.message || data?.error || 'Não foi possível concluir a ação.');
      setActionMessage({ type: 'success', text: success });
      setConfirmDeleteId(null);
      setRoleDrafts({});
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Falha de conexão. Tente novamente.',
      });
    } finally {
      actionLock.current = false;
      setPendingAction(null);
    }
  }
  function reviewApplication(applicationId: string, decision: 'APPROVED' | 'REJECTED') {
    return performAction(
      applicationId,
      '/api/admin/evaluators',
      'POST',
      { application_id: applicationId, decision, notes: reviewNotes[applicationId] || '' },
      `Candidatura ${decision === 'APPROVED' ? 'aprovada' : 'recusada'} com sucesso.`
    );
  }
  function moderateEvaluator(
    app: EvaluatorApp,
    action: 'WARN' | 'SUSPEND' | 'REINSTATE' | 'REVOKE'
  ) {
    return performAction(
      app.id,
      '/api/admin/evaluators',
      'PATCH',
      { evaluator_id: app.user_id, action, notes: reviewNotes[app.id] || '' },
      'Medida aplicada ao perfil de avaliador.'
    );
  }
  function searchUsers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUsersPage(1);
    setSearchQuery(searchDraft.trim());
  }
  const pendingApps = evaluatorApps.filter((app) => app.status === 'PENDING').length;
  const sortedApps = [...evaluatorApps].sort(
    (a, b) => Number(b.status === 'PENDING') - Number(a.status === 'PENDING')
  );
  const busy = pendingAction !== null;

  return (
    <PlatformPageShell user={user}>
      <PlatformPageHeader
        title="Administração"
        actions={
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setRefreshVersion((version) => version + 1)}
            disabled={loading || usersLoading}
            aria-label="Atualizar painel"
          >
            <RefreshCw size={19} aria-hidden="true" />
          </button>
        }
      />
      <div className={styles.intro}>
        <h2>Gestão da comunidade</h2>
        <p>Acompanhe a plataforma, revise candidaturas e gerencie permissões e denúncias.</p>
      </div>
      <div className={styles.tabs} role="tablist" aria-label="Seções da administração">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`admin-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(event) => handleTabKey(event, tab.id)}
          >
            {tab.label}
            {((tab.id === 'evaluators' && pendingApps > 0) ||
              (tab.id === 'reports' && reportsList.length > 0)) && (
              <span>{tab.id === 'evaluators' ? pendingApps : reportsList.length}</span>
            )}
          </button>
        ))}
      </div>
      <div className={styles.body}>
        {actionMessage && (
          <div
            className={`${styles.notice} ${actionMessage.type === 'error' ? styles.error : ''}`}
            role={actionMessage.type === 'error' ? 'alert' : 'status'}
          >
            {actionMessage.type === 'success' ? (
              <Check size={18} aria-hidden="true" />
            ) : (
              <X size={18} aria-hidden="true" />
            )}
            <p>{actionMessage.text}</p>
          </div>
        )}
        {loadError && (
          <div className={`${styles.notice} ${styles.error}`} role="alert">
            <p>{loadError}</p>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => setRefreshVersion((version) => version + 1)}
            >
              Tentar novamente
            </button>
          </div>
        )}
        {TABS.filter((tab) => tab.id !== activeTab).map((tab) => (
          <div
            key={tab.id}
            id={`admin-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`admin-tab-${tab.id}`}
            hidden
          />
        ))}
        <section
          id={`admin-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`admin-tab-${activeTab}`}
          className={styles.panel}
        >
          {activeTab === 'overview' && (
            <>
              <div className={styles.sectionHeading}>
                <h2>Visão geral</h2>
                <p>Os números mostram a situação atual da plataforma.</p>
              </div>
              {loading && !metrics ? (
                <div
                  className={styles.skeleton}
                  role="status"
                  aria-label="Carregando resumo da plataforma"
                >
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              ) : (
                metrics && (
                  <>
                    <dl className={styles.metrics}>
                      <div>
                        <dt>Usuários</dt>
                        <dd>{formatNumber(metrics.users.total)}</dd>
                        <dd className={styles.metricDetail}>
                          {formatNumber(metrics.users.active)} ativos na semana ·{' '}
                          {formatNumber(metrics.users.newLast7Days)} novos em 7 dias
                        </dd>
                      </div>
                      <div>
                        <dt>Duelos</dt>
                        <dd>{formatNumber(metrics.duels.total)}</dd>
                        <dd className={styles.metricDetail}>
                          {formatNumber(metrics.duels.completed)} concluídos ·{' '}
                          {formatNumber(metrics.duels.pendingEvaluation)} aguardando avaliação
                        </dd>
                      </div>
                      <div>
                        <dt>Vagas abertas</dt>
                        <dd>{formatNumber(metrics.jobs.active)}</dd>
                        <dd className={styles.metricDetail}>
                          {formatNumber(metrics.jobs.total)} vagas cadastradas ·{' '}
                          {formatNumber(metrics.companies.verified)} empresas verificadas
                        </dd>
                      </div>
                      <div>
                        <dt>Eventos ativos</dt>
                        <dd>{formatNumber(metrics.events.active)}</dd>
                        <dd className={styles.metricDetail}>
                          {formatNumber(metrics.events.total)} eventos cadastrados
                        </dd>
                      </div>
                    </dl>
                    <section className={styles.section}>
                      <h3>O que precisa de atenção</h3>
                      <div className={styles.actionList}>
                        <button type="button" onClick={() => selectTab('evaluators')}>
                          <span>
                            <strong>Candidaturas de avaliadores</strong>
                            <small>Confira experiência, tecnologias e justificativa.</small>
                          </span>
                          <span className={styles.count}>{pendingApps}</span>
                          <ChevronRight size={18} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => selectTab('reports')}>
                          <span>
                            <strong>Denúncias de conteúdo</strong>
                            <small>Leia a publicação e decida a medida adequada.</small>
                          </span>
                          <span className={styles.count}>{reportsList.length}</span>
                          <ChevronRight size={18} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => selectTab('users')}>
                          <span>
                            <strong>Usuários e permissões</strong>
                            <small>Busque contas e confira o acesso de cada pessoa.</small>
                          </span>
                          <ChevronRight size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </section>
                    <section className={styles.section}>
                      <h3>Outras áreas</h3>
                      <div className={styles.links}>
                        <Link href="/admin/profile-catalog">
                          Catálogo de perfis
                          <ArrowRight size={16} />
                        </Link>
                        <Link href="/jobs">
                          Vagas
                          <ArrowRight size={16} />
                        </Link>
                        <Link href="/events">
                          Eventos
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </section>
                  </>
                )
              )}
            </>
          )}
          {activeTab === 'evaluators' && (
            <>
              <div className={styles.sectionHeading}>
                <h2>Avaliadores de código</h2>
                <p>
                  Analise primeiro as candidaturas pendentes. Toda decisão exige uma justificativa
                  de pelo menos 20 caracteres.
                </p>
              </div>
              <p className={styles.guide}>
                <ShieldCheck size={19} aria-hidden="true" />
                <span>
                  Critérios: concluir uma trilha ou acumular 1.000 XP, escrever uma motivação de 80
                  caracteres ou mais e dominar pelo menos uma tecnologia dos duelos. A validação é
                  feita pelo servidor.
                </span>
              </p>
              {loading && !evaluatorApps.length ? (
                <p role="status" className={styles.muted}>
                  Carregando candidaturas…
                </p>
              ) : !evaluatorApps.length && failedLoads.includes(1) ? (
                <p className={styles.muted}>
                  Candidaturas temporariamente indisponíveis. Use “Tentar novamente” para consultar
                  a fila.
                </p>
              ) : !evaluatorApps.length ? (
                <div className={styles.empty}>
                  <h3>Nenhuma candidatura registrada</h3>
                  <p>As solicitações para atuar como avaliador aparecerão aqui.</p>
                </div>
              ) : (
                <div className={styles.rows}>
                  {sortedApps.map((app) => {
                    const profile = app.user.evaluator_profile;
                    const notesReady = (reviewNotes[app.id] || '').trim().length >= 20;
                    return (
                      <article
                        key={app.id}
                        className={styles.application}
                        aria-label={`Candidatura de @${app.user.username}`}
                      >
                        <header className={styles.rowHeader}>
                          <div>
                            <Link
                              href={`/profile/${app.user.username}`}
                              className={styles.username}
                            >
                              @{app.user.username}
                            </Link>
                            <p className={styles.muted}>
                              Enviada em {formatDate(app.created_at)} ·{' '}
                              {formatNumber(app.user.total_xp)} XP
                            </p>
                          </div>
                          <span className={styles.status} data-status={app.status}>
                            {APPLICATION_LABELS[app.status]}
                          </span>
                        </header>
                        <h3 className={styles.label}>Motivação</h3>
                        <p className={styles.motivation}>{app.motivation}</p>
                        <div className={styles.technologies} aria-label="Tecnologias declaradas">
                          {app.tech_stack.map((tech) => (
                            <span key={tech}>{tech}</span>
                          ))}
                        </div>
                        {profile && (
                          <div className={styles.profileState}>
                            <strong>
                              Perfil de avaliador:{' '}
                              {PROFILE_LABELS[profile.status] || profile.status}
                            </strong>
                            <p>
                              {profile.reputation} de reputação ·{' '}
                              {formatNumber(profile.evaluations_count)} avaliações
                            </p>
                            {profile.sanction_reason && (
                              <p>Última medida: {profile.sanction_reason}</p>
                            )}
                          </div>
                        )}
                        {(app.status === 'PENDING' || profile) && (
                          <div className={styles.review}>
                            <label htmlFor={`notes-${app.id}`}>
                              {app.status === 'PENDING'
                                ? 'Justificativa da decisão'
                                : 'Motivo da medida administrativa'}
                            </label>
                            <textarea
                              id={`notes-${app.id}`}
                              rows={3}
                              value={reviewNotes[app.id] || ''}
                              disabled={busy}
                              onChange={(event) =>
                                setReviewNotes((current) => ({
                                  ...current,
                                  [app.id]: event.target.value,
                                }))
                              }
                              placeholder="Explique sua decisão de forma objetiva."
                              aria-describedby={`notes-help-${app.id}`}
                            />
                            <p id={`notes-help-${app.id}`} className={styles.help}>
                              {(reviewNotes[app.id] || '').trim().length} / 20 caracteres mínimos. O
                              parecer fica registrado.
                            </p>
                            <div className={styles.actions}>
                              {app.status === 'PENDING' ? (
                                <>
                                  <button
                                    type="button"
                                    className={styles.primary}
                                    disabled={!notesReady || busy}
                                    onClick={() => void reviewApplication(app.id, 'APPROVED')}
                                  >
                                    <Check size={17} aria-hidden="true" />
                                    {pendingAction === app.id ? 'Salvando…' : 'Aprovar candidatura'}
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.secondary}
                                    disabled={!notesReady || busy}
                                    onClick={() => void reviewApplication(app.id, 'REJECTED')}
                                  >
                                    <X size={17} aria-hidden="true" />
                                    Recusar candidatura
                                  </button>
                                </>
                              ) : (
                                <>
                                  {profile?.status === 'SUSPENDED' ||
                                  profile?.status === 'REVOKED' ? (
                                    <button
                                      type="button"
                                      className={styles.primary}
                                      disabled={!notesReady || busy}
                                      onClick={() => void moderateEvaluator(app, 'REINSTATE')}
                                    >
                                      Reintegrar avaliador
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        className={styles.secondary}
                                        disabled={!notesReady || busy}
                                        onClick={() => void moderateEvaluator(app, 'WARN')}
                                      >
                                        Advertir (−10 pontos)
                                      </button>
                                      <button
                                        type="button"
                                        className={styles.secondary}
                                        disabled={!notesReady || busy}
                                        onClick={() => void moderateEvaluator(app, 'SUSPEND')}
                                      >
                                        Suspender
                                      </button>
                                    </>
                                  )}
                                  {profile?.status !== 'REVOKED' && (
                                    <button
                                      type="button"
                                      className={styles.danger}
                                      disabled={!notesReady || busy}
                                      onClick={() => void moderateEvaluator(app, 'REVOKE')}
                                    >
                                      Revogar função
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {activeTab === 'users' && (
            <>
              <div className={styles.sectionHeading}>
                <h2>Usuários e permissões</h2>
                <p>
                  A função de avaliador é concedida pela análise de candidatura. Alterações de
                  acesso são verificadas e registradas no servidor.
                </p>
              </div>
              <form className={styles.search} onSubmit={searchUsers}>
                <label htmlFor="admin-user-search">Buscar por usuário ou e-mail</label>
                <div>
                  <div className={styles.searchInput}>
                    <Search size={18} aria-hidden="true" />
                    <input
                      id="admin-user-search"
                      value={searchDraft}
                      onChange={(event) => setSearchDraft(event.target.value)}
                      placeholder="Nome de usuário ou e-mail"
                      type="search"
                    />
                  </div>
                  <button type="submit" className={styles.secondary} disabled={usersLoading}>
                    Buscar
                  </button>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clear}
                    onClick={() => {
                      setSearchDraft('');
                      setSearchQuery('');
                      setUsersPage(1);
                    }}
                  >
                    Limpar busca
                  </button>
                )}
              </form>
              {usersError && (
                <div className={`${styles.notice} ${styles.error}`} role="alert">
                  <p>{usersError}</p>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => setRefreshVersion((version) => version + 1)}
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
              {usersLoading ? (
                <p role="status" className={styles.muted}>
                  Carregando usuários…
                </p>
              ) : usersError ? null : !usersList.length ? (
                <div className={styles.empty}>
                  <h3>Nenhum usuário encontrado</h3>
                  <p>Tente buscar outro nome ou e-mail.</p>
                </div>
              ) : (
                <>
                  <p className={styles.muted}>
                    {formatNumber(pagination.total)}{' '}
                    {pagination.total === 1 ? 'conta encontrada' : 'contas encontradas'}
                    {searchQuery ? ` para “${searchQuery}”` : ''}
                  </p>
                  <div className={styles.rows}>
                    {usersList.map((account) => (
                      <article
                        key={account.id}
                        className={styles.userRow}
                        aria-label={`Usuário @${account.username}`}
                      >
                        <div className={styles.account}>
                          <Link href={`/profile/${account.username}`} className={styles.username}>
                            @{account.username}
                          </Link>
                          <p>{account.email}</p>
                          <p className={styles.muted}>
                            {formatNumber(account.total_xp)} XP · Conta criada em{' '}
                            {formatDate(account.created_at)}
                          </p>
                          <span className={styles.status}>{ROLE_LABELS[account.role]}</span>
                        </div>
                        <div className={styles.roleControl}>
                          <label htmlFor={`role-${account.id}`}>
                            Função de @{account.username}
                          </label>
                          <select
                            id={`role-${account.id}`}
                            value={roleDrafts[account.id] ?? account.role}
                            disabled={busy}
                            onChange={(event) =>
                              setRoleDrafts((current) => ({
                                ...current,
                                [account.id]: event.target.value as UserRole,
                              }))
                            }
                          >
                            <option value="USER">Desenvolvedor</option>
                            {account.role === 'EVALUATOR' && (
                              <option value="EVALUATOR">Avaliador</option>
                            )}
                            <option value="RECRUITER">Recrutador</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                          <button
                            type="button"
                            className={styles.secondary}
                            disabled={
                              busy ||
                              !roleDrafts[account.id] ||
                              roleDrafts[account.id] === account.role
                            }
                            onClick={() =>
                              void performAction(
                                account.id,
                                '/api/admin/users',
                                'PATCH',
                                { user_id: account.id, role: roleDrafts[account.id] },
                                'Função do usuário atualizada.'
                              )
                            }
                          >
                            {pendingAction === account.id ? 'Salvando…' : 'Salvar função'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  <nav className={styles.pagination} aria-label="Páginas de usuários">
                    <button
                      type="button"
                      className={styles.secondary}
                      disabled={usersPage <= 1 || usersLoading}
                      onClick={() => setUsersPage((page) => Math.max(1, page - 1))}
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                      Anterior
                    </button>
                    <span>
                      Página {usersPage} de {Math.max(1, pagination.totalPages)}
                    </span>
                    <button
                      type="button"
                      className={styles.secondary}
                      disabled={usersPage >= pagination.totalPages || usersLoading}
                      onClick={() => setUsersPage((page) => page + 1)}
                    >
                      Próxima
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </nav>
                </>
              )}
            </>
          )}
          {activeTab === 'reports' && (
            <>
              <div className={styles.sectionHeading}>
                <h2>Denúncias de conteúdo</h2>
                <p>
                  Confira o motivo e a publicação antes de agir. A exclusão remove a postagem e
                  resolve a denúncia.
                </p>
              </div>
              {loading && !reportsList.length ? (
                <p role="status" className={styles.muted}>
                  Carregando denúncias…
                </p>
              ) : !reportsList.length && failedLoads.includes(2) ? (
                <p className={styles.muted}>
                  Denúncias temporariamente indisponíveis. Use “Tentar novamente” para consultar a
                  fila.
                </p>
              ) : !reportsList.length ? (
                <div className={styles.empty}>
                  <h3>Nenhuma denúncia pendente</h3>
                  <p>Novos relatos de conteúdo aparecerão nesta fila para análise.</p>
                </div>
              ) : (
                <div className={styles.rows}>
                  {reportsList.map((report) => (
                    <article
                      key={report.id}
                      className={styles.report}
                      aria-label={`Denúncia: ${report.post.title}`}
                    >
                      <header className={styles.rowHeader}>
                        <h3>{report.reason}</h3>
                        <span className={styles.muted}>{formatDate(report.created_at)}</span>
                      </header>
                      <p className={styles.muted}>
                        Relato de @{report.user.username} · Publicação de @
                        {report.post.author.username}
                      </p>
                      <Link href={`/post/${report.post.id}`} className={styles.postLink}>
                        {report.post.title}
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                      <p className={styles.postBody}>{report.post.body}</p>
                      <form
                        className={styles.review}
                        onSubmit={(event) => {
                          event.preventDefault();
                          void performAction(
                            report.id,
                            '/api/admin/reports',
                            'PATCH',
                            {
                              report_id: report.id,
                              justification: dismissNotes[report.id]?.trim(),
                            },
                            'Denúncia encerrada. A publicação foi mantida.'
                          );
                        }}
                      >
                        <label htmlFor={`dismiss-${report.id}`}>
                          Justificativa para manter a publicação
                        </label>
                        <textarea
                          id={`dismiss-${report.id}`}
                          maxLength={1000}
                          value={dismissNotes[report.id] ?? ''}
                          disabled={Boolean(pendingAction)}
                          onChange={(event) =>
                            setDismissNotes((current) => ({
                              ...current,
                              [report.id]: event.target.value,
                            }))
                          }
                          placeholder="Explique por que o conteúdo não deve ser removido."
                        />
                        <button
                          className={styles.secondary}
                          type="submit"
                          disabled={
                            Boolean(pendingAction) ||
                            (dismissNotes[report.id]?.trim().length ?? 0) < 5
                          }
                        >
                          Encerrar denúncia e manter publicação
                        </button>
                      </form>
                      {confirmDeleteId === report.id ? (
                        <div className={styles.confirmation}>
                          <p>
                            Excluir “{report.post.title}”? Esta ação remove a publicação e resolve a
                            denúncia.
                          </p>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.danger}
                              disabled={busy}
                              onClick={() =>
                                void performAction(
                                  report.id,
                                  '/api/admin/reports',
                                  'DELETE',
                                  { report_id: report.id, post_id: report.post.id },
                                  'Publicação removida e denúncia resolvida.'
                                )
                              }
                            >
                              {pendingAction === report.id ? 'Excluindo…' : 'Confirmar exclusão'}
                            </button>
                            <button
                              type="button"
                              className={styles.secondary}
                              disabled={busy}
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={styles.danger}
                          disabled={busy}
                          onClick={() => setConfirmDeleteId(report.id)}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                          Excluir publicação e resolver
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </PlatformPageShell>
  );
}
