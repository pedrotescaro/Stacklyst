'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Users,
} from 'lucide-react';
import { PlatformPageHeader, PlatformPageShell } from '@/components/PlatformPageShell';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import styles from './recruiter.module.css';

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

const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Candidatura enviada',
  IN_REVIEW: 'Em análise',
  TECHNICAL_CHALLENGE: 'Desafio técnico',
  DUEL: 'Duelo técnico',
  EVALUATION: 'Avaliação técnica',
  INTERVIEW: 'Entrevista',
  OFFER: 'Proposta',
  REJECTED: 'Não selecionado',
};
const normalizeStatus = (status: string) =>
  (
    ({ REVIEWING: 'IN_REVIEW', TESTING: 'TECHNICAL_CHALLENGE', ACCEPTED: 'OFFER' }) as Record<
      string,
      string
    >
  )[status] || status;
const LEVEL_LABELS: Record<string, string> = {
  ESTAGIO: 'Estágio',
  JUNIOR: 'Júnior',
  PLENO: 'Pleno',
  SENIOR: 'Sênior',
  ESPECIALISTA: 'Especialista',
};
const MODALITY_LABELS: Record<string, string> = {
  REMOTE: 'Remoto',
  HYBRID: 'Híbrido',
  ONSITE: 'Presencial',
};
const JOB_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberta',
  CLOSED: 'Encerrada',
  DRAFT: 'Rascunho',
};
const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const salaryLabel = (job: RecruiterJobItem) =>
  job.salary_min != null && job.salary_max != null
    ? `${money(job.salary_min)} – ${money(job.salary_max)}`
    : job.salary_min != null
      ? `A partir de ${money(job.salary_min)}`
      : job.salary_max != null
        ? `Até ${money(job.salary_max)}`
        : 'Remuneração não informada';

export function RecruiterContent({ user }: { user: any }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState('');
  const [jobsError, setJobsError] = useState('');
  const [applicationsErrors, setApplicationsErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<'jobs' | 'companies' | 'create'>('jobs');
  const jobsRequest = useRef(0);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
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
  const [jobLocation, setJobLocation] = useState('');
  const [jobContract, setJobContract] = useState('CLT');
  const [jobTechnologies, setJobTechnologies] = useState('');
  const [jobSalaryMin, setJobSalaryMin] = useState('');
  const [jobSalaryMax, setJobSalaryMax] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [jobBenefits, setJobBenefits] = useState('');
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
  const [applicationDrafts, setApplicationDrafts] = useState<
    Record<string, { stageId: string; feedback: string }>
  >({});

  useEffect(() => {
    if (successMsg || errorMsg) feedbackRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [successMsg, errorMsg]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    setCompaniesError('');
    try {
      const response = await fetch('/api/companies?mine=true', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const data = await response.json();
      const available = Array.isArray(data) ? data : [];
      setCompanies(available);
      setSelectedCompanyId((current) =>
        available.some((company) => company.id === current) ? current : available[0]?.id || ''
      );
    } catch {
      setCompaniesError('Não foi possível carregar suas empresas. Tente novamente.');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadJobs = useCallback(async () => {
    const request = ++jobsRequest.current;
    setLoadingJobs(true);
    setJobsError('');
    try {
      const query = new URLSearchParams({ status: 'ALL', mine: 'true' });
      if (selectedCompanyFilter !== 'ALL') query.set('company_id', selectedCompanyFilter);
      const response = await fetch(`/api/jobs?${query}`, { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (request === jobsRequest.current) setJobs(Array.isArray(data) ? data : []);
    } catch {
      if (request === jobsRequest.current)
        setJobsError('Não foi possível carregar suas vagas. Atualize a lista e tente novamente.');
    } finally {
      if (request === jobsRequest.current) setLoadingJobs(false);
    }
  }, [selectedCompanyFilter]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const loadApplications = async (jobId: string) => {
    setLoadingApplications((prev) => ({ ...prev, [jobId]: true }));
    setApplicationsErrors((previous) => ({ ...previous, [jobId]: '' }));
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setApplicationsMap((prev) => ({ ...prev, [jobId]: Array.isArray(data) ? data : [] }));
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error('Error loading job applications:', err);
      setApplicationsErrors((previous) => ({
        ...previous,
        [jobId]:
          'Não foi possível carregar as candidaturas. Recarregue a lista para tentar novamente.',
      }));
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
    newStatus: string,
    details?: { stageId: string; feedback: string }
  ) => {
    if (updatingAppId) return;
    setUpdatingAppId(applicationId);
    newStatus = normalizeStatus(newStatus);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          status: newStatus,
          ...(details
            ? { stage_id: details.stageId || undefined, feedback: details.feedback }
            : {}),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setApplicationsMap((prev) => ({
          ...prev,
          [jobId]:
            prev[jobId]?.map((app) =>
              app.id === applicationId ? (result.application ?? { ...app, status: newStatus }) : app
            ) || [],
        }));
        if (details)
          setApplicationDrafts((previous) => {
            const next = { ...previous };
            delete next[applicationId];
            return next;
          });
        setSuccessMsg(
          details
            ? 'Etapa e feedback salvos com sucesso!'
            : 'Status do candidato atualizado com sucesso!'
        );
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        const errData = await res.json().catch(() => null);
        setErrorMsg(errData?.message || errData?.error || 'Erro ao atualizar status do candidato.');
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
    setSuccessMsg(null);
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
        setErrorMsg(errData?.message || errData?.error || 'Erro ao cadastrar empresa.');
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
    if (!selectedCompanyId || creatingJob) return;
    if (jobSalaryMin !== '' && jobSalaryMax !== '' && Number(jobSalaryMin) > Number(jobSalaryMax)) {
      setErrorMsg('A remuneração máxima deve ser maior ou igual à mínima.');
      return;
    }

    setCreatingJob(true);
    setErrorMsg(null);
    setSuccessMsg(null);
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
          location: jobLocation.trim() || undefined,
          contract_type: jobContract,
          technologies: jobTechnologies
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          ...(jobSalaryMin !== '' ? { salary_min: Number(jobSalaryMin) } : {}),
          ...(jobSalaryMax !== '' ? { salary_max: Number(jobSalaryMax) } : {}),
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
        setSuccessMsg('Vaga publicada com sucesso! As etapas do processo já estão disponíveis.');
        setJobTitle('');
        setJobDescription('');
        loadJobs(); // Instantly update jobs list
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        const errData = await res.json().catch(() => null);
        setErrorMsg(errData?.message || errData?.error || 'Erro ao publicar vaga.');
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
    <PlatformPageShell user={user}>
      <PlatformPageHeader
        title="Painel do recrutador"
        actions={
          <button
            type="button"
            className={styles.secondary}
            title="Atualizar painel"
            aria-label="Atualizar painel"
            disabled={loadingJobs || loadingCompanies}
            onClick={() => {
              void loadCompanies();
              void loadJobs();
            }}
          >
            <RefreshCw size={17} aria-hidden="true" />
            <span>Atualizar</span>
          </button>
        }
      />
      <div className={styles.body}>
        <div>
          <h2>Da vaga à próxima contratação.</h2>
          <p className={styles.muted} style={{ marginTop: 8 }}>
            Gerencie suas empresas, publique oportunidades e acompanhe cada candidatura. Etapas e
            feedback ajudam a pessoa candidata a entender o que vem a seguir.
          </p>
        </div>
        {successMsg && (
          <p role="status" ref={feedbackRef} className={styles.notice}>
            {successMsg}
          </p>
        )}
        {errorMsg && (
          <p role="alert" ref={feedbackRef} className={styles.notice}>
            {errorMsg}
          </p>
        )}
        <dl className={styles.summary} aria-label="Resumo do recrutamento">
          <div>
            <dt>Candidaturas recebidas</dt>
            <dd data-testid="metric-total-applications">{totalApplications}</dd>
          </div>
          <div>
            <dt>Vagas publicadas</dt>
            <dd data-testid="metric-total-jobs">{jobs.length}</dd>
          </div>
          <div>
            <dt>Empresas gerenciadas</dt>
            <dd data-testid="metric-total-companies">{companies.length}</dd>
          </div>
        </dl>
        <div className={styles.tabs} role="tablist" aria-label="Seções do recrutamento">
          {(
            [
              ['jobs', 'Vagas e candidatos'],
              ['companies', 'Empresas'],
              ['create', 'Publicar vaga'],
            ] as const
          ).map(([id, label]) => (
            <button
              type="button"
              key={id}
              id={`recruiter-tab-${id}`}
              role="tab"
              aria-selected={activeSection === id}
              tabIndex={activeSection === id ? 0 : -1}
              onKeyDown={(event) => {
                const sections = ['jobs', 'companies', 'create'] as const;
                const current = sections.indexOf(id);
                let next: number | null = null;
                if (event.key === 'ArrowRight') next = (current + 1) % sections.length;
                if (event.key === 'ArrowLeft')
                  next = (current + sections.length - 1) % sections.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = sections.length - 1;
                if (next == null) return;
                event.preventDefault();
                setActiveSection(sections[next]);
                document.getElementById(`recruiter-tab-${sections[next]}`)?.focus();
              }}
              aria-controls={activeSection === id ? `recruiter-panel-${id}` : undefined}
              onClick={() => setActiveSection(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {activeSection === 'jobs' && (
          <section
            id="recruiter-panel-jobs"
            role="tabpanel"
            aria-labelledby="recruiter-tab-jobs"
            className={styles.section}
          >
            <div className={styles.toolbar}>
              <div>
                <h2>Vagas publicadas e candidaturas</h2>
                <p className={styles.muted}>
                  {user.role === 'ADMIN'
                    ? 'Visão administrativa das vagas das empresas.'
                    : 'Somente as oportunidades das empresas que você gerencia aparecem aqui.'}
                </p>
              </div>
              {companies.length > 1 && (
                <div className={styles.field}>
                  <label htmlFor="company-filter">Filtrar empresa</label>
                  <select
                    id="company-filter"
                    value={selectedCompanyFilter}
                    onChange={(event) => setSelectedCompanyFilter(event.target.value)}
                  >
                    <option value="ALL">Todas as empresas</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {loadingJobs ? (
              <div
                aria-label="Carregando vagas publicadas"
                role="status"
                className={styles.skeleton}
              >
                <span />
                <span />
                <span />
                <span className="sr-only">Carregando vagas publicadas...</span>
              </div>
            ) : jobsError ? (
              <div role="alert" className={styles.notice}>
                <p>{jobsError}</p>
                <button type="button" className={styles.link} onClick={() => void loadJobs()}>
                  Tentar novamente
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className={styles.empty}>
                <Briefcase size={30} aria-hidden="true" />
                <h3>Nenhuma vaga publicada ainda</h3>
                <p>
                  Publique sua primeira oportunidade para receber candidaturas de desenvolvedores da
                  plataforma.
                </p>
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => setActiveSection('create')}
                >
                  Publicar primeira vaga
                </button>
              </div>
            ) : (
              <div className={styles.jobList}>
                {jobs.map((job) => {
                  const expanded = expandedJobId === job.id;
                  const applicants = applicationsMap[job.id] || [];
                  const count = job._count?.applications || 0;
                  return (
                    <article key={job.id} className={styles.job}>
                      <div className={styles.jobMeta}>
                        <span className={styles.companyName}>
                          {job.company.name}
                          {job.company.is_verified && (
                            <ShieldCheck size={15} aria-label="Empresa verificada" />
                          )}
                        </span>
                        <span className={styles.status}>
                          {JOB_STATUS_LABELS[job.status] || job.status}
                        </span>
                      </div>
                      <h3>{job.title}</h3>
                      <div className={styles.jobMeta}>
                        <span>{LEVEL_LABELS[job.level] || job.level}</span>
                        <span>
                          <MapPin size={14} aria-hidden="true" />
                          {MODALITY_LABELS[job.modality] || job.modality}
                          {job.location ? ` · ${job.location}` : ''}
                        </span>
                        <span>{job.contract_type}</span>
                        <span>{salaryLabel(job)}</span>
                      </div>
                      <div className={styles.tags}>
                        {job.technologies.map((tech) => (
                          <span key={tech} className={styles.tag}>
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className={styles.jobActions}>
                        <span
                          className={styles.count}
                          data-testid={`job-applicants-count-${job.id}`}
                        >
                          <Users size={16} aria-hidden="true" />
                          <span>
                            <strong>{count}</strong>
                            {count === 1 ? 'pessoa inscrita' : 'pessoas inscritas'}
                          </span>
                        </span>
                        <Link href={`/jobs/${job.id}`} className={styles.link}>
                          Ver vaga pública
                          <ExternalLink size={15} aria-hidden="true" />
                        </Link>
                      </div>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={expanded ? `job-applicants-${job.id}` : undefined}
                        className={styles.secondary}
                        onClick={() => toggleExpandJob(job.id)}
                      >
                        {expanded ? 'Ocultar candidatos' : `Ver inscritos (${count})`}
                        {expanded ? (
                          <ChevronUp size={16} aria-hidden="true" />
                        ) : (
                          <ChevronDown size={16} aria-hidden="true" />
                        )}
                      </button>
                      {expanded && (
                        <section
                          id={`job-applicants-${job.id}`}
                          className={styles.applicants}
                          aria-label={`Candidaturas de ${job.title}`}
                        >
                          <div className={styles.toolbar}>
                            <h4>Candidatos inscritos ({count})</h4>
                            <button
                              type="button"
                              className={styles.link}
                              disabled={loadingApplications[job.id]}
                              onClick={() => void loadApplications(job.id)}
                            >
                              <RefreshCw size={15} aria-hidden="true" />
                              Recarregar
                            </button>
                          </div>
                          {loadingApplications[job.id] ? (
                            <p role="status" className={styles.muted}>
                              Carregando perfil dos candidatos inscritos...
                            </p>
                          ) : applicationsErrors[job.id] ? (
                            <p role="alert" className={styles.notice}>
                              {applicationsErrors[job.id]}
                            </p>
                          ) : !applicants.length ? (
                            <p className={styles.muted}>
                              Nenhum candidato se inscreveu nesta vaga ainda.
                            </p>
                          ) : (
                            applicants.map((app) => {
                              const draft = applicationDrafts[app.id] ?? {
                                stageId: app.stage_id ?? '',
                                feedback: app.feedback ?? '',
                              };
                              const status = normalizeStatus(app.status);
                              const busy = updatingAppId === app.id;
                              return (
                                <article
                                  key={app.id}
                                  className={styles.candidate}
                                  aria-label={`Candidatura de @${app.user.username}`}
                                >
                                  <div className={styles.candidateTop}>
                                    <AuthorAvatar
                                      username={app.user.username}
                                      avatar_url={app.user.avatar_url}
                                      size="lg"
                                    />
                                    <div>
                                      <Link
                                        href={`/profile/${app.user.username}`}
                                        className={styles.candidateName}
                                      >
                                        @{app.user.username}
                                      </Link>
                                      <div className={styles.candidateLinks}>
                                        <span>{app.user.total_xp} XP</span>
                                        {app.user.github_username && (
                                          <a
                                            href={`https://github.com/${encodeURIComponent(app.user.github_username)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            gh: @{app.user.github_username}
                                            <ExternalLink size={12} aria-hidden="true" />
                                          </a>
                                        )}
                                      </div>
                                      <p className={styles.candidateNote}>
                                        Inscrito em{' '}
                                        {new Date(app.created_at).toLocaleDateString('pt-BR')}
                                        {app.stage ? ` · Etapa: ${app.stage.title}` : ''}
                                      </p>
                                    </div>
                                  </div>
                                  {app.user.bio && <p className={styles.muted}>{app.user.bio}</p>}
                                  <div className={styles.field}>
                                    <label htmlFor={`status-${app.id}`}>
                                      Status de @{app.user.username}
                                    </label>
                                    <select
                                      id={`status-${app.id}`}
                                      aria-label={`Atualizar status de @${app.user.username}`}
                                      value={status}
                                      disabled={Boolean(updatingAppId)}
                                      onChange={(event) =>
                                        void handleUpdateApplicationStatus(
                                          job.id,
                                          app.id,
                                          event.target.value
                                        )
                                      }
                                    >
                                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                          {label}
                                        </option>
                                      ))}
                                    </select>
                                    <small>
                                      O status é salvo imediatamente. A pessoa candidata recebe uma
                                      notificação.
                                    </small>
                                  </div>
                                  {app.technical_score != null && (
                                    <p className={styles.muted}>
                                      Nota técnica: {app.technical_score} / 100
                                    </p>
                                  )}
                                  <form
                                    className={styles.form}
                                    onSubmit={(event) => {
                                      event.preventDefault();
                                      void handleUpdateApplicationStatus(
                                        job.id,
                                        app.id,
                                        status,
                                        draft
                                      );
                                    }}
                                  >
                                    <div className={styles.field}>
                                      <label htmlFor={`stage-${app.id}`}>
                                        Etapa de @{app.user.username}
                                      </label>
                                      <select
                                        id={`stage-${app.id}`}
                                        value={draft.stageId}
                                        disabled={Boolean(updatingAppId) || !job.stages.length}
                                        onChange={(event) =>
                                          setApplicationDrafts((previous) => ({
                                            ...previous,
                                            [app.id]: { ...draft, stageId: event.target.value },
                                          }))
                                        }
                                      >
                                        <option value="">
                                          {job.stages.length
                                            ? 'Selecione a etapa'
                                            : 'Esta vaga não tem etapas'}
                                        </option>
                                        {[...job.stages]
                                          .sort((a, b) => a.order - b.order)
                                          .map((stage) => (
                                            <option key={stage.id} value={stage.id}>
                                              {stage.title}
                                            </option>
                                          ))}
                                      </select>
                                    </div>
                                    <div className={styles.field}>
                                      <label htmlFor={`feedback-${app.id}`}>
                                        Feedback para @{app.user.username}
                                      </label>
                                      <textarea
                                        id={`feedback-${app.id}`}
                                        rows={3}
                                        maxLength={5000}
                                        value={draft.feedback}
                                        disabled={Boolean(updatingAppId)}
                                        placeholder="Conte como foi a avaliação e quais são os próximos passos."
                                        onChange={(event) =>
                                          setApplicationDrafts((previous) => ({
                                            ...previous,
                                            [app.id]: { ...draft, feedback: event.target.value },
                                          }))
                                        }
                                      />
                                      <small>
                                        Este parecer fica visível para a pessoa candidata. Revise o
                                        texto antes de salvar.
                                      </small>
                                    </div>
                                    <button
                                      type="submit"
                                      aria-label={`Salvar etapa e feedback de @${app.user.username}`}
                                      className={styles.action}
                                      disabled={Boolean(updatingAppId)}
                                    >
                                      {busy ? 'Salvando...' : 'Salvar etapa e feedback'}
                                    </button>
                                  </form>
                                </article>
                              );
                            })
                          )}
                        </section>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {activeSection === 'companies' && (
          <section
            id="recruiter-panel-companies"
            role="tabpanel"
            aria-labelledby="recruiter-tab-companies"
            className={styles.section}
          >
            <div>
              <h2>Empresas que você gerencia</h2>
              <p className={styles.muted}>
                Selecione uma empresa ao publicar uma vaga. A verificação de uma empresa é feita
                pela administração.
              </p>
            </div>
            {loadingCompanies ? (
              <p role="status" className={styles.muted}>
                Carregando empresas...
              </p>
            ) : companiesError ? (
              <div role="alert" className={styles.notice}>
                <p>{companiesError}</p>
                <button type="button" className={styles.link} onClick={() => void loadCompanies()}>
                  Tentar novamente
                </button>
              </div>
            ) : companies.length ? (
              <div>
                {companies.map((company) => (
                  <article key={company.id} className={styles.company}>
                    <h3>
                      <Building2 size={19} aria-hidden="true" />
                      {company.name}
                      {company.is_verified && (
                        <ShieldCheck size={17} aria-label="Empresa verificada" />
                      )}
                    </h3>
                    <p className={styles.muted}>
                      {company.location || 'Localização não informada'} ·{' '}
                      {company.is_verified ? 'Empresa verificada' : 'Empresa não verificada'}
                    </p>
                    {company.website && /^https?:\/\//i.test(company.website) && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        Visitar site
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>
                Você ainda não tem uma empresa cadastrada. Preencha o formulário para começar.
              </p>
            )}
            <section className={styles.formSection}>
              <div>
                <h3>Cadastrar empresa</h3>
                <p className={styles.muted}>
                  Informe os dados reais da empresa responsável pelas vagas.
                </p>
              </div>
              <form onSubmit={handleCreateCompany} className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="company-name">Nome da empresa</label>
                  <input
                    id="company-name"
                    required
                    minLength={2}
                    value={companyName}
                    disabled={creatingCompany}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="company-website">
                    Site <span className={styles.muted}>(opcional)</span>
                  </label>
                  <input
                    id="company-website"
                    type="url"
                    value={companyWebsite}
                    disabled={creatingCompany}
                    onChange={(event) => setCompanyWebsite(event.target.value)}
                    placeholder="https://suaempresa.com.br"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="company-location">
                    Localização <span className={styles.muted}>(opcional)</span>
                  </label>
                  <input
                    id="company-location"
                    value={companyLocation}
                    disabled={creatingCompany}
                    onChange={(event) => setCompanyLocation(event.target.value)}
                    placeholder="Cidade, estado ou país"
                  />
                </div>
                <button type="submit" className={styles.action} disabled={creatingCompany}>
                  {creatingCompany ? 'Salvando...' : 'Cadastrar empresa'}
                </button>
              </form>
            </section>
          </section>
        )}
        {activeSection === 'create' && (
          <section
            id="recruiter-panel-create"
            role="tabpanel"
            aria-labelledby="recruiter-tab-create"
            className={styles.section}
          >
            <div>
              <h2>Publicar oportunidade técnica</h2>
              <p className={styles.muted}>
                A vaga fica visível no mural público. Preencha o que a pessoa precisa saber antes de
                se candidatar.
              </p>
            </div>
            {loadingCompanies ? (
              <p role="status" className={styles.muted}>
                Carregando suas empresas...
              </p>
            ) : companiesError ? (
              <div role="alert" className={styles.notice}>
                <p>{companiesError}</p>
                <button type="button" className={styles.link} onClick={() => void loadCompanies()}>
                  Tentar novamente
                </button>
              </div>
            ) : !companies.length ? (
              <div className={styles.notice}>
                <p>Cadastre uma empresa antes de publicar sua primeira vaga.</p>
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => setActiveSection('companies')}
                >
                  Cadastrar empresa
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateJob} className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="job-company">Empresa responsável</label>
                  <select
                    id="job-company"
                    required
                    value={selectedCompanyId}
                    disabled={creatingJob}
                    onChange={(event) => setSelectedCompanyId(event.target.value)}
                  >
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="job-title">Título da vaga</label>
                  <input
                    id="job-title"
                    required
                    minLength={3}
                    value={jobTitle}
                    disabled={creatingJob}
                    onChange={(event) => setJobTitle(event.target.value)}
                    placeholder="Ex.: Desenvolvedor front-end React"
                  />
                </div>
                <div className={styles.twoFields}>
                  <div className={styles.field}>
                    <label htmlFor="job-level">Nível de experiência</label>
                    <select
                      id="job-level"
                      value={jobLevel}
                      disabled={creatingJob}
                      onChange={(event) => setJobLevel(event.target.value)}
                    >
                      {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="job-modality">Modalidade de trabalho</label>
                    <select
                      id="job-modality"
                      value={jobModality}
                      disabled={creatingJob}
                      onChange={(event) => setJobModality(event.target.value)}
                    >
                      {Object.entries(MODALITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.twoFields}>
                  <div className={styles.field}>
                    <label htmlFor="job-contract">Tipo de contrato</label>
                    <select
                      id="job-contract"
                      value={jobContract}
                      disabled={creatingJob}
                      onChange={(event) => setJobContract(event.target.value)}
                    >
                      <option value="CLT">CLT</option>
                      <option value="PJ">PJ</option>
                      <option value="ESTAGIO">Estágio</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="job-location">
                      Localização <span className={styles.muted}>(opcional)</span>
                    </label>
                    <input
                      id="job-location"
                      value={jobLocation}
                      disabled={creatingJob}
                      onChange={(event) => setJobLocation(event.target.value)}
                      placeholder="Cidade, estado ou área de contratação"
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="job-technologies">Tecnologias</label>
                  <input
                    id="job-technologies"
                    required
                    value={jobTechnologies}
                    disabled={creatingJob}
                    onChange={(event) => setJobTechnologies(event.target.value)}
                    placeholder="TypeScript, React, Node.js"
                  />
                  <small>Separe as tecnologias por vírgula.</small>
                </div>
                <div className={styles.field}>
                  <label htmlFor="job-description">Descrição e responsabilidades</label>
                  <textarea
                    id="job-description"
                    required
                    minLength={10}
                    rows={5}
                    value={jobDescription}
                    disabled={creatingJob}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Descreva o trabalho, o dia a dia da equipe e as responsabilidades da pessoa contratada."
                  />
                </div>
                <div className={styles.twoFields}>
                  <div className={styles.field}>
                    <label htmlFor="job-salary-min">
                      Remuneração mínima em R$ <span className={styles.muted}>(opcional)</span>
                    </label>
                    <input
                      id="job-salary-min"
                      type="number"
                      min={0}
                      value={jobSalaryMin}
                      disabled={creatingJob}
                      onChange={(event) => setJobSalaryMin(event.target.value)}
                      placeholder="Ex.: 4000"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="job-salary-max">
                      Remuneração máxima em R$ <span className={styles.muted}>(opcional)</span>
                    </label>
                    <input
                      id="job-salary-max"
                      type="number"
                      min={0}
                      value={jobSalaryMax}
                      disabled={creatingJob}
                      onChange={(event) => setJobSalaryMax(event.target.value)}
                      placeholder="Ex.: 7000"
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="job-requirements">
                    Requisitos <span className={styles.muted}>(opcional)</span>
                  </label>
                  <textarea
                    id="job-requirements"
                    rows={3}
                    value={jobRequirements}
                    disabled={creatingJob}
                    onChange={(event) => setJobRequirements(event.target.value)}
                    placeholder="Experiência com React, Conhecimento de Git, Comunicação clara"
                  />
                  <small>Separe cada requisito por vírgula.</small>
                </div>
                <div className={styles.field}>
                  <label htmlFor="job-benefits">
                    Benefícios <span className={styles.muted}>(opcional)</span>
                  </label>
                  <textarea
                    id="job-benefits"
                    rows={3}
                    value={jobBenefits}
                    disabled={creatingJob}
                    onChange={(event) => setJobBenefits(event.target.value)}
                    placeholder="Horário flexível, Auxílio para estudos"
                  />
                  <small>
                    Informe somente benefícios oferecidos pela empresa, separados por vírgula.
                  </small>
                </div>
                <details className={styles.steps}>
                  <summary>Etapas criadas com a vaga</summary>
                  <ol>
                    <li>Inscrição</li>
                    <li>Desafio técnico na plataforma</li>
                    <li>Duelo técnico</li>
                    <li>Avaliação técnica por especialista</li>
                    <li>Entrevista</li>
                    <li>Contratação</li>
                  </ol>
                  <p className={styles.muted}>
                    Após a publicação, você acompanha a etapa de cada candidatura e registra o
                    feedback neste painel.
                  </p>
                </details>
                <button
                  type="submit"
                  disabled={creatingJob || !selectedCompanyId}
                  className={styles.action}
                >
                  {creatingJob ? 'Publicando...' : 'Publicar vaga com etapas técnicas'}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </PlatformPageShell>
  );
}
