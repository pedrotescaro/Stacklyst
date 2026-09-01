'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Code2,
  Layers3,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

export type JobLevel = 'ESTAGIO' | 'JUNIOR' | 'PLENO' | 'SENIOR' | 'ESPECIALISTA';
export type JobModality = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type JobContract = 'CLT' | 'PJ' | 'ESTAGIO';

export interface JobItem {
  id: string;
  title: string;
  description: string;
  level: JobLevel;
  technologies: string[];
  modality: JobModality;
  location: string | null;
  contract_type: JobContract;
  salary_min: number | null;
  salary_max: number | null;
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
  _count: { applications: number };
}

export interface JobFilters {
  query: string;
  technology: string;
  location: string;
  levels: JobLevel[];
  modalities: JobModality[];
  contracts: JobContract[];
}

const LEVEL_OPTIONS: { value: JobLevel; label: string }[] = [
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'JUNIOR', label: 'Júnior' },
  { value: 'PLENO', label: 'Pleno' },
  { value: 'SENIOR', label: 'Sênior' },
  { value: 'ESPECIALISTA', label: 'Especialista' },
];

const MODALITY_OPTIONS: { value: JobModality; label: string }[] = [
  { value: 'REMOTE', label: 'Remoto' },
  { value: 'HYBRID', label: 'Híbrido' },
  { value: 'ONSITE', label: 'Presencial' },
];

const CONTRACT_OPTIONS: { value: JobContract; label: string }[] = [
  { value: 'CLT', label: 'CLT' },
  { value: 'PJ', label: 'PJ' },
  { value: 'ESTAGIO', label: 'Estágio' },
];

const EMPTY_FILTERS: JobFilters = {
  query: '',
  technology: '',
  location: '',
  levels: [],
  modalities: [],
  contracts: [],
};

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterJobs(jobs: JobItem[], filters: JobFilters) {
  const query = normalizeSearchValue(filters.query);
  const technology = normalizeSearchValue(filters.technology);
  const location = normalizeSearchValue(filters.location);

  return jobs.filter((job) => {
    const searchableText = normalizeSearchValue(
      [job.title, job.description, job.company.name, ...job.technologies].join(' ')
    );
    const jobLocation = normalizeSearchValue(
      [job.location, job.company.location].filter(Boolean).join(' ')
    );
    const technologies = job.technologies.map(normalizeSearchValue);

    return (
      (!query || searchableText.includes(query)) &&
      (!technology || technologies.some((item) => item.includes(technology))) &&
      (!location || jobLocation.includes(location)) &&
      (filters.levels.length === 0 || filters.levels.includes(job.level)) &&
      (filters.modalities.length === 0 || filters.modalities.includes(job.modality)) &&
      (filters.contracts.length === 0 || filters.contracts.includes(job.contract_type))
    );
  });
}

function getFilterCount(filters: JobFilters) {
  return (
    Number(Boolean(filters.query.trim())) +
    Number(Boolean(filters.technology.trim())) +
    Number(Boolean(filters.location.trim())) +
    filters.levels.length +
    filters.modalities.length +
    filters.contracts.length
  );
}

function formatJobAge(createdAt: string) {
  const createdDate = new Date(createdAt);
  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  if (elapsedDays === 0) return 'Hoje';
  if (elapsedDays === 1) return 'Há 1 dia';
  if (elapsedDays < 30) return `Há ${elapsedDays} dias`;

  const elapsedMonths = Math.max(1, Math.floor(elapsedDays / 30));
  if (elapsedMonths < 12) return `Há ${elapsedMonths} ${elapsedMonths === 1 ? 'mês' : 'meses'}`;

  const elapsedYears = Math.floor(elapsedMonths / 12);
  return `Há ${elapsedYears} ${elapsedYears === 1 ? 'ano' : 'anos'}`;
}

function formatSalary(job: JobItem) {
  if (!job.salary_min) return null;

  const format = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);

  return job.salary_max
    ? `${format(job.salary_min)} – ${format(job.salary_max)}`
    : `A partir de ${format(job.salary_min)}`;
}

function getCompanyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getOptionLabel<T extends string>(options: { value: T; label: string }[], value: T) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function FilterTextField({
  id,
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
}) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="text-xs font-bold text-dd-text">{label}</span>
      <span className="relative block">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dd-muted"
        />
        <input
          id={id}
          type="search"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="dd-focus-ring h-11 w-full rounded-xl border border-dd-border bg-dd-bg pl-9 pr-3 text-sm font-medium text-dd-text caret-dd-accent placeholder:text-dd-muted/80"
        />
      </span>
    </label>
  );
}

function CheckboxGroup<T extends string>({
  legend,
  name,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  name: string;
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-xs font-bold text-dd-text">{legend}</legend>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 xl:grid-cols-1">
        {options.map((option) => (
          <label
            key={option.value}
            htmlFor={`jobs-${name}-${option.value}`}
            className="flex min-h-7 cursor-pointer items-center gap-2 text-xs font-medium text-dd-muted transition-colors hover:text-dd-text"
          >
            <input
              id={`jobs-${name}-${option.value}`}
              name={name}
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(option.value)}
              className="h-4 w-4 rounded border-dd-border bg-dd-bg accent-[var(--color-dd-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dd-accent"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function JobFiltersPanel({
  filters,
  activeFilterCount,
  onChange,
  onToggleLevel,
  onToggleModality,
  onToggleContract,
  onClear,
}: {
  filters: JobFilters;
  activeFilterCount: number;
  onChange: (key: 'query' | 'technology' | 'location', value: string) => void;
  onToggleLevel: (value: JobLevel) => void;
  onToggleModality: (value: JobModality) => void;
  onToggleContract: (value: JobContract) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dd-border bg-dd-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black text-dd-text">Filtros</h2>
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
          Limpar
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <FilterTextField
          id="jobs-query"
          label="Cargo ou empresa"
          placeholder="Ex.: Front-end, Acme..."
          value={filters.query}
          onChange={(value) => onChange('query', value)}
          icon={Search}
        />
        <FilterTextField
          id="jobs-technology"
          label="Tecnologia"
          placeholder="Ex.: React, Java..."
          value={filters.technology}
          onChange={(value) => onChange('technology', value)}
          icon={Code2}
        />
        <FilterTextField
          id="jobs-location"
          label="Localização"
          placeholder="Cidade ou estado"
          value={filters.location}
          onChange={(value) => onChange('location', value)}
          icon={MapPin}
        />

        <div className="h-px bg-dd-border" />

        <CheckboxGroup
          legend="Modelo de trabalho"
          name="modality"
          options={MODALITY_OPTIONS}
          selected={filters.modalities}
          onToggle={onToggleModality}
        />
        <CheckboxGroup
          legend="Nível"
          name="level"
          options={LEVEL_OPTIONS}
          selected={filters.levels}
          onToggle={onToggleLevel}
        />
        <CheckboxGroup
          legend="Modelo de contrato"
          name="contract"
          options={CONTRACT_OPTIONS}
          selected={filters.contracts}
          onToggle={onToggleContract}
        />
      </div>
    </div>
  );
}

function JobCard({ job }: { job: JobItem }) {
  const salary = formatSalary(job);
  const location = job.location || job.company.location || 'Local a combinar';
  const modality = getOptionLabel(MODALITY_OPTIONS, job.modality);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="dd-focus-ring group block rounded-2xl border border-dd-border bg-dd-surface p-4 transition-[border-color,background-color] duration-200 hover:border-dd-accent/65 hover:bg-dd-card sm:p-5"
    >
      <article className="flex min-w-0 items-start gap-3.5 sm:gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dd-border bg-dd-bg text-sm font-black text-dd-accent sm:h-14 sm:w-14">
          {getCompanyInitials(job.company.name) || (
            <Building2 aria-hidden="true" className="h-5 w-5" />
          )}
          {job.company.is_verified && (
            <span
              title="Empresa verificada"
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-dd-surface bg-dd-accent text-white"
            >
              <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
              <span className="sr-only">Empresa verificada</span>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-dd-muted">{job.company.name}</p>
              <h3 className="mt-1 text-[15px] font-black leading-snug text-dd-text transition-colors group-hover:text-dd-accent sm:text-base">
                {job.title}
              </h3>
            </div>
            <span className="shrink-0 text-[11px] font-bold text-dd-muted tabular-nums">
              {formatJobAge(job.created_at)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-dd-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-dd-accent" />
              {modality} · {location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness aria-hidden="true" className="h-3.5 w-3.5" />
              {job.contract_type}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers3 aria-hidden="true" className="h-3.5 w-3.5" />
              {job.stages.length} {job.stages.length === 1 ? 'etapa' : 'etapas'}
            </span>
            {salary && (
              <span className="inline-flex items-center gap-1.5 font-bold text-dd-green">
                <BadgeDollarSign aria-hidden="true" className="h-3.5 w-3.5" />
                {salary}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-dd-accent/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-dd-accent">
              {getOptionLabel(LEVEL_OPTIONS, job.level)}
            </span>
            {job.technologies.slice(0, 4).map((technology) => (
              <span
                key={technology}
                className="rounded-md border border-dd-border bg-dd-bg px-2 py-1 font-mono text-[10px] font-bold text-dd-text"
              >
                {technology}
              </span>
            ))}
            {job.technologies.length > 4 && (
              <span className="px-1 text-[10px] font-bold text-dd-muted">
                +{job.technologies.length - 4}
              </span>
            )}
          </div>
        </div>

        <ChevronRight
          aria-hidden="true"
          className="mt-7 hidden h-5 w-5 shrink-0 text-dd-muted transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-dd-accent sm:block"
        />
      </article>
    </Link>
  );
}

function LoadingJobs() {
  return (
    <div aria-label="Carregando vagas abertas" aria-busy="true" className="space-y-3">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="rounded-2xl border border-dd-border bg-dd-surface p-5">
          <div className="flex gap-4">
            <div className="dd-skeleton dd-skeleton-post h-14 w-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="dd-skeleton dd-skeleton-post h-3 w-28 rounded" />
              <div className="dd-skeleton dd-skeleton-post h-4 w-3/5 rounded" />
              <div className="dd-skeleton dd-skeleton-post h-3 w-4/5 rounded" />
              <div className="flex gap-2">
                <div className="dd-skeleton dd-skeleton-post h-6 w-16 rounded-md" />
                <div className="dd-skeleton dd-skeleton-post h-6 w-20 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function JobsContent({ user }: { user: any }) {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/jobs', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Não foi possível consultar as vagas agora.');
        }

        const data = await response.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if ((loadError as Error).name !== 'AbortError') {
          setError('Não foi possível carregar as vagas. Verifique sua conexão e tente novamente.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadJobs();
    return () => controller.abort();
  }, [requestVersion]);

  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const activeFilterCount = getFilterCount(filters);

  const updateTextFilter = (key: 'query' | 'technology' | 'location', value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleLevel = (value: JobLevel) => {
    setFilters((current) => ({
      ...current,
      levels: current.levels.includes(value)
        ? current.levels.filter((item) => item !== value)
        : [...current.levels, value],
    }));
  };

  const toggleModality = (value: JobModality) => {
    setFilters((current) => ({
      ...current,
      modalities: current.modalities.includes(value)
        ? current.modalities.filter((item) => item !== value)
        : [...current.modalities, value],
    }));
  };

  const toggleContract = (value: JobContract) => {
    setFilters((current) => ({
      ...current,
      contracts: current.contracts.includes(value)
        ? current.contracts.filter((item) => item !== value)
        : [...current.contracts, value],
    }));
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="dd-platform-shell dd-platform-shell--fullscreen selection:bg-dd-accent/30 selection:text-dd-text">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-10">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <header className="flex flex-col gap-5 border-b border-dd-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-black tracking-[-0.025em] text-dd-text md:text-4xl">
                Vagas
              </h1>
              <p className="mt-2 max-w-[68ch] text-sm font-medium leading-6 text-dd-muted">
                Encontre oportunidades em tecnologia com etapas práticas que valorizam o que você
                sabe construir.
              </p>
            </div>

            {(user?.role === 'RECRUITER' || user?.role === 'ADMIN') && (
              <Link
                href="/recruiter"
                className="dd-focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-dd-accent px-4 text-sm font-black text-white transition-colors hover:bg-blue-600"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Painel do recrutador
              </Link>
            )}
          </header>

          <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
            <aside
              className="order-first xl:sticky xl:top-6 xl:order-last xl:self-start"
              aria-label="Filtros de vagas"
            >
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                aria-expanded={mobileFiltersOpen}
                aria-controls="jobs-filter-panel"
                className="dd-focus-ring flex min-h-12 w-full items-center justify-between rounded-xl border border-dd-border bg-dd-surface px-4 text-sm font-black text-dd-text xl:hidden"
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-dd-accent" />
                  Filtrar oportunidades
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
                id="jobs-filter-panel"
                className={`${mobileFiltersOpen ? 'mt-3 block' : 'hidden'} xl:block`}
              >
                <JobFiltersPanel
                  filters={filters}
                  activeFilterCount={activeFilterCount}
                  onChange={updateTextFilter}
                  onToggleLevel={toggleLevel}
                  onToggleModality={toggleModality}
                  onToggleContract={toggleContract}
                  onClear={clearFilters}
                />
              </div>
            </aside>

            <section
              className="order-last min-w-0 xl:order-first"
              aria-labelledby="jobs-results-title"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 id="jobs-results-title" className="text-sm font-black text-dd-text">
                    Oportunidades abertas
                  </h2>
                  <p aria-live="polite" className="mt-0.5 text-xs font-medium text-dd-muted">
                    {loading
                      ? 'Atualizando oportunidades...'
                      : `${filteredJobs.length} ${filteredJobs.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}`}
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
                <LoadingJobs />
              ) : error ? (
                <div className="rounded-2xl border border-red-500/35 bg-red-500/10 px-5 py-8 text-center">
                  <CircleAlert aria-hidden="true" className="mx-auto h-8 w-8 text-red-400" />
                  <h3 className="mt-3 text-base font-black text-dd-text">
                    Falha ao carregar as vagas
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
                    Tentar novamente
                  </button>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="rounded-2xl border border-dd-border bg-dd-surface px-5 py-10 text-center">
                  <BriefcaseBusiness aria-hidden="true" className="mx-auto h-9 w-9 text-dd-muted" />
                  <h3 className="mt-3 text-base font-black text-dd-text">
                    {jobs.length === 0
                      ? 'Nenhuma vaga aberta no momento'
                      : 'Nenhuma vaga combina com os filtros'}
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-sm font-medium leading-6 text-dd-muted">
                    {jobs.length === 0
                      ? 'Novas oportunidades aparecerão aqui assim que forem publicadas.'
                      : 'Remova um ou mais filtros para ampliar os resultados da busca.'}
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="dd-focus-ring mt-4 min-h-10 rounded-xl bg-dd-accent px-4 text-sm font-black text-white hover:bg-blue-600"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
