'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpenText, ChevronDown, Code2, Layers, Settings2 } from 'lucide-react';
import {
  availableQuestions,
  configErrors,
  createSession,
  DEFAULT_CONFIG,
  ENADE_YEARS,
  SECTION_LABELS,
  sectionTotals,
  type EnadeConfig,
  type EnadeSectionFilter,
  type EnadeWorkspace,
} from '@/lib/enade/simulator';
import { newEnadeSeed } from './useEnadeSession';
import { useEnadeWorkspace } from './useEnadeWorkspace';
import styles from './EnadeCourse.module.css';

const SECTION_CHOICES: {
  value: EnadeSectionFilter;
  title: string;
  description: string;
  icon: typeof Layers;
}[] = [
  {
    value: 'all',
    title: 'Prova completa',
    description: 'Formação geral e componente específico, como no dia da prova.',
    icon: Layers,
  },
  {
    value: 'general',
    title: 'Só formação geral',
    description: 'Interpretação de texto, atualidades, ética e cidadania.',
    icon: BookOpenText,
  },
  {
    value: 'specific',
    title: 'Só específicas',
    description: 'Questões de ADS: programação, banco de dados, engenharia de software e redes.',
    icon: Code2,
  },
];

function yearsSummary(years: number[]) {
  if (years.length === ENADE_YEARS.length) return 'todas as edições';
  if (!years.length) return 'nenhuma edição';
  if (years.length === 1) return `Enade ${years[0]}`;
  const sorted = [...years].sort();
  const first = ENADE_YEARS.indexOf(sorted[0]);
  const contiguous = sorted.every((year, i) => ENADE_YEARS[first + i] === year);
  return contiguous ? `${sorted[0]}–${sorted[sorted.length - 1]}` : sorted.join(', ');
}

function durationSummary(minutes: number | null) {
  if (minutes === null) return 'sem limite de tempo';
  if (!Number.isFinite(minutes) || minutes <= 0) return 'tempo inválido';
  if (minutes < 60) return `${minutes.toLocaleString('pt-BR')} min`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours}h`;
}

export function EnadeConfiguration({
  userId,
  initialWorkspace,
}: {
  userId: string;
  initialWorkspace?: EnadeWorkspace;
}) {
  const router = useRouter();
  const { workspace, ready, save, saveStatus } = useEnadeWorkspace(userId, initialWorkspace);
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<EnadeConfig>(initialWorkspace?.config || DEFAULT_CONFIG);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (ready && !initialized.current) {
      initialized.current = true;
      if (workspace.config) setConfig(workspace.config);
    }
  }, [ready, workspace.config]);
  const section = config.section ?? 'all';
  const total = availableQuestions(config).length;
  const totals = sectionTotals(config);
  const errors = configErrors(config);
  function update(next: EnadeConfig) {
    setConfig(next);
    setConfirmReplace(false);
  }
  /** Changes that shrink the pool keep the question count inside what is still available. */
  function filter(next: EnadeConfig) {
    const count = availableQuestions(next).length;
    update({ ...next, questionCount: Math.min(next.questionCount || 1, count) });
  }
  function start() {
    if (!ready || errors.length) return;
    const stamp = Date.now();
    const next = createSession(config, newEnadeSeed(), stamp);
    void save({ version: 1, config, session: next, updatedAt: stamp }, true);
    router.push('/trails/enade/personalizado');
  }
  const summary = [
    `${config.questionCount || 0} ${config.questionCount === 1 ? 'questão' : 'questões'}`,
    SECTION_LABELS[section].toLowerCase(),
    yearsSummary(config.years),
    durationSummary(config.durationMinutes),
    config.mode === 'training' ? 'treino' : 'prova',
  ].join(' · ');
  const running = ready && workspace.session && !workspace.session.finishedAt;
  return (
    <section className={styles.configuration} aria-labelledby="custom-title">
      <div className={styles.configurationHeading}>
        <div>
          <h2 id="custom-title">Simulado personalizado</h2>
          <p className={styles.muted}>
            Escolha o conteúdo e comece. Ajuste edições, quantidade e tempo em mais opções.
          </p>
        </div>
      </div>
      {ready && workspace.session && (
        <p className={styles.resumeCustom}>
          <Link href="/trails/enade/personalizado">
            {workspace.session.finishedAt
              ? 'Revisar último personalizado'
              : 'Continuar simulado em andamento'}{' '}
            <ArrowRight size={15} />
          </Link>
        </p>
      )}
      <form
        className={styles.configForm}
        onSubmit={(event) => {
          event.preventDefault();
          if (running) setConfirmReplace(true);
          else start();
        }}
      >
        <fieldset>
          <legend>Conteúdo da prova</legend>
          <div className={styles.sectionChoices}>
            {SECTION_CHOICES.map(({ value, title, description, icon: Icon }) => (
              <label key={value} data-checked={section === value}>
                <input
                  type="radio"
                  name="enade-section"
                  value={value}
                  checked={section === value}
                  disabled={!totals[value]}
                  onChange={() => filter({ ...config, section: value })}
                />
                <span className={styles.sectionIcon} aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className={styles.sectionText}>
                  <strong>{title}</strong>
                  <small>{description}</small>
                  <em>
                    {totals[value]}{' '}
                    {totals[value] === 1 ? 'questão disponível' : 'questões disponíveis'}
                  </em>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          className={styles.moreOptions}
          aria-expanded={open}
          aria-controls="enade-configuration"
          onClick={() => setOpen(!open)}
        >
          <Settings2 size={16} aria-hidden="true" />
          {open ? 'Menos opções' : 'Mais opções'}
          <ChevronDown size={16} aria-hidden="true" data-open={open} />
        </button>

        {open && (
          <div id="enade-configuration" className={styles.advancedOptions}>
            <fieldset>
              <legend>Edições</legend>
              <div className={styles.yearChoices}>
                <label>
                  <input
                    type="checkbox"
                    checked={config.years.length === ENADE_YEARS.length}
                    onChange={(event) =>
                      filter({ ...config, years: event.target.checked ? [...ENADE_YEARS] : [] })
                    }
                  />{' '}
                  Todas
                </label>
                {ENADE_YEARS.map((year) => (
                  <label key={year}>
                    <input
                      type="checkbox"
                      checked={config.years.includes(year)}
                      onChange={(event) =>
                        filter({
                          ...config,
                          years: event.target.checked
                            ? [...config.years, year].sort()
                            : config.years.filter((y) => y !== year),
                        })
                      }
                    />{' '}
                    {year}
                  </label>
                ))}
              </div>
              <div className={styles.yearRange}>
                <label>
                  De
                  <select
                    aria-label="Ano inicial"
                    value={config.years.length ? Math.min(...config.years) : ''}
                    onChange={(e) => {
                      const from = Number(e.target.value);
                      const to = Math.max(from, ...config.years);
                      filter({ ...config, years: ENADE_YEARS.filter((y) => y >= from && y <= to) });
                    }}
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    {ENADE_YEARS.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Até
                  <select
                    aria-label="Ano final"
                    value={config.years.length ? Math.max(...config.years) : ''}
                    onChange={(e) => {
                      const to = Number(e.target.value);
                      const from = Math.min(to, ...(config.years.length ? config.years : [to]));
                      filter({ ...config, years: ENADE_YEARS.filter((y) => y >= from && y <= to) });
                    }}
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    {ENADE_YEARS.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className={styles.checkLine}>
                <input
                  type="checkbox"
                  checked={config.includeDiscursive}
                  onChange={(event) =>
                    filter({ ...config, includeDiscursive: event.target.checked })
                  }
                />{' '}
                Incluir discursivas para autoavaliação
              </label>
              <p className={styles.muted}>
                {total} questões disponíveis. Questões anuladas ficam fora da seleção.
              </p>
            </fieldset>
            <div className={styles.configColumns}>
              <fieldset>
                <legend>Quantidade de questões</legend>
                <label className={styles.fieldLabel} htmlFor="enade-count">
                  Quantidade
                </label>
                <input
                  id="enade-count"
                  className={styles.numberInput}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={total}
                  step={1}
                  value={config.questionCount || ''}
                  onChange={(e) => update({ ...config, questionCount: Number(e.target.value) })}
                />
                <div className={styles.presets}>
                  {[10, 20, 35].map((n) => (
                    <button
                      type="button"
                      key={n}
                      disabled={n > total}
                      aria-pressed={config.questionCount === n}
                      onClick={() => update({ ...config, questionCount: n })}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={!total}
                    aria-pressed={config.questionCount === total}
                    onClick={() => update({ ...config, questionCount: total })}
                  >
                    Todas ({total})
                  </button>
                </div>
              </fieldset>
              <fieldset>
                <legend>Tempo de prova</legend>
                <label className={styles.fieldLabel} htmlFor="enade-duration">
                  Minutos · de 1 a 300
                </label>
                <input
                  id="enade-duration"
                  className={styles.numberInput}
                  type="number"
                  inputMode="decimal"
                  min={1}
                  max={300}
                  step="any"
                  disabled={config.durationMinutes === null}
                  value={config.durationMinutes ?? ''}
                  onChange={(e) => update({ ...config, durationMinutes: Number(e.target.value) })}
                />
                <div className={styles.presets}>
                  {[15, 30, 60, 90].map((n) => (
                    <button
                      type="button"
                      key={n}
                      aria-pressed={config.durationMinutes === n}
                      onClick={() => update({ ...config, durationMinutes: n })}
                    >
                      {n} min
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-pressed={config.durationMinutes === null}
                    onClick={() => update({ ...config, durationMinutes: null })}
                  >
                    Sem tempo
                  </button>
                </div>
              </fieldset>
            </div>
            <div className={styles.configColumns}>
              <fieldset>
                <legend>Ordem</legend>
                <div className={styles.modeChoices}>
                  <label>
                    <input
                      type="radio"
                      name="enade-order"
                      checked={config.order === 'sequential'}
                      onChange={() => update({ ...config, order: 'sequential' })}
                    />
                    <span>
                      Sequencial<small>Segue a ordem das edições e das questões.</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="enade-order"
                      checked={config.order === 'random'}
                      onChange={() => update({ ...config, order: 'random' })}
                    />
                    <span>
                      Aleatória<small>Embaralha questões e alternativas.</small>
                    </span>
                  </label>
                </div>
              </fieldset>
              <fieldset>
                <legend>Modo</legend>
                <div className={styles.modeChoices}>
                  <label>
                    <input
                      type="radio"
                      name="enade-mode"
                      checked={config.mode === 'exam'}
                      onChange={() => update({ ...config, mode: 'exam' })}
                    />
                    <span>
                      Prova<small>Correção e explicações somente no final.</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="enade-mode"
                      checked={config.mode === 'training'}
                      onChange={() => update({ ...config, mode: 'training' })}
                    />
                    <span>
                      Treino<small>Correção comentada após cada resposta.</small>
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>
            {config.includeDiscursive && (
              <p className={styles.muted}>
                Discursivas usam o padrão oficial para autoavaliação e não entram na nota
                automática.
              </p>
            )}
          </div>
        )}

        <div className={styles.startBar}>
          <p className={styles.startSummary} aria-live="polite">
            <span>Seu simulado</span>
            {summary}
          </p>
          {errors.length > 0 && (
            <p className={styles.formError} role="status">
              {errors.join(' ')}
            </p>
          )}
          {confirmReplace ? (
            <div className={styles.confirm}>
              <p>
                Há um simulado personalizado em andamento. Iniciar outro substitui esse rascunho.
              </p>
              <button
                type="button"
                className={styles.primary}
                disabled={!!errors.length}
                onClick={start}
              >
                Substituir e iniciar
              </button>
              <button type="button" onClick={() => setConfirmReplace(false)}>
                Continuar configurando
              </button>
            </div>
          ) : (
            <button
              className={styles.startButton}
              type="submit"
              disabled={!ready || !!errors.length}
            >
              Iniciar simulado <ArrowRight size={17} />
            </button>
          )}
        </div>
        {saveStatus && (
          <p role="status" className={styles.saveStatus}>
            {saveStatus}
          </p>
        )}
      </form>
    </section>
  );
}
