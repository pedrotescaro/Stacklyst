'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Briefcase,
  Swords,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Search,
  Check,
  X,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

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

export function AdminContent({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'evaluators' | 'users' | 'reports'>(
    'overview'
  );
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [evaluatorApps, setEvaluatorApps] = useState<EvaluatorApp[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mRes, eRes, uRes, rRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/evaluators'),
        fetch('/api/admin/users'),
        fetch('/api/admin/reports'),
      ]);

      if (mRes.ok) setMetrics(await mRes.json());
      if (eRes.ok) setEvaluatorApps(await eRes.json());
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsersList(uData.users || []);
      }
      if (rRes.ok) setReportsList(await rRes.json());
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  const handleReviewEvaluator = async (
    applicationId: string,
    decision: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      const res = await fetch('/api/admin/evaluators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          decision,
          notes: reviewNotes[applicationId] || '',
        }),
      });

      if (res.ok) {
        setActionMessage(
          `Candidatura ${decision === 'APPROVED' ? 'aprovada' : 'rejeitada'} com sucesso.`
        );
        loadData();
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        const data = await res.json();
        setActionMessage(data.message || 'Não foi possível analisar a candidatura.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModerateEvaluator = async (
    evaluatorId: string,
    applicationId: string,
    action: 'WARN' | 'SUSPEND' | 'REINSTATE' | 'REVOKE'
  ) => {
    try {
      const res = await fetch('/api/admin/evaluators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluator_id: evaluatorId,
          action,
          notes: reviewNotes[applicationId] || '',
        }),
      });
      const data = await res.json();
      setActionMessage(
        res.ok ? 'Medida aplicada ao perfil de avaliador.' : data.message || 'Ação recusada.'
      );
      if (res.ok) loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });

      if (res.ok) {
        setActionMessage(`Papel do usuário atualizado para ${newRole}.`);
        loadData();
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        const data = await res.json();
        setActionMessage(data.message || 'Não foi possível alterar o papel.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReportedPost = async (reportId: string, postId: string) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, post_id: postId }),
      });

      if (res.ok) {
        setActionMessage('Post denunciado removido e denúncia resolvida.');
        loadData();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <main className="flex-1 min-w-0 max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dd-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                Painel Administrativo
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-dd-text mt-2">
              Central de Gestão & Moderação
            </h1>
            <p className="text-sm text-dd-muted font-medium mt-1">
              Controle de usuários, aprovação de avaliadores de código, vagas e governança do
              Stacklyst.
            </p>
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-dd-border/60 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-dd-muted hover:text-dd-text hover:bg-dd-surface'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('evaluators')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap relative ${
              activeTab === 'evaluators'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-dd-muted hover:text-dd-text hover:bg-dd-surface'
            }`}
          >
            Avaliadores
            {evaluatorApps.filter((a) => a.status === 'PENDING').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black">
                {evaluatorApps.filter((a) => a.status === 'PENDING').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-dd-muted hover:text-dd-text hover:bg-dd-surface'
            }`}
          >
            Gestão de Usuários
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-dd-muted hover:text-dd-text hover:bg-dd-surface'
            }`}
          >
            Moderação
            {reportsList.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black">
                {reportsList.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-dd-surface border border-dd-border/80 space-y-2">
                <div className="flex items-center justify-between text-dd-muted">
                  <span className="text-xs font-bold uppercase tracking-wider">Usuários</span>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-dd-text">{metrics.users.total}</div>
                <p className="text-[11px] text-dd-muted font-medium">
                  {metrics.users.active} ativos nesta semana
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dd-surface border border-dd-border/80 space-y-2">
                <div className="flex items-center justify-between text-dd-muted">
                  <span className="text-xs font-bold uppercase tracking-wider">Duelos</span>
                  <Swords className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-2xl font-black text-dd-text">{metrics.duels.total}</div>
                <p className="text-[11px] text-dd-muted font-medium">
                  {metrics.duels.completed} concluídos
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dd-surface border border-dd-border/80 space-y-2">
                <div className="flex items-center justify-between text-dd-muted">
                  <span className="text-xs font-bold uppercase tracking-wider">Vagas Abertas</span>
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-dd-text">{metrics.jobs.active}</div>
                <p className="text-[11px] text-dd-muted font-medium">
                  {metrics.companies.verified} empresas verificadas
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dd-surface border border-dd-border/80 space-y-2">
                <div className="flex items-center justify-between text-dd-muted">
                  <span className="text-xs font-bold uppercase tracking-wider">Eventos Ativos</span>
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-dd-text">{metrics.events.active}</div>
                <p className="text-[11px] text-dd-muted font-medium">
                  {metrics.events.total} eventos registrados
                </p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-3xl border border-dd-border bg-gradient-to-br from-dd-surface to-dd-surface/40 space-y-4">
              <h2 className="text-lg font-black text-dd-text flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Ações Administrativas Rápidas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab('evaluators')}
                  className="p-4 rounded-2xl bg-dd-bg border border-dd-border hover:border-blue-500/50 transition-all text-left space-y-1"
                >
                  <p className="text-sm font-bold text-dd-text">Revisar Avaliadores</p>
                  <p className="text-xs text-dd-muted">
                    {evaluatorApps.filter((a) => a.status === 'PENDING').length} candidaturas
                    pendentes
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="p-4 rounded-2xl bg-dd-bg border border-dd-border hover:border-red-500/50 transition-all text-left space-y-1"
                >
                  <p className="text-sm font-bold text-dd-text">Fila de Denúncias</p>
                  <p className="text-xs text-dd-muted">{reportsList.length} itens a moderar</p>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-2xl bg-dd-bg border border-dd-border hover:border-emerald-500/50 transition-all text-left space-y-1"
                >
                  <p className="text-sm font-bold text-dd-text">Permissões RBAC</p>
                  <p className="text-xs text-dd-muted">Promover a Recrutador ou Avaliador</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Evaluator Applications */}
        {activeTab === 'evaluators' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-dd-text">
              Candidaturas ao Papel de Avaliador de Código
            </h2>

            {evaluatorApps.length === 0 ? (
              <div className="p-8 text-center bg-dd-surface rounded-2xl border border-dd-border text-dd-muted font-bold">
                Nenhuma candidatura registrada no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {evaluatorApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-dd-surface border border-dd-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-dd-text">@{app.user.username}</span>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                          {app.user.total_xp.toLocaleString('pt-BR')} XP
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            app.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : app.status === 'REJECTED'
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-orange-500/15 text-orange-400'
                          }`}
                        >
                          {app.status === 'APPROVED'
                            ? 'Aprovado'
                            : app.status === 'REJECTED'
                              ? 'Rejeitado'
                              : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-xs text-dd-text font-medium bg-dd-bg/60 p-3 rounded-xl border border-dd-border/40">
                        &quot;{app.motivation}&quot;
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.tech_stack.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-dd-border/50 text-dd-muted"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="text-[11px] text-dd-muted space-y-1">
                        <p>
                          Rubrica: experiência (trilha completa ou 1.000 XP), motivação com 80+
                          caracteres e ao menos uma tecnologia avaliável. A aprovação é bloqueada no
                          servidor se algum item falhar.
                        </p>
                        {app.user.evaluator_profile && (
                          <p className="font-bold text-dd-text">
                            Reputação {app.user.evaluator_profile.reputation} ·{' '}
                            {app.user.evaluator_profile.evaluations_count} avaliações ·{' '}
                            {app.user.evaluator_profile.status}
                          </p>
                        )}
                      </div>
                    </div>

                    {(app.status === 'PENDING' || app.user.evaluator_profile) && (
                      <div className="space-y-2 shrink-0 w-full md:w-80">
                        <textarea
                          rows={3}
                          value={reviewNotes[app.id] || ''}
                          onChange={(event) =>
                            setReviewNotes((current) => ({
                              ...current,
                              [app.id]: event.target.value,
                            }))
                          }
                          placeholder="Justificativa objetiva (mínimo de 20 caracteres)"
                          className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs text-dd-text outline-none focus:border-blue-500 resize-none"
                        />
                        {app.status === 'PENDING' ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              disabled={(reviewNotes[app.id] || '').trim().length < 20}
                              onClick={() => handleReviewEvaluator(app.id, 'APPROVED')}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              Aprovar
                            </button>
                            <button
                              disabled={(reviewNotes[app.id] || '').trim().length < 20}
                              onClick={() => handleReviewEvaluator(app.id, 'REJECTED')}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 text-red-400 font-bold text-xs border border-red-500/30 transition-all active:scale-95 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              Rejeitar
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            {app.user.evaluator_profile?.status === 'SUSPENDED' ||
                            app.user.evaluator_profile?.status === 'REVOKED' ? (
                              <button
                                disabled={(reviewNotes[app.id] || '').trim().length < 20}
                                onClick={() =>
                                  handleModerateEvaluator(app.user_id, app.id, 'REINSTATE')
                                }
                                className="px-3 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs disabled:opacity-40"
                              >
                                Reintegrar
                              </button>
                            ) : (
                              <>
                                <button
                                  disabled={(reviewNotes[app.id] || '').trim().length < 20}
                                  onClick={() =>
                                    handleModerateEvaluator(app.user_id, app.id, 'WARN')
                                  }
                                  className="px-3 py-2 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold text-xs disabled:opacity-40"
                                >
                                  Advertir (-10)
                                </button>
                                <button
                                  disabled={(reviewNotes[app.id] || '').trim().length < 20}
                                  onClick={() =>
                                    handleModerateEvaluator(app.user_id, app.id, 'SUSPEND')
                                  }
                                  className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-xs disabled:opacity-40"
                                >
                                  Suspender
                                </button>
                              </>
                            )}
                            {app.user.evaluator_profile?.status !== 'REVOKED' && (
                              <button
                                disabled={(reviewNotes[app.id] || '').trim().length < 20}
                                onClick={() =>
                                  handleModerateEvaluator(app.user_id, app.id, 'REVOKE')
                                }
                                className="px-3 py-2 rounded-xl text-red-400 font-bold text-xs disabled:opacity-40"
                              >
                                Revogar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-black text-dd-text">Usuários e Permissões (RBAC)</h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-dd-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dd-surface border border-dd-border rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-dd-text outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <p className="text-xs text-dd-muted">
              A função EVALUATOR só é concedida pelo fluxo de candidaturas. Esta tabela não ignora a
              rubrica nem a aprovação registrada.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-dd-border bg-dd-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-dd-bg/60 border-b border-dd-border text-dd-muted uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-3.5">Usuário</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">XP</th>
                    <th className="p-3.5">Papel Atual</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dd-border/50 font-medium">
                  {usersList
                    .filter(
                      (u) =>
                        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-dd-bg/30 transition-colors">
                        <td className="p-3.5 font-bold text-dd-text">@{u.username}</td>
                        <td className="p-3.5 text-dd-muted">{u.email}</td>
                        <td className="p-3.5 font-mono text-blue-400 font-bold">
                          {u.total_xp.toLocaleString('pt-BR')}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              u.role === 'ADMIN'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : u.role === 'EVALUATOR'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : u.role === 'RECRUITER'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-dd-border/40 text-dd-muted'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="bg-dd-bg border border-dd-border rounded-lg px-2 py-1 text-xs font-bold text-dd-text outline-none cursor-pointer"
                          >
                            <option value="USER">USER (Desenvolvedor)</option>
                            {u.role === 'EVALUATOR' && (
                              <option value="EVALUATOR">EVALUATOR (Avaliador)</option>
                            )}
                            <option value="RECRUITER">RECRUITER (Empresa)</option>
                            <option value="ADMIN">ADMIN (Administrador)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Moderation Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-dd-text">Denúncias Pendentes de Conteúdo</h2>

            {reportsList.length === 0 ? (
              <div className="p-8 text-center bg-dd-surface rounded-2xl border border-dd-border text-dd-muted font-bold">
                Nenhuma denúncia pendente no momento. Comunidade segura!
              </div>
            ) : (
              <div className="space-y-3">
                {reportsList.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 rounded-2xl bg-dd-surface border border-dd-border/80 flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Motivo: {rep.reason}</span>
                      </div>
                      <p className="text-xs text-dd-muted">
                        Denunciado por @{rep.user.username} | Autor do post: @
                        {rep.post.author.username}
                      </p>
                      <div className="p-3 rounded-xl bg-dd-bg border border-dd-border/40 text-xs text-dd-text font-medium">
                        <p className="font-bold mb-1">{rep.post.title}</p>
                        <p className="line-clamp-2">{rep.post.body}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteReportedPost(rep.id, rep.post.id)}
                      className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                    >
                      Excluir Post e Resolver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
