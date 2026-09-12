'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  MapPin,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { AuthorAvatar } from '@/components/AuthorAvatar';

interface JobApplicationItem {
  id: string;
  job_id: string;
  user_id: string;
  stage_id: string | null;
  status: string;
  technical_score: number | null;
  feedback: string | null;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    total_xp: number;
    bio: string | null;
    github_username: string | null;
  };
  stage?: {
    id: string;
    title: string;
    type: string;
    order: number;
  } | null;
}

interface RecruiterJobItem {
  id: string;
  title: string;
  description: string;
  level: string;
  technologies: string[];
  modality: string;
  location: string | null;
  contract_type: string;
  salary_min: number | null;
  salary_max: number | null;
  status: string;
  created_at: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    location: string | null;
    is_verified: boolean;
  };
  stages: { id: string; title: string; type: string; order: number }[];
  _count: {
    applications: number;
  };
}

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  APPLIED: { label: 'Inscrito', bg: 'bg-blue-500/15', text: 'text-blue-400' },
  REVIEWING: { label: 'Em Análise', bg: 'bg-amber-500/15', text: 'text-amber-400' },
  TESTING: { label: 'Desafio Técnico', bg: 'bg-purple-500/15', text: 'text-purple-400' },
  INTERVIEW: { label: 'Entrevista', bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
  ACCEPTED: { label: 'Aprovado', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  REJECTED: { label: 'Recusado', bg: 'bg-rose-500/15', text: 'text-rose-400' },
};

export function RecruiterContent({ user }: { user: any }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [creatingCompany, setCreatingCompany] = useState(false);

  // Job creation state
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobLevel, setJobLevel] = useState('JUNIOR');
  const [jobModality, setJobModality] = useState('REMOTE');
  const [jobTechnologies, setJobTechnologies] = useState('React, TypeScript, Node.js');
  const [jobSalaryMin, setJobSalaryMin] = useState(4000);
  const [jobSalaryMax, setJobSalaryMax] = useState(7000);
  const [jobRequirements, setJobRequirements] = useState('Conhecimento em React, Git, REST APIs');
  const [jobBenefits, setJobBenefits] = useState(
    'Vale Refeição, Convênio Médico, Horário Flexível'
  );
  const [creatingJob, setCreatingJob] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recruiter Dashboard Jobs & Applicants State
  const [jobs, setJobs] = useState<RecruiterJobItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [applicationsMap, setApplicationsMap] = useState<Record<string, JobApplicationItem[]>>({});
  const [loadingApplications, setLoadingApplications] = useState<Record<string, boolean>>({});
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [selectedCompanyFilter]);

  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
        if (data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const url =
        selectedCompanyFilter && selectedCompanyFilter !== 'ALL'
          ? `/api/jobs?company_id=${selectedCompanyFilter}&status=ALL`
          : '/api/jobs?status=ALL';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Error loading recruiter jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    setLoadingApplications((prev) => ({ ...prev, [jobId]: true }));
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplicationsMap((prev) => ({ ...prev, [jobId]: data }));
      }
    } catch (err) {
      console.error('Error loading job applications:', err);
    } finally {
      setLoadingApplications((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const toggleExpandJob = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
      if (!applicationsMap[jobId]) {
        loadApplications(jobId);
      }
    }
  };

  const handleUpdateApplicationStatus = async (
    jobId: string,
    applicationId: string,
    newStatus: string
  ) => {
    setUpdatingAppId(applicationId);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setApplicationsMap((prev) => ({
          ...prev,
          [jobId]:
            prev[jobId]?.map((app) =>
              app.id === applicationId ? { ...app, status: newStatus } : app
            ) || [],
        }));
        setSuccessMsg('Status do candidato atualizado com sucesso!');
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        const errData = await res.json().catch(() => null);
        setErrorMsg(errData?.error || 'Erro ao atualizar status do candidato.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro de conexão ao atualizar status.');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCompany(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyName,
          website: companyWebsite,
          location: companyLocation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg('Empresa cadastrada com sucesso!');
        loadCompanies();
        if (data.company?.id) setSelectedCompanyId(data.company.id);
        setCompanyName('');
        setCompanyWebsite('');
        setCompanyLocation('');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        const errData = await res.json().catch(() => null);
        setErrorMsg(errData?.error || 'Erro ao cadastrar empresa.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro de conexão ao cadastrar empresa.');
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;

    setCreatingJob(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          title: jobTitle,
          description: jobDescription,
          level: jobLevel,
          modality: jobModality,
          technologies: jobTechnologies
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          salary_min: Number(jobSalaryMin),
          salary_max: Number(jobSalaryMax),
          requirements: jobRequirements
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean),
          benefits: jobBenefits
            .split(',')
            .map((b) => b.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        setSuccessMsg('Vaga publicada com sucesso e vinculada às etapas de testes do Stacklyst!');
        setJobTitle('');
        setJobDescription('');
        loadJobs(); // Instantly update jobs list
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        const errData = await res.json().catch(() => null);
        setErrorMsg(errData?.error || 'Erro ao publicar vaga.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro de conexão ao publicar vaga.');
    } finally {
      setCreatingJob(false);
    }
  };

  const totalApplications = jobs.reduce((acc, curr) => acc + (curr._count?.applications || 0), 0);

  return (
    <div className="dd-platform-shell min-h-screen">
      <Sidebar user={user} />

      <main className="flex-1 min-w-0 max-w-5xl mx-auto p-4 md:p-8 space-y-6 pb-28 md:pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dd-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                Painel Corporativo
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-dd-text mt-2 tracking-tight">
              Recrutamento Técnico Stacklyst
            </h1>
            <p className="text-xs sm:text-sm text-dd-muted font-medium mt-1 leading-relaxed">
              Cadastre sua empresa, acompanhe o número de inscritos nas vagas e gerencie candidatos
              com base em seus desafios práticos e duelos.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                loadCompanies();
                loadJobs();
              }}
              disabled={loadingJobs}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dd-border bg-dd-surface hover:bg-dd-bg active:scale-95 text-xs font-bold text-dd-text transition-all disabled:opacity-50 cursor-pointer"
              title="Atualizar painel"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingJobs ? 'animate-spin text-blue-400' : ''}`}
              />
              <span>Atualizar Painel</span>
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-dd-surface border border-dd-border shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div
                className="text-2xl font-black text-dd-text tracking-tight"
                data-testid="metric-total-applications"
              >
                {totalApplications}
              </div>
              <div className="text-xs font-bold text-dd-muted">Candidaturas Recebidas</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dd-surface border border-dd-border shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div
                className="text-2xl font-black text-dd-text tracking-tight"
                data-testid="metric-total-jobs"
              >
                {jobs.length}
              </div>
              <div className="text-xs font-bold text-dd-muted">Vagas Publicadas</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dd-surface border border-dd-border shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div
                className="text-2xl font-black text-dd-text tracking-tight"
                data-testid="metric-total-companies"
              >
                {companies.length}
              </div>
              <div className="text-xs font-bold text-dd-muted">Empresas Gerenciadas</div>
            </div>
          </div>
        </div>

        {/* SECTION: Vagas Publicadas e Inscritos */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dd-border/60 pb-3">
            <div>
              <h2 className="text-lg font-black text-dd-text flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Vagas Publicadas e Candidaturas
              </h2>
              <p className="text-xs text-dd-muted font-medium mt-0.5">
                Veja o número de inscritos por vaga e acesse o perfil técnico de cada candidato.
              </p>
            </div>

            {companies.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-dd-muted hidden sm:inline">Empresa:</span>
                <select
                  value={selectedCompanyFilter}
                  onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                  className="bg-dd-surface border border-dd-border rounded-xl px-3 py-1.5 text-xs font-bold text-dd-text outline-none cursor-pointer"
                >
                  <option value="ALL">Todas as empresas</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loadingJobs ? (
            <div className="p-8 text-center rounded-3xl bg-dd-surface/50 border border-dd-border animate-pulse">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin text-blue-400 mb-2" />
              <p className="text-xs font-bold text-dd-muted">Carregando vagas publicadas...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-dd-surface border border-dd-border space-y-3 shadow-sm">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-dd-text">Nenhuma vaga publicada ainda</h3>
              <p className="text-xs text-dd-muted font-medium max-w-md mx-auto leading-relaxed">
                Publique sua primeira oportunidade técnica no formulário abaixo para começar a
                receber candidaturas de desenvolvedores da plataforma.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const isExpanded = expandedJobId === job.id;
                const applicants = applicationsMap[job.id] || [];
                const isLoadingApplicants = loadingApplications[job.id];
                const applicantsCount = job._count?.applications || 0;

                return (
                  <div
                    key={job.id}
                    className="rounded-3xl bg-dd-surface border border-dd-border overflow-hidden transition-all shadow-sm"
                  >
                    {/* Job Card Header Info */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                              {job.level}
                            </span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              {job.modality}
                            </span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25">
                              {job.contract_type}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                job.status === 'OPEN'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                  : 'bg-dd-bg text-dd-muted border-dd-border'
                              }`}
                            >
                              {job.status === 'OPEN' ? 'Aberta' : 'Encerrada'}
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-black text-dd-text tracking-tight">
                            {job.title}
                          </h3>

                          <div className="flex items-center gap-2 text-xs font-bold text-dd-muted flex-wrap">
                            <span className="text-dd-text flex items-center gap-1">
                              {job.company.name}
                              {job.company.is_verified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                              )}
                            </span>
                            {job.location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-dd-muted" />
                                  {job.location}
                                </span>
                              </>
                            )}
                            {job.salary_min && job.salary_max && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-emerald-400">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  R$ {job.salary_min.toLocaleString('pt-BR')} - R${' '}
                                  {job.salary_max.toLocaleString('pt-BR')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* APPLICANTS COUNTER BADGE */}
                        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                          <div
                            data-testid={`job-applicants-count-${job.id}`}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border font-bold text-xs sm:text-sm transition-all ${
                              applicantsCount > 0
                                ? 'bg-blue-500/15 border-blue-500/40 text-blue-400 shadow-sm'
                                : 'bg-dd-bg/80 border-dd-border/80 text-dd-muted'
                            }`}
                          >
                            <Users className="w-4 h-4 shrink-0" />
                            <span>
                              <strong className="font-black text-dd-text text-sm sm:text-base mr-1">
                                {applicantsCount}
                              </strong>
                              {applicantsCount === 1 ? 'pessoa inscrita' : 'pessoas inscritas'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Technologies Chips */}
                      {job.technologies && job.technologies.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {job.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-lg bg-dd-bg border border-dd-border/60 text-dd-muted"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-dd-border/50 flex-wrap">
                        <button
                          type="button"
                          onClick={() => toggleExpandJob(job.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dd-border bg-dd-bg hover:bg-dd-surface active:scale-95 text-xs font-black text-dd-text transition-all cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span>
                            {isExpanded
                              ? 'Ocultar Candidatos'
                              : `Ver Inscritos (${applicantsCount})`}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-dd-muted hover:text-blue-400 transition-colors"
                        >
                          <span>Ver vaga pública</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* EXPANDED APPLICANTS DRAWER */}
                    {isExpanded && (
                      <div className="px-5 pb-6 pt-2 bg-dd-bg/40 border-t border-dd-border space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between gap-2 pt-2">
                          <h4 className="text-xs sm:text-sm font-black text-dd-text uppercase tracking-wider flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-emerald-400" />
                            Candidatos Inscritos ({applicantsCount})
                          </h4>
                          <button
                            type="button"
                            onClick={() => loadApplications(job.id)}
                            disabled={isLoadingApplicants}
                            className="text-[11px] font-bold text-dd-muted hover:text-dd-text flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RefreshCw
                              className={`w-3 h-3 ${isLoadingApplicants ? 'animate-spin' : ''}`}
                            />
                            <span>Recarregar</span>
                          </button>
                        </div>

                        {isLoadingApplicants ? (
                          <div className="p-6 text-center text-xs font-bold text-dd-muted">
                            <RefreshCw className="w-4 h-4 mx-auto animate-spin text-blue-400 mb-1" />
                            Carregando perfil dos candidatos inscritos...
                          </div>
                        ) : applicants.length === 0 ? (
                          <div className="p-6 text-center rounded-2xl bg-dd-surface border border-dd-border text-xs text-dd-muted font-medium">
                            Nenhum candidato se inscreveu nesta vaga ainda.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {applicants.map((app) => {
                              const statusConfig = STATUS_LABELS[app.status] || {
                                label: app.status,
                                bg: 'bg-dd-surface',
                                text: 'text-dd-muted',
                              };
                              const isUpdating = updatingAppId === app.id;

                              return (
                                <div
                                  key={app.id}
                                  className="p-4 rounded-2xl bg-dd-surface border border-dd-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                                >
                                  {/* Candidate Profile Details */}
                                  <div className="flex items-center gap-3 min-w-0">
                                    <AuthorAvatar
                                      username={app.user.username}
                                      avatar_url={app.user.avatar_url}
                                      size="md"
                                      className="!w-10 !h-10 border-dd-border"
                                    />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-black text-dd-text truncate">
                                          @{app.user.username}
                                        </span>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                          {app.user.total_xp} XP
                                        </span>
                                        {app.user.github_username && (
                                          <span className="text-[10px] font-mono text-dd-muted">
                                            gh: @{app.user.github_username}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-dd-muted font-medium mt-0.5">
                                        Inscrito em{' '}
                                        {new Date(app.created_at).toLocaleDateString('pt-BR')}
                                        {app.stage && (
                                          <span className="ml-2 text-blue-400 font-semibold">
                                            • Etapa: {app.stage.title}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Status Selector / Actions */}
                                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                    <span
                                      className={`text-xs font-bold px-2.5 py-1 rounded-xl border border-current/30 ${statusConfig.bg} ${statusConfig.text}`}
                                    >
                                      {statusConfig.label}
                                    </span>

                                    <select
                                      value={app.status}
                                      disabled={isUpdating}
                                      onChange={(e) =>
                                        handleUpdateApplicationStatus(
                                          job.id,
                                          app.id,
                                          e.target.value
                                        )
                                      }
                                      className="bg-dd-bg border border-dd-border rounded-xl px-2.5 py-1 text-xs font-bold text-dd-text outline-none cursor-pointer focus:border-blue-500 disabled:opacity-50"
                                      aria-label={`Atualizar status de @${app.user.username}`}
                                    >
                                      <option value="APPLIED">Inscrito</option>
                                      <option value="REVIEWING">Em Análise</option>
                                      <option value="TESTING">Desafio Técnico</option>
                                      <option value="INTERVIEW">Entrevista</option>
                                      <option value="ACCEPTED">Aprovado</option>
                                      <option value="REJECTED">Recusado</option>
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Forms Grid: Register Company & Publish Job */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-dd-border/60">
          {/* Register Company */}
          <form
            onSubmit={handleCreateCompany}
            className="p-6 rounded-3xl bg-dd-surface border border-dd-border space-y-4 shadow-sm"
          >
            <h2 className="text-base font-black text-dd-text flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              1. Cadastrar Perfil da Empresa
            </h2>

            <div>
              <label className="block text-xs font-bold text-dd-text mb-1">Nome da Empresa</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: TechCorp Brasil"
                className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-bold text-dd-text outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dd-text mb-1">Website</label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://techcorp.com.br"
                className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-bold text-dd-text outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dd-text mb-1">Localização</label>
              <input
                type="text"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                placeholder="São Paulo, SP - Remoto"
                className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-bold text-dd-text outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={creatingCompany}
              className="w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {creatingCompany ? 'Salvando...' : 'Cadastrar Empresa'}
            </button>
          </form>

          {/* Publish Job */}
          <form
            onSubmit={handleCreateJob}
            className="p-6 rounded-3xl bg-dd-surface border border-dd-border space-y-4 shadow-sm"
          >
            <h2 className="text-base font-black text-dd-text flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              2. Publicar Oportunidade Técnica
            </h2>

            <div>
              <label className="block text-xs font-bold text-dd-text mb-1">Empresa</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-bold text-dd-text outline-none cursor-pointer"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-dd-text mb-1">Título da Vaga</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex: Desenvolvedor Front-end React Júnior"
                className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-bold text-dd-text outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-dd-text mb-1">Nível</label>
                <select
                  value={jobLevel}
                  onChange={(e) => setJobLevel(e.target.value)}
                  className="w-full bg-dd-bg border border-dd-border rounded-xl p-2 text-xs font-bold text-dd-text outline-none"
                >
                  <option value="ESTAGIO">Estágio</option>
                  <option value="JUNIOR">Júnior</option>
                  <option value="PLENO">Pleno</option>
                  <option value="SENIOR">Sênior</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-dd-text mb-1">Modalidade</label>
                <select
                  value={jobModality}
                  onChange={(e) => setJobModality(e.target.value)}
                  className="w-full bg-dd-bg border border-dd-border rounded-xl p-2 text-xs font-bold text-dd-text outline-none"
                >
                  <option value="REMOTE">Remoto</option>
                  <option value="HYBRID">Híbrido</option>
                  <option value="ONSITE">Presencial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dd-text mb-1">Tecnologias</label>
              <input
                type="text"
                value={jobTechnologies}
                onChange={(e) => setJobTechnologies(e.target.value)}
                placeholder="React, TypeScript, CSS, Git"
                className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-bold text-dd-text outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dd-text mb-1">Descrição</label>
              <textarea
                rows={3}
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Detalhes sobre a posição, dia a dia e responsabilidades..."
                className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-medium text-dd-text outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={creatingJob || !selectedCompanyId}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {creatingJob ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Publicar Vaga com Etapas Técnicas</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
