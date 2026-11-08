'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CircleAlert, Send, ShieldCheck } from 'lucide-react';
import { PlatformPageShell } from '@/components/PlatformPageShell';
import styles from '../jobs.module.css';
import { isJobAcceptingApplications } from '@/lib/job-availability';
import { JobStageActivity } from '@/components/jobs/JobStageActivity';

interface RecruitmentStage {
  id: string;
  title: string;
  description?: string | null;
  order?: number;
}
interface Application {
  status: string;
  stage_id?: string | null;
  stage?: { id?: string; title: string; type?: string } | null;
  feedback?: string | null;
}
interface JobDetailProps {
  user: any;
  job: {
    id: string;
    title: string;
    description?: string;
    level: string;
    modality: string;
    location?: string | null;
    contract_type?: string;
    salary_min?: number | null;
    salary_max?: number | null;
    status?: string;
    expires_at?: string | Date | null;
    company: { name: string; location?: string | null; is_verified?: boolean };
    technologies: string[];
    stages: RecruitmentStage[];
    requirements?: string[];
    benefits?: string[];
    userApplication?: Application | null;
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
  REVIEWING: 'Em análise',
  TESTING: 'Desafio técnico',
  ACCEPTED: 'Aprovado',
};
const NEXT_STEPS: Record<string, string> = {
  APPLIED:
    'Sua candidatura foi recebida. Aguarde a análise da empresa e acompanhe as atualizações nesta página.',
  IN_REVIEW:
    'A empresa está analisando sua candidatura. A próxima orientação aparecerá no feedback abaixo.',
  TECHNICAL_CHALLENGE:
    'Sua candidatura está na etapa de desafio técnico. Confira as orientações da empresa no feedback abaixo.',
  DUEL: 'Sua candidatura está na etapa de duelo técnico. Confira as orientações da empresa no feedback abaixo.',
  EVALUATION: 'Sua candidatura está em avaliação técnica. Acompanhe o feedback da empresa abaixo.',
  INTERVIEW: 'Confira o feedback da empresa para saber as orientações da entrevista.',
  OFFER:
    'Sua candidatura avançou para a proposta. Confira os próximos passos no feedback da empresa.',
  REJECTED:
    'Sua participação nesta vaga foi encerrada pela empresa. Confira o feedback disponível abaixo.',
};
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
const CONTRACT_LABELS: Record<string, string> = { CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio' };

function salaryLabel(job: JobDetailProps['job']) {
  const format = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  if (job.salary_min != null && job.salary_max != null) {
    return job.salary_min === job.salary_max
      ? format(job.salary_min)
      : `${format(job.salary_min)} – ${format(job.salary_max)}`;
  }
  if (job.salary_min != null) return `A partir de ${format(job.salary_min)}`;
  if (job.salary_max != null) return `Até ${format(job.salary_max)}`;
  return 'Não informada pela empresa';
}

export function JobDetailContent({ user, job }: JobDetailProps) {
  const [application, setApplication] = useState<Application | null>(job.userApplication || null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const acceptingApplications = isJobAcceptingApplications(job);
  const stages = [...job.stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const currentStageId = application?.stage_id ?? application?.stage?.id;
  const statusLabel = application
    ? (STATUS_LABELS[application.status] ?? 'Em acompanhamento')
    : null;

  const handleApply = async () => {
    if (applying || application || !acceptingApplications) return;
    setApplying(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/jobs/${job.id}/apply`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.application) {
        const message = data.message || data.error;
        setErrorMessage(
          typeof message === 'string' &&
            !/^[A-Z_]+$/.test(message) &&
            message !== 'Internal server error'
            ? message
            : 'Não foi possível enviar sua candidatura. Tente novamente em instantes.'
        );
        return;
      }
      setApplication(data.application);
      setApplySuccess(true);
    } catch {
      setErrorMessage(
        'Não foi possível conectar ao Stacklyst. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <PlatformPageShell user={user}>
      <header className={styles.detailHeader}>
        <Link href="/jobs" aria-label="Voltar para Vagas" className={styles.back}>
          <ArrowLeft size={21} aria-hidden="true" />
        </Link>
        <span>Detalhes da vaga</span>
      </header>
      <div className={styles.detail}>
        <div className={styles.company}>
          <div className={styles.companyAvatar} aria-hidden="true">
            {job.company.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('')}
          </div>
          <p>
            {job.company.name}
            {job.company.is_verified && (
              <>
                <ShieldCheck size={17} aria-hidden="true" />
                <span className="sr-only">Empresa verificada</span>
              </>
            )}
          </p>
        </div>
        <h1 className={styles.detailTitle}>{job.title}</h1>
        <div className={styles.tags}>
          <span className={styles.level}>{LEVEL_LABELS[job.level] ?? 'Nível a combinar'}</span>
          <span>{acceptingApplications ? 'Inscrições abertas' : 'Inscrições encerradas'}</span>
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>Modelo de trabalho</dt>
            <dd>{MODALITY_LABELS[job.modality] ?? 'A combinar'}</dd>
          </div>
          <div>
            <dt>Local de trabalho</dt>
            <dd>{job.location || job.company.location || 'A combinar com a empresa'}</dd>
          </div>
          <div>
            <dt>Contrato</dt>
            <dd>
              {job.contract_type
                ? (CONTRACT_LABELS[job.contract_type] ?? job.contract_type)
                : 'Não informado'}
            </dd>
          </div>
          <div>
            <dt>Remuneração</dt>
            <dd>{salaryLabel(job)}</dd>
          </div>
        </dl>

        {!application ? (
          <div className={styles.applyArea}>
            {acceptingApplications ? (
              <>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  aria-busy={applying}
                  className={styles.primaryButton}
                >
                  <Send size={17} aria-hidden="true" />
                  {applying ? 'Enviando candidatura...' : 'Candidatar-se com Stacklyst'}
                </button>
                <p>
                  Seu perfil do Stacklyst será vinculado à candidatura para avaliação da empresa.
                </p>
              </>
            ) : (
              <p>
                Esta vaga não aceita novas candidaturas.{' '}
                <Link href="/jobs" className={styles.recruiterLink}>
                  Ver vagas abertas
                </Link>
              </p>
            )}
          </div>
        ) : (
          <a href="#application" className={styles.secondaryButton}>
            <CheckCircle2 size={17} aria-hidden="true" />
            Acompanhar minha candidatura
          </a>
        )}

        {errorMessage && (
          <p role="alert" className={styles.notice}>
            <CircleAlert size={17} aria-hidden="true" />
            {errorMessage}
          </p>
        )}
        {applySuccess && (
          <p role="status" className={styles.notice}>
            <CheckCircle2 size={17} aria-hidden="true" />
            Candidatura enviada! Acompanhe seu status e o feedback da empresa abaixo.
          </p>
        )}

        {application && (
          <section
            id="application"
            aria-labelledby="application-title"
            className={styles.detailSection}
          >
            <div className={styles.applicationHeading}>
              <h2 id="application-title">Sua candidatura</h2>
              <span className={styles.status}>
                <CheckCircle2 size={15} aria-hidden="true" />
                {statusLabel}
              </span>
            </div>
            <dl className={styles.applicationData}>
              <div>
                <dt>Status</dt>
                <dd>{statusLabel}</dd>
              </div>
              <div>
                <dt>Etapa atual</dt>
                <dd>{application.stage?.title ?? 'Aguardando definição da empresa'}</dd>
              </div>
            </dl>
            <p className={styles.statusCopy}>
              {NEXT_STEPS[application.status] ??
                'Acompanhe o status da candidatura e as orientações da empresa nesta página.'}
            </p>
            {application.stage?.type &&
              ['DESAFIO_TECNICO', 'DUELO_TECNICO'].includes(application.stage.type) &&
              !['REJECTED', 'OFFER'].includes(application.status) && (
                <JobStageActivity key={application.stage.id} jobId={job.id} />
              )}
            <div className={styles.feedback}>
              <h3>Feedback da empresa</h3>
              <p className={styles.prose}>
                {application.feedback ||
                  'A empresa ainda não enviou feedback. Acompanhe as atualizações por aqui.'}
              </p>
            </div>
          </section>
        )}

        <section aria-labelledby="job-description-title" className={styles.detailSection}>
          <h2 id="job-description-title">Sobre a oportunidade</h2>
          <p className={styles.prose}>
            {job.description || 'A empresa ainda não adicionou uma descrição para esta vaga.'}
          </p>
        </section>

        <section aria-labelledby="job-technologies-title" className={styles.detailSection}>
          <h2 id="job-technologies-title">Tecnologias</h2>
          {job.technologies.length ? (
            <div className={styles.tags}>
              {job.technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          ) : (
            <p className={styles.sectionCopy}>A empresa não informou tecnologias específicas.</p>
          )}
        </section>

        {!!job.requirements?.length && (
          <section aria-labelledby="job-requirements-title" className={styles.detailSection}>
            <h2 id="job-requirements-title">Requisitos e diferenciais</h2>
            <ul className={styles.plainList}>
              {job.requirements.map((requirement, index) => (
                <li key={`${index}-${requirement}`}>{requirement}</li>
              ))}
            </ul>
          </section>
        )}
        {!!job.benefits?.length && (
          <section aria-labelledby="job-benefits-title" className={styles.detailSection}>
            <h2 id="job-benefits-title">Benefícios</h2>
            <ul className={styles.plainList}>
              {job.benefits.map((benefit, index) => (
                <li key={`${index}-${benefit}`}>{benefit}</li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="job-stages-title" className={styles.detailSection}>
          <h2 id="job-stages-title">Etapas do processo</h2>
          {stages.length ? (
            <>
              <p className={styles.sectionCopy}>
                Esta é a sequência definida pela empresa. A etapa da sua candidatura aparece em
                destaque.
              </p>
              <ol className={styles.stages}>
                {stages.map((stage, index) => (
                  <li
                    key={stage.id}
                    className={styles.stage}
                    aria-current={currentStageId === stage.id ? 'step' : undefined}
                  >
                    <span className={styles.stageNumber} aria-label={`Etapa ${index + 1}`}>
                      {index + 1}
                    </span>
                    <div className={styles.stageBody}>
                      <div className={styles.stageTitle}>
                        <h3>{stage.title}</h3>
                        {currentStageId === stage.id && (
                          <span className={styles.currentStage}>Etapa atual</span>
                        )}
                      </div>
                      {stage.description && (
                        <p className={styles.sectionCopy}>{stage.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className={styles.sectionCopy}>
              A empresa ainda não definiu as etapas. As orientações serão exibidas na sua
              candidatura.
            </p>
          )}
        </section>
      </div>
    </PlatformPageShell>
  );
}
