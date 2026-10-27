'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Code,
  Swords,
  Award,
  Users,
  Send,
  Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

interface JobDetailProps {
  user: any;
  job: any;
}

export function JobDetailContent({ user, job }: JobDetailProps) {
  const [application, setApplication] = useState(job.userApplication || null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const statusLabels: Record<string, string> = {
    APPLIED: 'Inscrito',
    REVIEWING: 'Em análise',
    TESTING: 'Desafio técnico',
    INTERVIEW: 'Entrevista',
    ACCEPTED: 'Aprovado',
    REJECTED: 'Recusado',
  };

  const handleApply = async () => {
    setApplying(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setApplication(data.application);
        setApplySuccess(true);
      } else {
        setErrorMessage(data.error || 'Erro ao realizar inscrição.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de conexão.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <main className="flex-1 min-w-0 max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-dd-muted hover:text-dd-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Vagas
        </Link>

        {/* Job Header */}
        <div className="p-6 md:p-8 rounded-3xl bg-dd-surface border border-dd-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                  {job.level}
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  {job.modality}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-dd-text">{job.title}</h1>
              <div className="flex items-center gap-2 text-xs font-bold text-dd-muted">
                <span className="text-dd-text">{job.company.name}</span>
                {job.company.is_verified && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                <span>•</span>
                <span>{job.location || 'Localização Flexível'}</span>
                <span>•</span>
                <span>{job.contract_type}</span>
              </div>
            </div>

            {/* Apply Button */}
            {!application ? (
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{applying ? 'Inscrevendo...' : 'Candidatar-se com Stacklyst'}</span>
              </button>
            ) : (
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 shrink-0">
                <CheckCircle className="w-4 h-4" />
                <span>{statusLabels[application.status] ?? application.status}</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="text-xs font-bold text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              {errorMessage}
            </p>
          )}

          {applySuccess && (
            <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              Inscrição realizada com sucesso! Seu portfólio da plataforma foi vinculado ao
              processo.
            </p>
          )}
        </div>

        {application && (
          <section
            id="application"
            aria-labelledby="application-title"
            className="scroll-mt-8 space-y-4 rounded-2xl border border-dd-border bg-dd-surface p-6"
          >
            <h2 id="application-title" className="text-lg font-bold text-dd-text">
              Sua candidatura
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-dd-muted">Status</dt>
                <dd className="mt-1 text-sm font-semibold text-dd-text">
                  {statusLabels[application.status] ?? application.status}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-dd-muted">Etapa atual</dt>
                <dd className="mt-1 text-sm font-semibold text-dd-text">
                  {application.stage?.title ?? 'Aguardando definição da empresa'}
                </dd>
              </div>
            </dl>
            <div>
              <h3 className="text-sm font-semibold text-dd-text">Feedback da empresa</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-dd-muted">
                {application.feedback ||
                  'A empresa ainda não enviou feedback. Acompanhe as atualizações por aqui.'}
              </p>
            </div>
          </section>
        )}

        {/* Recruitment Stages Visual Pipeline */}
        <div className="p-6 rounded-3xl bg-dd-surface border border-dd-border space-y-4">
          <h2 className="text-base font-black text-dd-text flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Etapas do Processo Seletivo Técnico
          </h2>
          <p className="text-xs text-dd-muted font-medium">
            Esta empresa avalia candidatos utilizando os desafios práticos e duelos da plataforma.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {job.stages.map((stage: any, index: number) => {
              const isCurrent = application?.stage_id === stage.id;
              return (
                <div
                  key={stage.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-500/15 border-blue-500 shadow-md'
                      : 'bg-dd-bg border-dd-border/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-blue-400">
                      Etapa {index + 1}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                        Sua Etapa
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-dd-text">{stage.title}</h4>
                  {stage.description && (
                    <p className="text-[11px] text-dd-muted font-medium mt-1">
                      {stage.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Job Description & Requirements */}
        <div className="p-6 md:p-8 rounded-3xl bg-dd-surface border border-dd-border space-y-6">
          <div>
            <h3 className="text-sm font-black text-dd-text uppercase tracking-wider mb-2">
              Descrição da Oportunidade
            </h3>
            <p className="text-xs text-dd-text/90 font-medium leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black text-dd-text uppercase tracking-wider mb-2">
              Tecnologias Utilizadas
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.technologies.map((t: string) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-xl bg-dd-bg border border-dd-border text-xs font-mono font-bold text-dd-text"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {job.requirements?.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-dd-text uppercase tracking-wider mb-2">
                Requisitos e Diferenciais
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-dd-muted font-medium">
                {job.requirements.map((r: string, idx: number) => (
                  <li key={idx} className="text-dd-text/90">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.benefits?.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-dd-text uppercase tracking-wider mb-2">
                Benefícios
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-dd-muted font-medium">
                {job.benefits.map((b: string, idx: number) => (
                  <li key={idx} className="text-dd-text/90">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
