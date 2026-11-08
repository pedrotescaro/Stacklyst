'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CircleAlert, Send, ShieldCheck } from 'lucide-react';
import { PlatformPageShell } from '@/components/PlatformPageShell';
import styles from '../jobs.module.css';
import { isJobAcceptingApplications } from '@/lib/job-availability';
import { JobStageActivity } from '@/components/jobs/JobStageActivity';
import { useLocalizedText } from '@/i18n/useLocalizedText';

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

const getStatusLabels = (text: (pt: string, en: string) => string): Record<string, string> => ({
  APPLIED: text('Candidatura enviada', 'Application submitted'),
  IN_REVIEW: text('Em análise', 'Under review'),
  TECHNICAL_CHALLENGE: text('Desafio técnico', 'Technical challenge'),
  DUEL: text('Duelo técnico', 'Technical duel'),
  EVALUATION: text('Avaliação técnica', 'Technical evaluation'),
  INTERVIEW: text('Entrevista', 'Interview'),
  OFFER: text('Proposta', 'Offer'),
  REJECTED: text('Não selecionado', 'Not selected'),
  REVIEWING: text('Em análise', 'Under review'),
  TESTING: text('Desafio técnico', 'Technical challenge'),
  ACCEPTED: text('Aprovado', 'Accepted'),
});
const getNextSteps = (text: (pt: string, en: string) => string): Record<string, string> => ({
  APPLIED: text(
    'Sua candidatura foi recebida. Aguarde a análise da empresa e acompanhe as atualizações nesta página.',
    'Your application was received. Please wait for the company review and check back here for updates.'
  ),
  IN_REVIEW: text(
    'A empresa está analisando sua candidatura. A próxima orientação aparecerá no feedback abaixo.',
    'The company is reviewing your application. Next instructions will appear in the feedback section below.'
  ),
  TECHNICAL_CHALLENGE: text(
    'Sua candidatura está na etapa de desafio técnico. Confira as orientações da empresa no feedback abaixo.',
    'Your application is in the technical challenge stage. Check the feedback section below for details.'
  ),
  DUEL: text(
    'Sua candidatura está na etapa de duelo técnico. Confira as orientações da empresa no feedback abaixo.',
    'Your application is in the technical duel stage. Check the feedback section below for details.'
  ),
  EVALUATION: text(
    'Sua candidatura está em avaliação técnica. Acompanhe o feedback da empresa abaixo.',
    'Your application is in technical evaluation. Check the feedback section below.'
  ),
  INTERVIEW: text(
    'Confira o feedback da empresa para saber as orientações da entrevista.',
    'Check the company feedback below for interview details.'
  ),
  OFFER: text(
    'Sua candidatura avançou para a proposta. Confira os próximos passos no feedback da empresa.',
    'Your application reached the offer stage. Check the next steps in the feedback section below.'
  ),
  REJECTED: text(
    'Sua participação nesta vaga foi encerrada pela empresa. Confira o feedback disponível abaixo.',
    'Your application for this role was concluded by the company. Check any feedback available below.'
  ),
});

function salaryLabel(
  job: JobDetailProps['job'],
  text: (pt: string, en: string) => string,
  locale: string
) {
  const format = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  if (job.salary_min != null && job.salary_max != null) {
    return job.salary_min === job.salary_max
      ? format(job.salary_min)
      : `${format(job.salary_min)} – ${format(job.salary_max)}`;
  }
  if (job.salary_min != null) return `${text('A partir de', 'From')} ${format(job.salary_min)}`;
  if (job.salary_max != null) return `${text('Até', 'Up to')} ${format(job.salary_max)}`;
  return text('Não informada pela empresa', 'Not disclosed by company');
}

export function JobDetailContent({ user, job }: JobDetailProps) {
  const { text, locale } = useLocalizedText();
  const [application, setApplication] = useState<Application | null>(job.userApplication || null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const acceptingApplications = isJobAcceptingApplications(job);
  const stages = [...job.stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const currentStageId = application?.stage_id ?? application?.stage?.id;
  const statusLabels = getStatusLabels(text);
  const nextSteps = getNextSteps(text);
  const levelLabels: Record<string, string> = {
    ESTAGIO: text('Estágio', 'Internship'),
    JUNIOR: text('Júnior', 'Junior'),
    PLENO: text('Pleno', 'Mid-level'),
    SENIOR: text('Sênior', 'Senior'),
    ESPECIALISTA: text('Especialista', 'Specialist'),
  };
  const modalityLabels: Record<string, string> = {
    REMOTE: text('Remoto', 'Remote'),
    HYBRID: text('Híbrido', 'Hybrid'),
    ONSITE: text('Presencial', 'On-site'),
  };
  const contractLabels: Record<string, string> = {
    CLT: text('CLT', 'Full-time (CLT)'),
    PJ: text('PJ', 'Contractor (PJ)'),
    ESTAGIO: text('Estágio', 'Internship'),
  };
  const statusLabel = application
    ? (statusLabels[application.status] ?? text('Em acompanhamento', 'In progress'))
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
            : text(
                'Não foi possível enviar sua candidatura. Tente novamente em instantes.',
                'Could not submit your application. Please try again shortly.'
              )
        );
        return;
      }
      setApplication(data.application);
      setApplySuccess(true);
    } catch {
      setErrorMessage(
        text(
          'Não foi possível conectar ao Stacklyst. Verifique sua conexão e tente novamente.',
          'Could not connect to Stacklyst. Please check your connection and try again.'
        )
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <PlatformPageShell user={user}>
      <header className={styles.detailHeader}>
        <Link
          href="/jobs"
          aria-label={text('Voltar para Vagas', 'Back to Jobs')}
          className={styles.back}
        >
          <ArrowLeft size={21} aria-hidden="true" />
        </Link>
        <span>{text('Detalhes da vaga', 'Job details')}</span>
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
                <span className="sr-only">{text('Empresa verificada', 'Verified company')}</span>
              </>
            )}
          </p>
        </div>
        <h1 className={styles.detailTitle}>{job.title}</h1>
        <div className={styles.tags}>
          <span className={styles.level}>
            {levelLabels[job.level] ?? text('Nível a combinar', 'Level TBD')}
          </span>
          <span>
            {acceptingApplications
              ? text('Inscrições abertas', 'Applications open')
              : text('Inscrições encerradas', 'Applications closed')}
          </span>
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>{text('Modelo de trabalho', 'Work modality')}</dt>
            <dd>{modalityLabels[job.modality] ?? text('A combinar', 'To be discussed')}</dd>
          </div>
          <div>
            <dt>{text('Local de trabalho', 'Workplace')}</dt>
            <dd>
              {job.location ||
                job.company.location ||
                text('A combinar com a empresa', 'To be discussed with company')}
            </dd>
          </div>
          <div>
            <dt>{text('Contrato', 'Contract')}</dt>
            <dd>
              {job.contract_type
                ? (contractLabels[job.contract_type] ?? job.contract_type)
                : text('Não informado', 'Not specified')}
            </dd>
          </div>
          <div>
            <dt>{text('Remuneração', 'Compensation')}</dt>
            <dd>{salaryLabel(job, text, locale)}</dd>
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
                  {applying
                    ? text('Enviando candidatura...', 'Submitting application...')
                    : text('Candidatar-se com Stacklyst', 'Apply with Stacklyst')}
                </button>
                <p>
                  {text(
                    'Seu perfil do Stacklyst será vinculado à candidatura para avaliação da empresa.',
                    'Your Stacklyst profile will be attached to the application for company review.'
                  )}
                </p>
              </>
            ) : (
              <p>
                {text(
                  'Esta vaga não aceita novas candidaturas.',
                  'This position is no longer accepting applications.'
                )}{' '}
                <Link href="/jobs" className={styles.recruiterLink}>
                  {text('Ver vagas abertas', 'View open jobs')}
                </Link>
              </p>
            )}
          </div>
        ) : (
          <a href="#application" className={styles.secondaryButton}>
            <CheckCircle2 size={17} aria-hidden="true" />
            {text('Acompanhar minha candidatura', 'Track my application')}
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
            {text(
              'Candidatura enviada! Acompanhe seu status e o feedback da empresa abaixo.',
              'Application submitted! Track your status and company feedback below.'
            )}
          </p>
        )}

        {application && (
          <section
            id="application"
            aria-labelledby="application-title"
            className={styles.detailSection}
          >
            <div className={styles.applicationHeading}>
              <h2 id="application-title">{text('Sua candidatura', 'Your application')}</h2>
              <span className={styles.status}>
                <CheckCircle2 size={15} aria-hidden="true" />
                {statusLabel}
              </span>
            </div>
            <dl className={styles.applicationData}>
              <div>
                <dt>{text('Status', 'Status')}</dt>
                <dd>{statusLabel}</dd>
              </div>
              <div>
                <dt>{text('Etapa atual', 'Current stage')}</dt>
                <dd>
                  {application.stage?.title ??
                    text('Aguardando definição da empresa', 'Awaiting company definition')}
                </dd>
              </div>
            </dl>
            <p className={styles.statusCopy}>
              {nextSteps[application.status] ??
                text(
                  'Acompanhe o status da candidatura e as orientações da empresa nesta página.',
                  'Track application status and company instructions on this page.'
                )}
            </p>
            {application.stage?.type &&
              ['DESAFIO_TECNICO', 'DUELO_TECNICO'].includes(application.stage.type) &&
              !['REJECTED', 'OFFER'].includes(application.status) && (
                <JobStageActivity key={application.stage.id} jobId={job.id} />
              )}
            <div className={styles.feedback}>
              <h3>{text('Feedback da empresa', 'Company feedback')}</h3>
              <p className={styles.prose}>
                {application.feedback ||
                  text(
                    'A empresa ainda não enviou feedback. Acompanhe as atualizações por aqui.',
                    'The company has not submitted feedback yet. Check back here for updates.'
                  )}
              </p>
            </div>
          </section>
        )}

        <section aria-labelledby="job-description-title" className={styles.detailSection}>
          <h2 id="job-description-title">{text('Sobre a oportunidade', 'About the role')}</h2>
          <p className={styles.prose}>
            {job.description ||
              text(
                'A empresa ainda não adicionou uma descrição para esta vaga.',
                'No description added for this job yet.'
              )}
          </p>
        </section>

        <section aria-labelledby="job-technologies-title" className={styles.detailSection}>
          <h2 id="job-technologies-title">{text('Tecnologias', 'Technologies')}</h2>
          {job.technologies.length ? (
            <div className={styles.tags}>
              {job.technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          ) : (
            <p className={styles.sectionCopy}>
              {text(
                'A empresa não informou tecnologias específicas.',
                'No specific technologies listed by the company.'
              )}
            </p>
          )}
        </section>

        {!!job.requirements?.length && (
          <section aria-labelledby="job-requirements-title" className={styles.detailSection}>
            <h2 id="job-requirements-title">
              {text('Requisitos e diferenciais', 'Requirements & qualifications')}
            </h2>
            <ul className={styles.plainList}>
              {job.requirements.map((requirement, index) => (
                <li key={`${index}-${requirement}`}>{requirement}</li>
              ))}
            </ul>
          </section>
        )}
        {!!job.benefits?.length && (
          <section aria-labelledby="job-benefits-title" className={styles.detailSection}>
            <h2 id="job-benefits-title">{text('Benefícios', 'Benefits')}</h2>
            <ul className={styles.plainList}>
              {job.benefits.map((benefit, index) => (
                <li key={`${index}-${benefit}`}>{benefit}</li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="job-stages-title" className={styles.detailSection}>
          <h2 id="job-stages-title">{text('Etapas do processo', 'Hiring stages')}</h2>
          {stages.length ? (
            <>
              <p className={styles.sectionCopy}>
                {text(
                  'Esta é a sequência definida pela empresa. A etapa da sua candidatura aparece em destaque.',
                  'This is the sequence defined by the company. Your current stage is highlighted.'
                )}
              </p>
              <ol className={styles.stages}>
                {stages.map((stage, index) => (
                  <li
                    key={stage.id}
                    className={styles.stage}
                    aria-current={currentStageId === stage.id ? 'step' : undefined}
                  >
                    <span
                      className={styles.stageNumber}
                      aria-label={`${text('Etapa', 'Stage')} ${index + 1}`}
                    >
                      {index + 1}
                    </span>
                    <div className={styles.stageBody}>
                      <div className={styles.stageTitle}>
                        <h3>{stage.title}</h3>
                        {currentStageId === stage.id && (
                          <span className={styles.currentStage}>
                            {text('Etapa atual', 'Current stage')}
                          </span>
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
              {text(
                'A empresa ainda não definiu as etapas. As orientações serão exibidas na sua candidatura.',
                'The company has not defined stages yet. Instructions will appear under your application.'
              )}
            </p>
          )}
        </section>
      </div>
    </PlatformPageShell>
  );
}
