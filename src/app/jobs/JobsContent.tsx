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
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PlatformPageHeader, PlatformPageShell } from '@/components/PlatformPageShell';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './jobs.module.css';

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
    return (
      (!query || searchableText.includes(query)) &&
      (!technology ||
        job.technologies.some((item) => normalizeSearchValue(item).includes(technology))) &&
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
  const timestamp = new Date(createdAt).getTime();
  if (!Number.isFinite(timestamp)) return 'Publicação recente';
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Há 1 dia';
  if (days < 30) return `Há ${days} dias`;
  const months = Math.max(1, Math.floor(days / 30));
  if (months < 12) return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `Há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}
function formatSalary(job: JobItem) {
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
  return 'Salário não informado';
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
    <label htmlFor={id} className={styles.field}>
      <span>{label}</span>
      <span className={styles.inputWrap}>
        <Icon size={18} aria-hidden="true" />
        <input
          id={id}
          type="search"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
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
    <fieldset className={styles.checkGroup}>
      <legend>{legend}</legend>
      <div className={styles.checkOptions}>
        {options.map((option) => (
          <label key={option.value}>
            <input
              name={name}
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
function JobCard({ job }: { job: JobItem }) {
  const location = job.location || job.company.location || 'Local a combinar';
  return (
    <li>
      <Link href={`/jobs/${job.id}`} className={styles.jobLink}>
        <article className={styles.job}>
          <div className={styles.companyAvatar} aria-hidden="true">
            {getCompanyInitials(job.company.name) || <Building2 size={21} />}
          </div>
          <div className={styles.jobBody}>
            <div className={styles.companyLine}>
              <p>
                {job.company.name}
                {job.company.is_verified && (
                  <span className={styles.verified}>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span className="sr-only">Empresa verificada</span>
                  </span>
                )}
              </p>
              <span className={styles.age}>{formatJobAge(job.created_at)}</span>
            </div>
            <h3>{job.title}</h3>
            <div className={styles.meta}>
              <span>
                <MapPin size={15} aria-hidden="true" />
                {getOptionLabel(MODALITY_OPTIONS, job.modality)} · {location}
              </span>
              <span>
                <BriefcaseBusiness size={15} aria-hidden="true" />
                {getOptionLabel(CONTRACT_OPTIONS, job.contract_type)}
              </span>
              <span>
                <Layers3 size={15} aria-hidden="true" />
                {job.stages.length === 0
                  ? 'Etapas a definir'
                  : `${job.stages.length} ${job.stages.length === 1 ? 'etapa' : 'etapas'}`}
              </span>
            </div>
            <p className={styles.salary}>
              <BadgeDollarSign size={16} aria-hidden="true" />
              {formatSalary(job)}
            </p>
            <div className={styles.tags}>
              <span className={styles.level}>{getOptionLabel(LEVEL_OPTIONS, job.level)}</span>
              {job.technologies.slice(0, 4).map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
              {job.technologies.length > 4 && (
                <span>+{job.technologies.length - 4} tecnologias</span>
              )}
            </div>
          </div>
          <ChevronRight className={styles.rowArrow} size={19} aria-hidden="true" />
        </article>
      </Link>
    </li>
  );
}
function LoadingJobs() {
  const { text } = useLocalizedText();
  return (
    <div
      aria-label={text('Carregando vagas abertas', 'Loading open jobs')}
      aria-busy="true"
      className={styles.loading}
    >
      {[0, 1, 2].map((item) => (
        <div key={item} className={styles.loadingRow} aria-hidden="true">
          <div className={`dd-skeleton dd-skeleton-post ${styles.skeletonAvatar}`} />
          <div>
            <div className={`dd-skeleton dd-skeleton-post ${styles.skeletonTitle}`} />
            <div className={`dd-skeleton dd-skeleton-post ${styles.skeletonLine}`} />
            <div className={`dd-skeleton dd-skeleton-post ${styles.skeletonLine}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
export function JobsContent({ user }: { user: any }) {
  const { text } = useLocalizedText();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function loadJobs() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/jobs', { signal: controller.signal });
        if (!response.ok) throw new Error('Não foi possível consultar as vagas agora.');
        const data = await response.json();
        if (!controller.signal.aborted) setJobs(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (!controller.signal.aborted && (loadError as Error).name !== 'AbortError')
          setError('Não foi possível carregar as vagas. Verifique sua conexão e tente novamente.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadJobs();
    return () => controller.abort();
  }, [requestVersion]);
  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const activeFilterCount = getFilterCount(filters);
  const updateTextFilter = (key: 'query' | 'technology' | 'location', value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const toggleFilter = <T extends JobLevel | JobModality | JobContract>(
    key: 'levels' | 'modalities' | 'contracts',
    value: T
  ) => {
    setFilters((current) => {
      const selected = current[key] as T[];
      return {
        ...current,
        [key]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });
  };
  const clearFilters = () => setFilters(EMPTY_FILTERS);
  return (
    <PlatformPageShell user={user}>
      <PlatformPageHeader
        title={text('Vagas', 'Jobs')}
        description="Encontre sua próxima oportunidade em tecnologia. Confira os requisitos, a remuneração e as etapas antes de se candidatar."
        actions={
          (user?.role === 'RECRUITER' || user?.role === 'ADMIN') && (
            <Link
              href="/recruiter"
              aria-label="Painel do recrutador"
              className={styles.recruiterLink}
            >
              Recrutador
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          )
        }
      />
      <div className={styles.content}>
        <section className={styles.searchArea} aria-label="Buscar e filtrar vagas">
          <FilterTextField
            id="jobs-query"
            label="Cargo, empresa ou tecnologia"
            placeholder="Buscar oportunidades"
            value={filters.query}
            onChange={(value) => updateTextFilter('query', value)}
            icon={Search}
          />
          <div className={styles.filterBar}>
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="jobs-filter-panel"
              className={styles.filterToggle}
            >
              <SlidersHorizontal size={17} aria-hidden="true" />
              {text('Filtrar oportunidades', 'Filter opportunities')}
              {activeFilterCount > 0 && (
                <span className={styles.filterCount}>{activeFilterCount}</span>
              )}
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={filtersOpen ? styles.chevronOpen : undefined}
              />
            </button>
            {activeFilterCount > 0 && (
              <button type="button" onClick={clearFilters} className={styles.clearButton}>
                Limpar filtros
              </button>
            )}
          </div>
          <div id="jobs-filter-panel" hidden={!filtersOpen} className={styles.filterPanel}>
            <div className={styles.panelHeader}>
              <h2>Refinar busca</h2>
              <button
                type="button"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className={styles.clearButton}
              >
                <RefreshCw size={14} aria-hidden="true" />
                Limpar
              </button>
            </div>
            <div className={styles.filterFields}>
              <FilterTextField
                id="jobs-technology"
                label="Tecnologia"
                placeholder="Ex.: React, Java"
                value={filters.technology}
                onChange={(value) => updateTextFilter('technology', value)}
                icon={Code2}
              />
              <FilterTextField
                id="jobs-location"
                label={text('Localização', 'Location')}
                placeholder="Cidade ou estado"
                value={filters.location}
                onChange={(value) => updateTextFilter('location', value)}
                icon={MapPin}
              />
            </div>
            <div className={styles.filterGroups}>
              <CheckboxGroup
                legend="Modelo de trabalho"
                name="modality"
                options={MODALITY_OPTIONS}
                selected={filters.modalities}
                onToggle={(value) => toggleFilter('modalities', value)}
              />
              <CheckboxGroup
                legend={text('Nível', 'Level')}
                name="level"
                options={LEVEL_OPTIONS}
                selected={filters.levels}
                onToggle={(value) => toggleFilter('levels', value)}
              />
              <CheckboxGroup
                legend="Modelo de contrato"
                name="contract"
                options={CONTRACT_OPTIONS}
                selected={filters.contracts}
                onToggle={(value) => toggleFilter('contracts', value)}
              />
            </div>
          </div>
        </section>
        <section aria-labelledby="jobs-results-title" className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 id="jobs-results-title">Oportunidades abertas</h2>
              <p aria-live="polite">
                {loading
                  ? 'Atualizando oportunidades...'
                  : error
                    ? 'Consulta indisponível'
                    : `${filteredJobs.length} ${filteredJobs.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}`}
              </p>
            </div>
            {!loading && !error && filteredJobs.length > 0 && (
              <span className={styles.sortLabel}>Mais recentes</span>
            )}
          </div>
          {loading ? (
            <LoadingJobs />
          ) : error ? (
            <div className={styles.empty} role="alert">
              <CircleAlert size={30} aria-hidden="true" />
              <h3>Falha ao carregar as vagas</h3>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setRequestVersion((version) => version + 1)}
                className={styles.secondaryButton}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Tentar novamente
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className={styles.empty}>
              <BriefcaseBusiness size={30} aria-hidden="true" />
              <h3>
                {jobs.length === 0
                  ? 'Nenhuma vaga aberta no momento'
                  : 'Nenhuma vaga combina com os filtros'}
              </h3>
              <p>
                {jobs.length === 0
                  ? 'Novas oportunidades aparecerão aqui assim que forem publicadas.'
                  : 'Remova um ou mais filtros para ampliar os resultados da busca.'}
              </p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className={styles.secondaryButton}>
                  Mostrar todas as vagas
                </button>
              )}
            </div>
          ) : (
            <ul className={styles.jobList}>
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </PlatformPageShell>
  );
}
